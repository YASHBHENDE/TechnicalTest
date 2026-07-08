import express from "express";
import mongoose from "mongoose";
import Course from "../db/courseschmea.js";
import Enrollment from "../db/enrollment.js";
import authMiddleware from "../middleware/auth.middleware.js";
import roleMiddleware from "../middleware/role.middleware.js";

const router = express.Router();


// CREATE COURSE (Admin only)
router.post(
  "/",
  authMiddleware,
  roleMiddleware("admin"),
  async (req, res) => {
    try {
      const { title, description, category, duration, status } = req.body;

      if (!title || !description || !category || !duration) {
        return res.status(400).json({
          message: "Title, description, category and duration are required",
        });
      }

      const course = await Course.create({
        title,
        description,
        category,
        duration,
        status: status || "Draft",
        createdBy: req.user._id,
      });

      return res.status(201).json({
        message: "Course created successfully",
        course,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Server error",
        error: error.message,
      });
    }
  }
);


// GET ALL COURSES
// Admin -> see all courses
// Learner -> see only Published courses
router.get(
  "/",
  authMiddleware,
  roleMiddleware("admin", "learner"),
  async (req, res) => {
    try {
      let filter = {};

      if (req.user.role === "learner") {
        filter.status = "Published";
      }

      const courses = await Course.find(filter).populate(
        "createdBy",
        "fullName email role"
      );

      return res.status(200).json({
        courses,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Server error",
        error: error.message,
      });
    }
  }
);


// GET COURSE BY ID
router.get(
  "/:id",
  authMiddleware,
  roleMiddleware("admin", "learner"),
  async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          message: "Invalid course ID",
        });
      }

      const course = await Course.findById(id).populate(
        "createdBy",
        "fullName email role"
      );

      if (!course) {
        return res.status(404).json({
          message: "Course not found",
        });
      }

      // learner should not access Draft course
      if (req.user.role === "learner" && course.status !== "Published") {
        return res.status(403).json({
          message: "You are not allowed to view this course",
        });
      }

      return res.status(200).json({
        course,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Server error",
        error: error.message,
      });
    }
  }
);


// UPDATE COURSE (Admin only)
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { title, description, category, duration, status } = req.body;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          message: "Invalid course ID",
        });
      }

      const course = await Course.findById(id);

      if (!course) {
        return res.status(404).json({
          message: "Course not found",
        });
      }

      if (title !== undefined) course.title = title;
      if (description !== undefined) course.description = description;
      if (category !== undefined) course.category = category;
      if (duration !== undefined) course.duration = duration;
      if (status !== undefined) course.status = status;

      await course.save();

      return res.status(200).json({
        message: "Course updated successfully",
        course,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Server error",
        error: error.message,
      });
    }
  }
);


// DELETE COURSE (Admin only)
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          message: "Invalid course ID",
        });
      }

      const course = await Course.findById(id);

      if (!course) {
        return res.status(404).json({
          message: "Course not found",
        });
      }

      await Course.findByIdAndDelete(id);

      // optional: remove related enrollments also
      await Enrollment.deleteMany({ courseId: id });

      return res.status(200).json({
        message: "Course deleted successfully",
      });
    } catch (error) {
      return res.status(500).json({
        message: "Server error",
        error: error.message,
      });
    }
  }
);


// GET LEARNERS ENROLLED IN A COURSE (Admin only)
router.get(
  "/:id/learners",
  authMiddleware,
  roleMiddleware("admin"),
  async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          message: "Invalid course ID",
        });
      }

      const course = await Course.findById(id);
      if (!course) {
        return res.status(404).json({
          message: "Course not found",
        });
      }

      const enrollments = await Enrollment.find({ courseId: id }).populate(
        "learnerId",
        "fullName email role"
      );

      return res.status(200).json({
        courseId: id,
        totalLearners: enrollments.length,
        learners: enrollments.map((item) => item.learnerId),
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