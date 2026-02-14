const { supabase } = require("../config/supabase");

// GET /api/finance/:profileId?month=YYYY-MM
const getTransactions = async (req, res, next) => {
  try {
    const { profileId } = req.params;
    const { month } = req.query; // optional YYYY-MM filter

    let query = supabase
      .from("transactions")
      .select("*")
      .eq("profile_id", profileId)
      .order("transaction_date", { ascending: false })
      .order("created_at", { ascending: false });

    // Filter by month if provided
    if (month) {
      const startDate = `${month}-01`;
      const [y, m] = month.split("-").map(Number);
      const lastDay = new Date(y, m, 0).getDate();
      const endDate = `${month}-${String(lastDay).padStart(2, "0")}`;
      query = query.gte("transaction_date", startDate).lte("transaction_date", endDate);
    }

    const { data, error } = await query;
    if (error) throw { statusCode: 400, message: error.message };

    // Calculate summary
    const summary = data.reduce(
      (acc, t) => {
        const amt = Number(t.amount);
        if (t.type === "income") acc.total_income += amt;
        else acc.total_expense += amt;
        return acc;
      },
      { total_income: 0, total_expense: 0 }
    );
    summary.balance = summary.total_income - summary.total_expense;

    // Category-wise breakdown
    const categoryBreakdown = {};
    data.forEach((t) => {
      if (!categoryBreakdown[t.category]) {
        categoryBreakdown[t.category] = { type: t.type, total: 0, count: 0 };
      }
      categoryBreakdown[t.category].total += Number(t.amount);
      categoryBreakdown[t.category].count += 1;
    });

    res.json({ success: true, data, summary, categoryBreakdown });
  } catch (err) {
    next(err);
  }
};

// POST /api/finance
const createTransaction = async (req, res, next) => {
  try {
    const { profile_id, type, amount, category, title, note, transaction_date } = req.body;

    if (!profile_id || !type || !amount || !category || !title) {
      throw {
        statusCode: 400,
        message: "profile_id, type, amount, category, and title are required",
      };
    }

    if (!["income", "expense"].includes(type)) {
      throw { statusCode: 400, message: "type must be 'income' or 'expense'" };
    }

    const { data, error } = await supabase
      .from("transactions")
      .insert({
        profile_id,
        type,
        amount,
        category,
        title,
        note: note || null,
        transaction_date: transaction_date || new Date().toISOString().split("T")[0],
      })
      .select()
      .single();

    if (error) throw { statusCode: 400, message: error.message };

    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// PUT /api/finance/:id
const updateTransaction = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data, error } = await supabase
      .from("transactions")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw { statusCode: 400, message: error.message };

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/finance/:id
const deleteTransaction = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { error } = await supabase.from("transactions").delete().eq("id", id);
    if (error) throw { statusCode: 400, message: error.message };

    res.json({ success: true, message: "Transaction deleted" });
  } catch (err) {
    next(err);
  }
};

// GET /api/finance/:profileId/summary?month=YYYY-MM
const getMonthlySummary = async (req, res, next) => {
  try {
    const { profileId } = req.params;
    const { month } = req.query;

    if (!month) {
      throw { statusCode: 400, message: "month query param (YYYY-MM) is required" };
    }

    const startDate = `${month}-01`;
    const [y, m] = month.split("-").map(Number);
    const lastDay = new Date(y, m, 0).getDate();
    const endDate = `${month}-${String(lastDay).padStart(2, "0")}`;

    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("profile_id", profileId)
      .gte("transaction_date", startDate)
      .lte("transaction_date", endDate);

    if (error) throw { statusCode: 400, message: error.message };

    const income = data.filter((t) => t.type === "income").reduce((s, t) => s + Number(t.amount), 0);
    const expense = data.filter((t) => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0);

    // Get budget for this month
    const { data: budgetData } = await supabase
      .from("monthly_budgets")
      .select("*")
      .eq("profile_id", profileId)
      .eq("month", month)
      .single();

    res.json({
      success: true,
      data: {
        month,
        income,
        expense,
        balance: income - expense,
        budget: budgetData ? Number(budgetData.budget_amount) : null,
        budget_remaining: budgetData ? Number(budgetData.budget_amount) - expense : null,
        transaction_count: data.length,
      },
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/finance/:profileId/budget
const setBudget = async (req, res, next) => {
  try {
    const { profileId } = req.params;
    const { month, budget_amount } = req.body;

    if (!month || !budget_amount) {
      throw { statusCode: 400, message: "month (YYYY-MM) and budget_amount are required" };
    }

    const { data, error } = await supabase
      .from("monthly_budgets")
      .upsert(
        { profile_id: profileId, month, budget_amount },
        { onConflict: "profile_id,month" }
      )
      .select()
      .single();

    if (error) throw { statusCode: 400, message: error.message };

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getMonthlySummary,
  setBudget,
};
