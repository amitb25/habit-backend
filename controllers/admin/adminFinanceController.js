const { supabase } = require("../../config/supabase");

// GET /api/admin/finance/overview
const getFinanceOverview = async (req, res, next) => {
  try {
    const { data: transactions, error } = await supabase
      .from("transactions")
      .select("type, amount, category");

    if (error) throw { statusCode: 400, message: error.message };

    let totalIncome = 0;
    let totalExpense = 0;
    const categoryBreakdown = {};

    transactions.forEach((t) => {
      const amt = parseFloat(t.amount);
      if (t.type === "income") totalIncome += amt;
      else totalExpense += amt;
      categoryBreakdown[t.category] = (categoryBreakdown[t.category] || 0) + amt;
    });

    res.json({
      success: true,
      data: {
        totalIncome,
        totalExpense,
        netBalance: totalIncome - totalExpense,
        totalTransactions: transactions.length,
        topCategories: Object.entries(categoryBreakdown)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .map(([category, amount]) => ({ category, amount })),
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/finance/transactions
const listTransactions = async (req, res, next) => {
  try {
    const { type, page = 1, limit = 30 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = supabase
      .from("transactions")
      .select("*, profiles(name, email)", { count: "exact" });

    if (type) query = query.eq("type", type);

    query = query.order("transaction_date", { ascending: false })
      .range(offset, offset + parseInt(limit) - 1);

    const { data, error, count } = await query;
    if (error) throw { statusCode: 400, message: error.message };

    res.json({
      success: true,
      data,
      pagination: { page: parseInt(page), limit: parseInt(limit), total: count || 0, pages: Math.ceil((count || 0) / parseInt(limit)) },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getFinanceOverview, listTransactions };
