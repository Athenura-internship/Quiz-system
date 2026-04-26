import express from "express";

import {
  uploadInterns,
  createContest,
  allInterns,
  getContestQuestions,
  updateInternStatus,
  singleIntern,
  replaceQuestion,
  getAllContests,
  getAllAttempts,
  deleteContest,
  deleteIntern,
  updateIntern,
} from "../controllers/admin.controllers.js";

import { protectRoute } from "../middlewares/authMiddleware.js";
import { isAdmin } from "../middlewares/adminMiddleware.js";
import { uploadInternsFile } from "../middlewares/uploadSingleMiddleware.js";

const router = express.Router();

// 🔐 Apply authentication + admin check to all routes
router.use(protectRoute);
router.use(isAdmin);
// 📂 Upload Interns (Excel File)
router.post("/upload-interns", uploadInternsFile, uploadInterns);
router.post("/upload-single-intern", singleIntern);
// 🏆 Create Contest
router.post("/create-contest", createContest);

router.get("/all-interns", allInterns);
router.get("/all-contests", getAllContests);
router.get("/all-attempts", getAllAttempts);

router.get("/get-questions/:contestId", getContestQuestions);

// 🔄 Update Intern Status (Active/Inactive)
router.patch("/update-status", updateInternStatus);

// 🔄 Replace Question with AI Content
router.put("/replace-question/:id", replaceQuestion);

// 🗑️ Delete Contest
router.delete("/delete-contest/:id", deleteContest);

// 👤 Intern Management (Delete & Update)
router.delete("/delete-intern", deleteIntern);
router.put("/update-intern", updateIntern);

export default router;
