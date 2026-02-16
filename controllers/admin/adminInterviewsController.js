const { supabase } = require("../../config/supabase");

// GET /api/admin/interviews
const listInterviews = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 30 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = supabase
      .from("interviews")
      .select("*, profiles(name, email)", { count: "exact" });

    if (status) query = query.eq("status", status);

    query = query.order("created_at", { ascending: false })
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

// GET /api/admin/interviews/stats
const getInterviewStats = async (req, res, next) => {
  try {
    const { data: interviews, error } = await supabase
      .from("interviews")
      .select("status");

    if (error) throw { statusCode: 400, message: error.message };

    const statusBreakdown = {};
    interviews.forEach((i) => {
      statusBreakdown[i.status] = (statusBreakdown[i.status] || 0) + 1;
    });

    res.json({
      success: true,
      data: {
        total: interviews.length,
        byStatus: Object.entries(statusBreakdown).map(([status, count]) => ({ status, count })),
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { listInterviews, getInterviewStats };
