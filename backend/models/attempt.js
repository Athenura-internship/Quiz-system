import mongoose from "mongoose";

const attemptSchema = new mongoose.Schema({
  internId: {
    type: String,
    required: true,
  }, // Matches intern uniqueId [cite: 81]
  contestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Contest",
    required: true,
  },
  score: {
    type: Number,
    default: 0,
  },
  timeTaken: {
    type: Number,
  }, // In seconds, for tie-breaking [cite: 60, 81]
  totalQuestions: {
    type: Number,
    required: true,
  },
  startTime: {
    type: Date,
    default: Date.now,
  },
  endTime: {
    type: Date,
  },
  tabSwitches: {
    type: Number,
    default: 0,
  }, // Anti-cheat log [cite: 72, 77]
  isSubmitted: {
    type: Boolean,
    default: false,
  }, // Ensures "One attempt per intern" [cite: 31, 72]
  domain: {
    type: String,
  },
  answers: [
    {
      questionId: { type: mongoose.Schema.Types.ObjectId, ref: "Question" },
      selectedAnswer: String,
      isCorrect: Boolean,
    },
  ],
});

const Attempt = mongoose.model("Attempt", attemptSchema);
export default Attempt;
