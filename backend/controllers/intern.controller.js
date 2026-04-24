import Contest from "../models/contests.js";
import Question from "../models/question.js";
import Attempt from "../models/attempt.js";
import Intern from "../models/intern.js";

export const startQuiz = async (req, res) => {
  try {
    const { contestId } = req.body;
    const internObjectId = req.user._id;
    const internUniqueId = req.user.uniqueId;

    if (!contestId) {
      return res.status(400).json({ message: "❌ contestId is required." });
    }

    // 1. Find Contest
    const contest = await Contest.findOne({ contestId });
    if (!contest) {
      return res.status(404).json({ message: "❌ Contest not found." });
    }

    // 2. Check Timing
    const now = new Date();
    if (now < contest.startTime) {
      return res
        .status(400)
        .json({ message: "❌ This contest has not started yet." });
    }
    if (now > contest.expiryDate) {
      return res.status(400).json({ message: "❌ This contest has expired." });
    }

    // 3. Check for Existing Submission
    const existingAttempt = await Attempt.findOne({ internId: internUniqueId, contestId: contest._id });
    if (existingAttempt && existingAttempt.isSubmitted) {
      return res.status(403).json({
        message:
          "❌ You have already submitted this quiz. Multiple attempts are not allowed.",
      });
    }

    // 4. Fetch Questions (Without Correct Answers)
    const questions = await Question.find({ contestId }).select(
      "-correctAnswer",
    );

    if (!questions || questions.length === 0) {
      return res
        .status(404)
        .json({ message: "❌ No questions found for this contest." });
    }

    res.status(200).json({
      success: true,
      message: "🚀 Quiz started successfully.",
      data: {
        contestDetails: {
          contestId: contest.contestId,
          contestTitle: contest.contestTitle,
          description: contest.description,
          domain: contest.domain,
          duration: contest.duration,
          expiryDate: contest.expiryDate,
        },
        questions,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "❌ Internal server error.", error: error.message });
  }
};

export const submitQuiz = async (req, res) => {
  try {
    const { contestId, domain, answers } = req.body;
    const internUniqueId = req.user.uniqueId;
    const Domain = (domain || "").trim().toUpperCase();

    // 1. Check if Contest exists and is ACTIVE
    const contest = await Contest.findOne({ contestId });
    if (!contest) {
      return res.status(404).json({ message: "❌ Contest not found." });
    }

    const now = new Date();
    if (now < contest.startTime) {
      return res
        .status(400)
        .json({ message: "❌ This contest hasn't started yet." });
    }
    if (now > contest.expiryDate) {
      return res.status(400).json({ message: "❌ This contest has expired." });
    }

    let score = 0;

    // Get all questions
    const questionIds = answers.map((a) => a.questionId);
    const questions = await Question.find({ _id: { $in: questionIds } });

    const questionMap = {};
    questions.forEach((q) => {
      questionMap[q._id] = q;
    });

    // Calculate score
    const evaluatedAnswers = answers.map((a) => {
      const question = questionMap[a.questionId];
      
      // If skipped or out of bounds, it's incorrect
      const userAnswerText = (a.selectedAnswer !== null && question.options[a.selectedAnswer]) 
        ? question.options[a.selectedAnswer] 
        : null;

      const isCorrect = question.correctAnswer === userAnswerText;

      if (isCorrect) score++;

      return {
        questionId: a.questionId,
        selectedAnswer: userAnswerText || "Skipped",
        isCorrect,
      };
    });

    // Save attempt
    const attempt = await Attempt.create({
      internId: internUniqueId,
      contestId: contest._id,
      domain: Domain,
      score,
      totalQuestions: questions.length,
      timeTaken: req.body.timeTaken,
      answers: evaluatedAnswers,
      isSubmitted: true,
      endTime: now,
    });

    res.json({
      success: true,
      score,
      total: questions.length,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getUpcomingQuizzes = async (req, res) => {
  try {
    const domain = req.user.domain;
    if (!domain) {
      return res.status(400).json({ message: "❌ Intern domain not found." });
    }

    const Domain = domain.trim().toUpperCase();
    const now = new Date();

    // Find all contests in user's domain that haven't expired yet
    const contests = await Contest.find({
      domain: Domain,
      expiryDate: { $gt: now },
    }).sort({ startTime: 1 });

    res.status(200).json({
      success: true,
      title: contests.length > 0 ? contests[0].contestTitle : "None",
      description:
        contests.length > 0 ? contests[0].description : "No upcoming quizzes.",
      count: contests.length,
      data: contests,
    });
  } catch (error) {
    res.status(500).json({ message: "❌ Server error.", error: error.message });
  }
};
export const getInternHistory = async (req, res) => {
  try {
    const internUniqueId = req.user.uniqueId;

    // Fetch all results for the logged-in intern from Attempt model
    const history = await Attempt.find({ internId: internUniqueId, isSubmitted: true })
      .populate("contestId", "contestTitle description")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: history.length,
      history,
    });
  } catch (error) {
    res.status(500).json({ message: "❌ Server error.", error: error.message });
  }
};

export const getInternStats = async (req, res) => {
  try {
    const user = req.user;
    const internUniqueId = user.uniqueId;

    // 1. Get all attempts for this intern
    const attempts = await Attempt.find({ internId: internUniqueId, isSubmitted: true });
    const totalScore = attempts.reduce((sum, att) => sum + att.score, 0);
    const recentAttempt = await Attempt.findOne({ internId: internUniqueId, isSubmitted: true })
      .sort({ createdAt: -1 });

    // 2. Calculate Rankings (Based on badges first, then total score)
    // For performance in large systems, you'd cache this or use aggregation
    const allInterns = await Intern.find({ status: "Active" }).select("uniqueId domain badgesEarned");
    
    // We need total scores for all interns to break ties in ranking
    // This is expensive if there are thousands of interns, but works for now.
    const internAttemptStats = await Attempt.aggregate([
      { $match: { isSubmitted: true } },
      { $group: { _id: "$internId", totalPoints: { $sum: "$score" } } }
    ]);

    const statsMap = {};
    internAttemptStats.forEach(s => { statsMap[s._id] = s.totalPoints; });

    const rankedInterns = allInterns.map(i => ({
      uniqueId: i.uniqueId,
      domain: i.domain,
      badges: i.badgesEarned,
      points: statsMap[i.uniqueId] || 0
    })).sort((a, b) => b.badges - a.badges || b.points - a.points);

    const overallRank = rankedInterns.findIndex(i => i.uniqueId === internUniqueId) + 1;
    
    const userDomainNormalized = user.domain.trim().toUpperCase();
    const domainRanked = rankedInterns.filter(i => (i.domain || '').trim().toUpperCase() === userDomainNormalized);
    const domainRank = domainRanked.findIndex(i => i.uniqueId === internUniqueId) + 1;

    const responseData = {
        uniqueId: user.uniqueId,
        name: user.name,
        email: user.email,
        mobile: user.mobile || null, // Ensure stringification doesn't drop the key
        role: user.role,
        domain: user.domain,
        overallRank: overallRank || "N/A",
        totalInterns: allInterns.length,
        domainRank: domainRank || "N/A",
        domainInterns: domainRanked.length,
        totalScore,
        recentScore: recentAttempt ? Math.round((recentAttempt.score / recentAttempt.totalQuestions) * 100) : 0,
        badgesEarned: user.badgesEarned,
        status: user.status,
        joiningDate: user.joiningDate
    };

    console.log("Backend profile API response object:", responseData);

    res.status(200).json({
      success: true,
      data: responseData
    });

  } catch (error) {
    res.status(500).json({ message: "❌ Server error.", error: error.message });
  }
};
