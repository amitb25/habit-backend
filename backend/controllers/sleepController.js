const { supabase } = require("../config/supabase");

// GET /api/sleep/:profileId
const getSleepLogs = async (req, res, next) => {
  try {
    const { profileId } = req.params;
    const limit = parseInt(req.query.limit) || 30;

    const { data, error } = await supabase
      .from("sleep_logs")
      .select("*")
      .eq("profile_id", profileId)
      .order("sleep_date", { ascending: false })
      .limit(limit);

    if (error) throw { statusCode: 400, message: error.message };

    // Calculate summary
    const recent = data.slice(0, 7);
    const avgDuration = recent.length
      ? Math.round((recent.reduce((s, l) => s + (parseFloat(l.duration_hours) || 0), 0) / recent.length) * 10) / 10
      : 0;

    const qualityMap = { poor: 1, fair: 2, good: 3, excellent: 4 };
    const avgQualityNum = recent.length
      ? recent.reduce((s, l) => s + (qualityMap[l.quality] || 0), 0) / recent.length
      : 0;
    const avgQuality = avgQualityNum >= 3.5 ? "excellent" : avgQualityNum >= 2.5 ? "good" : avgQualityNum >= 1.5 ? "fair" : "poor";

    res.json({
      success: true,
      data,
      summary: { avgDuration, avgQuality, totalLogs: data.length },
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/sleep
const createSleepLog = async (req, res, next) => {
  try {
    const { profile_id, sleep_date, bedtime, wake_time, quality, notes } = req.body;

    if (!profile_id || !sleep_date || !bedtime || !wake_time) {
      throw { statusCode: 400, message: "profile_id, sleep_date, bedtime, wake_time are required" };
    }

    // Calculate duration
    const [bH, bM] = bedtime.split(":").map(Number);
    const [wH, wM] = wake_time.split(":").map(Number);
    let bedMins = bH * 60 + bM;
    let wakeMins = wH * 60 + wM;
    if (wakeMins <= bedMins) wakeMins += 24 * 60; // next day
    const duration_hours = Math.round(((wakeMins - bedMins) / 60) * 100) / 100;

    const { data, error } = await supabase
      .from("sleep_logs")
      .insert({ profile_id, sleep_date, bedtime, wake_time, duration_hours, quality: quality || "good", notes })
      .select()
      .single();

    if (error) throw { statusCode: 400, message: error.message };
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// PUT /api/sleep/:id
const updateSleepLog = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { bedtime, wake_time, quality, notes } = req.body;

    const updates = {};
    if (bedtime !== undefined) updates.bedtime = bedtime;
    if (wake_time !== undefined) updates.wake_time = wake_time;
    if (quality !== undefined) updates.quality = quality;
    if (notes !== undefined) updates.notes = notes;

    // Recalculate duration if times changed
    if (updates.bedtime || updates.wake_time) {
      const { data: existing } = await supabase.from("sleep_logs").select("bedtime, wake_time").eq("id", id).single();
      const bt = updates.bedtime || existing.bedtime;
      const wt = updates.wake_time || existing.wake_time;
      const [bH, bM] = bt.split(":").map(Number);
      const [wH, wM] = wt.split(":").map(Number);
      let bedMins = bH * 60 + bM;
      let wakeMins = wH * 60 + wM;
      if (wakeMins <= bedMins) wakeMins += 24 * 60;
      updates.duration_hours = Math.round(((wakeMins - bedMins) / 60) * 100) / 100;
    }

    const { data, error } = await supabase
      .from("sleep_logs")
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

// DELETE /api/sleep/:id
const deleteSleepLog = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from("sleep_logs").delete().eq("id", id);
    if (error) throw { statusCode: 400, message: error.message };
    res.json({ success: true, message: "Sleep log deleted" });
  } catch (err) {
    next(err);
  }
};

// GET /api/sleep/analytics/:profileId — last 7 days
const getSleepAnalytics = async (req, res, next) => {
  try {
    const { profileId } = req.params;
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(today.getDate() - 6);

    const { data, error } = await supabase
      .from("sleep_logs")
      .select("*")
      .eq("profile_id", profileId)
      .gte("sleep_date", weekAgo.toISOString().split("T")[0])
      .lte("sleep_date", today.toISOString().split("T")[0])
      .order("sleep_date", { ascending: true });

    if (error) throw { statusCode: 400, message: error.message };

    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const entry = data.find((e) => e.sleep_date === dateStr);
      days.push({
        date: dateStr,
        day: d.toLocaleDateString("en", { weekday: "short" }),
        hours: entry ? parseFloat(entry.duration_hours) : 0,
        quality: entry ? entry.quality : null,
        bedtime: entry ? entry.bedtime : null,
        wake_time: entry ? entry.wake_time : null,
      });
    }

    res.json({ success: true, data: { days } });
  } catch (err) {
    next(err);
  }
};

module.exports = { getSleepLogs, createSleepLog, updateSleepLog, deleteSleepLog, getSleepAnalytics };
