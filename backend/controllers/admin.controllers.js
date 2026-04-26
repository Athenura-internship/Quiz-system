import * as Groq_questions from "../utils/groq_Questions.js";
import mongoose from "mongoose";
import Question from "../models/question.js";
import Intern from "../models/intern.js";
import Contest from "../models/contests.js";
import Attempt from "../models/attempt.js";
import Badge from "../models/badges.js";
import xlsx from "xlsx";
import "dotenv/config";
import { createContestID } from "../utils/createContestID.js";

// Helper to find value in row by case-insensitive key search and common variations
const getRowValue = (row, keys) => {
  const rowKeys = Object.keys(row);
  for (const k of keys) {
    const match = rowKeys.find(rk => rk.toLowerCase().replace(/[\s_]/g, '') === k.toLowerCase().replace(/[\s_]/g, ''));
    if (match) return row[match];
  }
  return null;
};

export const uploadInterns = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "❌ No file uploaded." });
    }

    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = xlsx.utils.sheet_to_json(sheet);

    if (rows.length === 0) {
      return res.status(400).json({ message: "❌ Excel file is empty or invalid format." });
    }

    const operations = rows.map((row) => {
      const uniqueId = getRowValue(row, ['uniqueid', 'id', 'internid']);
      const name = getRowValue(row, ['name', 'fullname', 'internname']);
      const email = getRowValue(row, ['email', 'emailaddress', 'mail']);
      const mobile = String(getRowValue(row, ['mobile', 'phone', 'contact', 'phonenumber']) || 'N/A');
      const domain = getRowValue(row, ['domain', 'track', 'department']);
      const status = getRowValue(row, ['status', 'state']) || 'Active';
      const joiningDate = getRowValue(row, ['joiningdate', 'date', 'joinedon']);

      if (!uniqueId || !name || !email) {
        // Skip invalid rows or rows without mandatory fields
        return null;
      }

      return {
        updateOne: {
          filter: { uniqueId },
          update: {
            $set: {
              name,
              email,
              mobile,
              domain: domain ? domain.trim().toUpperCase() : "GENERAL",
              status: status.charAt(0).toUpperCase() + status.slice(1).toLowerCase(), // Normalize to "Active"/"Inactive"
              ...(joiningDate && { joiningDate: new Date(joiningDate) })
            },
            $setOnInsert: { uniqueId },
          },
          upsert: true,
        },
      };
    }).filter(op => op !== null);

    if (operations.length === 0) {
      return res.status(400).json({ message: "❌ No valid data found in file. Ensure headers like 'uniqueId', 'name', and 'email' exist." });
    }

    const result = await Intern.bulkWrite(operations);
    
    const added = result.upsertedCount;
    const updated = result.modifiedCount;
    const matched = result.matchedCount - updated; // Matched but not changed

    res.json({
      success: true,
      message: `✅ Upload complete. Added: ${added}, Updated: ${updated}, Unchanged: ${matched}`,
      details: { added, updated, matched, total: operations.length }
    });
  } catch (error) {
    console.error("Error in uploadInterns:", error);
    res.status(500).json({ message: "❌ Server error.", error: error.message });
  }
};
export const createContest = async (req, res) => {
  try {
    let {
      title,
      contestTitle,
      description,
      date,
      startTime,
      duration,
      domain,
      totalQuestions,
      questionCount,
    } = req.body;

    const finalTitle = title || contestTitle;
    const finalQuestionCount = totalQuestions || questionCount;

    // ✅ Validate
    if (
      !finalTitle ||
      !description ||
      !date ||
      !startTime ||
      !duration ||
      !domain ||
      !finalQuestionCount
    ) {
      return res.status(400).json({ message: "❌ All fields are required." });
    }

    // ✅ Ensure domains is ARRAY (IMPORTANT)

    // 🧠 Clean domains (remove spaces, lowercase)
    const Domain = domain.trim().toUpperCase();
    const contestId = createContestID(Domain);
    // 🔥 Date handling
    const datePart = new Date(date).toISOString().split("T")[0];

    const startDateTime = new Date(`${datePart}T${startTime}:00`);
    const expiryDateTime = new Date(startDateTime.getTime() + duration * 60000);

    // ✅ Check existing contest
    const existing = await Contest.findOne({
      date: new Date(date),
      domain: Domain,
    });
    if (existing) {
      return res
        .status(400)
        .json({ message: "❌ Contest already exists for this date." });
    }

    //quiz questions gen
    const existingQuestions = await Question.find({ domain: Domain }).select(
      "questionText -_id", 
    );
    const forbiddenList = existingQuestions.map((q) => q.questionText);

    const questionsData = await Groq_questions.Groq_questions(
      Domain,
      forbiddenList,
      finalQuestionCount,
    );
    const filteredQuestions = questionsData.slice(0, finalQuestionCount);

    if (filteredQuestions.length === 0) {
      return res.status(400).json({
        success: false,
        message: "AI generated only duplicate questions. Try again.",
      });
    }

    // 4. Save to MongoDB
    const savedQuestions = await Question.insertMany(
      filteredQuestions.map((q) => ({
        questionText: q.question, 
        options: q.options,
        correctAnswer: q.correctAnswer, 
        domain: Domain,
        contestId,
        createdAt: new Date(),
      })),
    );
    // ✅ Save PROPER STRUCTURE
    const contest = await Contest.create({
      contestId,
      contestTitle: finalTitle,
      description,
      date: new Date(date),
      startTime: startDateTime,
      expiryDate: expiryDateTime,
      domain: Domain,
      questionCount: finalQuestionCount,
      duration,
    });

    res.status(201).json({
      message: "✅ Contest created successfully.",
      contest,
      savedQuestions,
    });
  } catch (error) {
    res.status(500).json({
      message: "❌ Server error.",
      error: error.message,
    });
  }
};

export const allInterns = async (req, res) => {
  try {
    const allInterns = await Intern.find();
    return res.status(200).json(allInterns);
  } catch (error) {
    console.log("error in allInterns ", error);
    res.status(400).json("server side error");
  }
};

export const getContestQuestions = async (req, res) => {
  try {
    const { contestId } = req.params;

    if (!contestId) {
      return res.status(400).json({ message: "❌ contestId is required." });
    }

    const questions = await Question.find({ contestId });

    if (!questions || questions.length === 0) {
      return res
        .status(404)
        .json({ message: "❌ No questions found for this contest." });
    }

    res.status(200).json({
      success: true,
      count: questions.length,
      data: questions,
    });
  } catch (error) {
    res.status(500).json({ message: "❌ Server error.", error: error.message });
  }
};

export const updateInternStatus = async (req, res) => {
  try {
    const { uniqueId, status } = req.body;

    if (!uniqueId || !status) {
      return res
        .status(400)
        .json({ message: "❌ uniqueId and status are required." });
    }

    if (!["Active", "Inactive"].includes(status)) {
      return res.status(400).json({
        message: "❌ Invalid status. Must be 'Active' or 'Inactive'.",
      });
    }

    const intern = await Intern.findOneAndUpdate(
      { uniqueId },
      { status },
      { new: true },
    );

    if (!intern) {
      return res.status(404).json({ message: "❌ Intern not found." });
    }

    res.status(200).json({
      success: true,
      message: `✅ Intern status updated to ${status}.`,
      data: intern,
    });
  } catch (error) {
    res.status(500).json({ message: "❌ Server error.", error: error.message });
  }
};

export const singleIntern = async (req, res) => {
  try {
    console.log("Request body during create/register single intern:", req.body);
    const { uniqueId, name, email, mobile, domain, joiningDate } = req.body;

    if (!uniqueId || !name || !email || !mobile || !domain || !joiningDate) {
      return res
        .status(400)
        .json({ message: "upload all details of interns including mobile number" });
    }

    const oldUser = await Intern.findOne({ uniqueId });
    if (oldUser) {
      return res.status(400).json({ message: "Intern allready present" });
    }
    const newIntern = new Intern({
      uniqueId,
      name,
      email,
      mobile,
      domain: domain.trim().toUpperCase(),
      joiningDate: new Date(joiningDate),
    });

    await newIntern.save();
    console.log("Backend Saved Data:", newIntern);
    return res.status(200).json({ message: "New intern added", newIntern });
  } catch (error) {
    console.log("error in adding new intern", error);
    res.status(400).json({ message: "server side error" });
  }
};

export const replaceQuestion = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "❌ Question ID is required." });
    }

    // 1. Find the existing question
    const oldQuestion = await Question.findById(id);
    if (!oldQuestion) {
      return res.status(404).json({ message: "❌ Question not found." });
    }

    const { domain, contestId } = oldQuestion;

    // 2. Get existing questions in this domain/contest to avoid duplicates
    const existingQuestions = await Question.find({ domain }).select(
      "questionText -_id",
    );
    const forbiddenList = existingQuestions.map((q) => q.questionText);

    // 3. Generate 1 new question via AI
    const questionsData = await Groq_questions.Groq_questions(
      domain,
      forbiddenList,
      1,
    );

    const newQuestionData = questionsData[0];

    if (!newQuestionData) {
      return res.status(500).json({
        success: false,
        message: "❌ AI failed to generate a replacement question. Try again.",
      });
    }

    // 4. Update the question document
    const updatedQuestion = await Question.findByIdAndUpdate(
      id,
      {
        questionText: newQuestionData.question,
        options: newQuestionData.options,
        correctAnswer: newQuestionData.correctAnswer,
      },
      { new: true },
    );

    res.status(200).json({
      success: true,
      message: "✅ Question replaced successfully with AI content.",
      data: updatedQuestion,
    });
  } catch (error) {
    console.error("Error in replaceQuestion:", error);
    res.status(500).json({
      message: "❌ Server error during question replacement.",
      error: error.message,
    });
  }
};

export const getAllContests = async (req, res) => {
  try {
    const contests = await Contest.find().sort({ date: -1 });
    
    // 🏆 Check for badges to ensure awardGiven is accurate for older contests
    const enrichedContests = await Promise.all(contests.map(async (contest) => {
      if (contest.awardGiven) return contest;
      
      const badgeExists = await Badge.exists({ contestId: contest._id });
      if (badgeExists) {
        contest.awardGiven = true;
        await contest.save();
      }
      return contest;
    }));

    res.status(200).json({
      success: true,
      count: enrichedContests.length,
      data: enrichedContests,
    });
  } catch (error) {
    res.status(500).json({ message: "❌ Server error.", error: error.message });
  }
};

export const getAllAttempts = async (req, res) => {
  try {
    // Populate contest details
    const attempts = await Attempt.find()
      .populate('contestId', 'contestTitle description')
      .sort({ endTime: -1 });

    // Since internId is a string reference (uniqueId), let's optionally fetch intern names
    const internIds = attempts.map(a => a.internId);
    const interns = await Intern.find({ uniqueId: { $in: internIds } }).select('uniqueId name');
    
    const internMap = interns.reduce((acc, intern) => {
      acc[intern.uniqueId] = intern.name;
      return acc;
    }, {});

    const enrichedAttempts = attempts.map(attempt => ({
      ...attempt._doc,
      internName: internMap[attempt.internId] || 'Unknown Intern'
    }));

    res.status(200).json({
      success: true,
      count: enrichedAttempts.length,
      data: enrichedAttempts,
    });
  } catch (error) {
    res.status(500).json({ message: "❌ Server error.", error: error.message });
  }
};

export const deleteContest = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "❌ Contest ID is required." });
    }

    const deletedContest = await Contest.findOneAndDelete({ contestId: id });
    if (!deletedContest) {
      return res.status(404).json({ message: "❌ Contest not found." });
    }

    await Question.deleteMany({ contestId: id });
    await Attempt.deleteMany({ contestId: deletedContest._id });

    res.status(200).json({
      success: true,
      message: "✅ Contest deleted successfully.",
    });
  } catch (error) {
    console.error("Error in deleteContest:", error);
    res.status(500).json({
      message: "❌ Server error during contest deletion.",
      error: error.message,
    });
  }
};

export const deleteIntern = async (req, res) => {
  try {
    const { uniqueId } = req.query;

    if (!uniqueId) {
      return res.status(400).json({ message: "❌ uniqueId is required in query." });
    }

    const deletedIntern = await Intern.findOneAndDelete({ uniqueId });
    if (!deletedIntern) {
      return res.status(404).json({ message: "❌ Intern not found." });
    }

    res.status(200).json({
      success: true,
      message: "✅ Intern deleted successfully.",
    });
  } catch (error) {
    console.error("Error in deleteIntern:", error);
    res.status(500).json({
      message: "❌ Server error during intern deletion.",
      error: error.message,
    });
  }
};

export const updateIntern = async (req, res) => {
  try {
    // For Update, uniqueId should be part of the body
    const { uniqueId, name, email, mobile, domain, joiningDate } = req.body;

    if (!uniqueId) {
      return res.status(400).json({ message: "❌ uniqueId is required in body." });
    }

    const updatedIntern = await Intern.findOneAndUpdate(
      { uniqueId },
      {
        name,
        email,
        mobile,
        domain: domain ? domain.trim().toUpperCase() : undefined,
        joiningDate: joiningDate ? new Date(joiningDate) : undefined,
      },
      { new: true, runValidators: true }
    );

    if (!updatedIntern) {
      return res.status(404).json({ message: "❌ Intern not found." });
    }

    res.status(200).json({
      success: true,
      message: "✅ Intern updated successfully.",
      data: updatedIntern,
    });
  } catch (error) {
    console.error("Error in updateIntern:", error);
    res.status(500).json({
      message: "❌ Server error during intern update.",
      error: error.message,
    });
  }
};
