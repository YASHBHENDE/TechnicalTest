import express from "express";
import mongoose from "mongoose";
import Enrollment from "../db/enrollment.js";
import Course from "../db/courseschmea.js";
import authMiddleware from "../middleware/auth.middleware.js";
import roleMiddleware from "../middleware/role.middleware.js";

const router = express.Router();


// 1) ENROLL IN A COURSE (Learner only)
router.post(
  "/:courseId",
  authMiddleware,
  roleMiddleware("learner"),
  async (req, res) => {
    try {
      const { courseId } = req.params;

      // validate courseId
      if (!mongoose.Types.ObjectId.isValid(courseId)) {
        return res.status(400).json({
          message: "Invalid course ID",
        });
      }

      // check if course exists
      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({
          message: "Course not found",
        });
      }

      // learner should only enroll in published courses
      if (course.status !== "Published") {
        return res.status(403).json({
          message: "You can only enroll in published courses",
        });
      }

      // prevent duplicate enrollment
      const existingEnrollment = await Enrollment.findOne({
        learnerId: req.user._id,
        courseId,
      });

      if (existingEnrollment) {
        return res.status(409).json({
          message: "You are already enrolled in this course",
        });
      }

      // create enrollment
      const enrollment = await Enrollment.create({
        learnerId: req.user._id,
        courseId,
      });

      return res.status(201).json({
        message: "Enrolled successfully",
        enrollment,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Server error",
        error: error.message,
      });
    }
  }
);


// 2) GET MY ENROLLMENTS (Learner only)
router.get(
  "/my",
  authMiddleware,
  roleMiddleware("learner"),
  async (req, res) => {
    try {
      const enrollments = await Enrollment.find({
        learnerId: req.user._id,
      }).populate("courseId");

      return res.status(200).json({
        totalEnrollments: enrollments.length,
        enrollments,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Server error",
        error: error.message,
      });
    }
  }
);


// 3) GET ALL ENROLLMENTS (Admin only)
router.get(
  "/",
  authMiddleware,
  roleMiddleware("admin"),
  async (req, res) => {
    try {
      const enrollments = await Enrollment.find()
        .populate("learnerId", "fullName email role")
        .populate("courseId", "title description category duration status");

      return res.status(200).json({
        totalEnrollments: enrollments.length,
        enrollments,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Server error",
        error: error.message,
      });
    }
  }
);


// 4) UNENROLL FROM A COURSE (Learner only)
router.delete(
  "/:courseId",
  authMiddleware,
  roleMiddleware("learner"),
  async (req, res) => {
    try {
      const { courseId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(courseId)) {
        return res.status(400).json({
          message: "Invalid course ID",
        });
      }

      const enrollment = await Enrollment.findOne({
        learnerId: req.user._id,
        courseId,
      });

      if (!enrollment) {
        return res.status(404).json({
          message: "Enrollment not found",
        });
      }

      await Enrollment.findByIdAndDelete(enrollment._id);

      return res.status(200).json({
        message: "Unenrolled successfully",
      });
    } catch (error) {
      return res.status(500).json({
        message: "Server error",
        error: error.message,
      });
    }
  }
);

export default router;