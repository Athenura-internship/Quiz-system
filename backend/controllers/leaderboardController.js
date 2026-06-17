import Intern from "../models/intern.js";
import Attempt from "../models/attempt.js";
import Badge from "../models/badges.js";
import Contest from "../models/contests.js";

// @desc    Finalize contest and award Gold, Silver, and Bronze badges
// @access  Admin
export const finalizeContest = async (req, res) => {
  try {
    const { contestId } = req.body;

    if (!contestId) {
      return res.status(400).json({ success: false, message: "❌ contestId is required." });
    }

    const contest = await Contest.findById(contestId);
    if (!contest) {
      return res.status(404).json({ success: false, message: "❌ Contest not found." });
    }

    // 1. Identify the winners (Top 3)
    // Winner Logic: Highest score, then lowest timeTaken
    const topAttempts = await Attempt.find({ contestId: contest._id, isSubmitted: true })
      .sort({ score: -1, timeTaken: 1 })
      .limit(3);

    if (topAttempts.length === 0) {
      return res.status(404).json({ success: false, message: "❌ No submissions found for this contest." });
    }

    // 2. Check if badges already exist for this contest
    const existingBadge = await Badge.findOne({ contestId: contest._id });
    if (existingBadge) {
       return res.status(400).json({ success: false, message: "❌ Winners already finalized for this contest." });
    }

    const badgeTypes = ["Gold", "Silver", "Bronze"];
    const awardedBadges = [];

    // 3. Award badges to top 3
    for (let i = 0; i < topAttempts.length; i++) {
      const attempt = topAttempts[i];
      const internId = attempt.internId;
      const badgeTitle = `${badgeTypes[i]} Badge`;

      // Create Badge entry
      const badge = await Badge.create({
        internId,
        contestId: contest._id,
        badgeName: `${badgeTitle} - ${contest.domain}`
      });

      awardedBadges.push({ internId, badge: badgeTitle });

      // 4. Update Intern model
      const intern = await Intern.findOne({ uniqueId: internId });
      if (intern) {
        intern.badgesEarned += 1;

        // 5. Intern of the Month Logic (3 badges in current month)
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const badgesThisMonth = await Badge.countDocuments({
          internId,
          dateAwarded: { $gte: startOfMonth }
        });

        if (badgesThisMonth >= 3) {
          intern.isInternOfTheMonth = true;
        }

        await intern.save();
      }
    }

    // 6. Mark contest as finalized
    contest.awardGiven = true;
    await contest.save();

    res.status(200).json({
      success: true,
      message: `✅ Contest finalized. Winners awarded: Gold, Silver, and Bronze.`,
      data: awardedBadges
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Get leaderboard for a specific contest
// @route   GET /api/leaderboard/contest/:contestId
// @access  Protected
export const getContestLeaderboard = async (req, res) => {
  try {
    const { contestId } = req.params;

    const contest = await Contest.findById(contestId);
    if (!contest) {
      return res.status(404).json({ success: false, message: "❌ Contest not found." });
    }

    const now = new Date();
    const start = new Date(contest.startTime);
    const end = new Date(contest.expiryDate);
    let status = "Completed";
    if (now < start) status = "Upcoming";
    else if (now >= start && now <= end) status = "Ongoing";

    if (status !== "Completed") {
      return res.status(403).json({ 
        success: false, 
        message: "Results are available only after the contest is completed.",
        status 
      });
    }

    // Fetch all submitted attempts for this contest
    const attempts = await Attempt.find({ contestId: contest._id, isSubmitted: true })
      .sort({ score: -1, timeTaken: 1 });

    // Since internId is a String in Attempt (uniqueId), populate won't work.
    // Fetch intern details manually
    const internIds = attempts.map(a => a.internId);
    const interns = await Intern.find({ uniqueId: { $in: internIds } });
    const internMap = interns.reduce((acc, intern) => {
      acc[intern.uniqueId] = intern;
      return acc;
    }, {});

    // Check if finalized to know if we should show badge labels
    const badges = await Badge.find({ contestId: contest._id });
    const isFinalized = badges.length > 0;

    const rankedParticipants = attempts.map((attempt, index) => {
      let badgeLabel = null;
      if (isFinalized && index < 3) {
        const labels = ["Gold Badge", "Silver Badge", "Bronze Badge"];
        badgeLabel = labels[index];
      }

      const intern = internMap[attempt.internId];

      return {
        rank: index + 1,
        name: intern?.name || "Unknown Intern",
        uniqueId: attempt.internId,
        score: attempt.score,
        timeTaken: attempt.timeTaken,
        badgeAwarded: badgeLabel,
        totalBadges: intern?.badgesEarned || 0,
      };
    });

    res.status(200).json({
      success: true,
      data: {
        title: contest.contestTitle,
        domain: contest.domain,
        date: contest.date,
        totalQuestions: contest.questionCount || 0,
        isFinalized,
        participants: rankedParticipants
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Get overall leaderboard (top 10 based on total badges)
// @route   GET /api/leaderboard/overall
// @access  Protected
export const getOverallLeaderboard = async (req, res) => {
  try {
    // 1. Get all active interns
    const interns = await Intern.find({ status: "Active" })
      .select("name uniqueId email domain badgesEarned isInternOfTheMonth");

    // 2. Fetch total scores from Attempt model for all interns
    const scoreaggregation = await Attempt.aggregate([
      { $match: { isSubmitted: true } },
      { $group: { _id: "$internId", totalScore: { $sum: "$score" } } }
    ]);

    const scoreMap = scoreaggregation.reduce((acc, curr) => {
      acc[curr._id] = curr.totalScore;
      return acc;
    }, {});

    // 3. Merge and sort
    const enrichedInterns = interns.map(intern => ({
      ...intern._doc,
      totalScore: scoreMap[intern.uniqueId] || 0
    })).sort((a, b) => b.badgesEarned - a.badgesEarned || b.totalScore - a.totalScore)
      .slice(0, 10);

    res.status(200).json({
      success: true,
      count: enrichedInterns.length,
      data: enrichedInterns,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

// @desc    Get domain-wise leaderboard (top 10 based on badges)
// @route   GET /api/leaderboard/domain/:domain
// @access  Protected
export const getDomainLeaderboard = async (req, res) => {
  try {
    const { domain } = req.params;

    const interns = await Intern.find({
      domain: { $regex: domain, $options: "i" },
      status: "Active"
    })
      .select("name uniqueId email domain badgesEarned isInternOfTheMonth");

    const internIds = interns.map(i => i.uniqueId);
    const scoreaggregation = await Attempt.aggregate([
      { $match: { internId: { $in: internIds }, isSubmitted: true } },
      { $group: { _id: "$internId", totalScore: { $sum: "$score" } } }
    ]);

    const scoreMap = scoreaggregation.reduce((acc, curr) => {
      acc[curr._id] = curr.totalScore;
      return acc;
    }, {});

    const enrichedInterns = interns.map(intern => ({
      ...intern._doc,
      totalScore: scoreMap[intern.uniqueId] || 0
    })).sort((a, b) => b.badgesEarned - a.badgesEarned || b.totalScore - a.totalScore)
      .slice(0, 10);

    res.status(200).json({
      success: true,
      count: enrichedInterns.length,
      searchedDomain: domain,
      data: enrichedInterns,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

// @desc    Get dashboard statistics for Admin Hall of Fame
// @route   GET /api/leaderboard/stats
// @access  Protected
export const getLeaderboardStats = async (req, res) => {
  try {
    // 1. Total Interns Ranked
    const totalInternsRanked = await Intern.countDocuments({});

    // 2. Total Badges Distributed
    const badgeAggregation = await Intern.aggregate([
      { $group: { _id: null, total: { $sum: "$badgesEarned" } } }
    ]);
    const totalBadgesDistributed = badgeAggregation.length > 0 ? badgeAggregation[0].total : 0;

    // 3. Average Score
    const attemptAggregation = await Attempt.aggregate([
      { $match: { isSubmitted: true } },
      { $group: { _id: null, avgScore: { $avg: "$score" } } }
    ]);
    const averageScore = attemptAggregation.length > 0 ? Math.round(attemptAggregation[0].avgScore) : 0;

    // 4. Current Month Champions (interns with isInternOfTheMonth = true)
    const currentMonthChampions = await Intern.countDocuments({ isInternOfTheMonth: true });

    res.status(200).json({
      success: true,
      data: {
        totalInternsRanked,
        totalBadgesDistributed,
        averageScore,
        currentMonthChampions
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};