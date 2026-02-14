const { supabase } = require("../config/supabase");

// GET /api/debts/:profileId
const getDebts = async (req, res, next) => {
  try {
    const { profileId } = req.params;

    const { data, error } = await supabase
      .from("debts")
      .select("*")
      .eq("profile_id", profileId)
      .order("is_cleared", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) throw { statusCode: 400, message: error.message };

    // Calculate summary
    const summary = data.reduce(
      (acc, debt) => ({
        total_debt: acc.total_debt + Number(debt.total_amount),
        total_paid: acc.total_paid + Number(debt.paid_amount),
        total_remaining: acc.total_remaining + Number(debt.remaining_amount),
      }),
      { total_debt: 0, total_paid: 0, total_remaining: 0 }
    );

    res.json({ success: true, data, summary });
  } catch (err) {
    next(err);
  }
};

// POST /api/debts
const createDebt = async (req, res, next) => {
  try {
    const { profile_id, lender_name, description, total_amount, due_date } =
      req.body;

    if (!profile_id || !lender_name || !total_amount) {
      throw {
        statusCode: 400,
        message: "profile_id, lender_name, and total_amount are required",
      };
    }

    const { data, error } = await supabase
      .from("debts")
      .insert({ profile_id, lender_name, description, total_amount, due_date })
      .select()
      .single();

    if (error) throw { statusCode: 400, message: error.message };

    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// POST /api/debts/:id/pay — Record a payment
const recordPayment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { amount, note } = req.body;

    if (!amount || amount <= 0) {
      throw { statusCode: 400, message: "A valid payment amount is required" };
    }

    // Fetch current debt
    const { data: debt, error: fetchError } = await supabase
      .from("debts")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError) throw { statusCode: 404, message: "Debt not found" };

    if (debt.is_cleared) {
      throw { statusCode: 400, message: "This debt is already fully paid" };
    }

    const newPaid = Number(debt.paid_amount) + Number(amount);

    if (newPaid > Number(debt.total_amount)) {
      throw {
        statusCode: 400,
        message: `Payment exceeds remaining balance. Max payable: ${debt.remaining_amount}`,
      };
    }

    // Insert payment record
    const { error: payError } = await supabase.from("debt_payments").insert({
      debt_id: id,
      profile_id: debt.profile_id,
      amount,
      note,
    });

    if (payError) throw { statusCode: 400, message: payError.message };

    // Update debt paid_amount (remaining_amount auto-calculates via generated column)
    const { data, error } = await supabase
      .from("debts")
      .update({ paid_amount: newPaid })
      .eq("id", id)
      .select()
      .single();

    if (error) throw { statusCode: 400, message: error.message };

    res.json({ success: true, data, message: "Payment recorded" });
  } catch (err) {
    next(err);
  }
};

// GET /api/debts/:id/payments — Get payment history
const getPayments = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("debt_payments")
      .select("*")
      .eq("debt_id", id)
      .order("paid_on", { ascending: false });

    if (error) throw { statusCode: 400, message: error.message };

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/debts/:id
const deleteDebt = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { error } = await supabase.from("debts").delete().eq("id", id);

    if (error) throw { statusCode: 400, message: error.message };

    res.json({ success: true, message: "Debt deleted" });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDebts,
  createDebt,
  recordPayment,
  getPayments,
  deleteDebt,
};
