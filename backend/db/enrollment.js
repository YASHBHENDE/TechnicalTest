import mongoose from "mongoose";

const enrollmentSchema = new mongoose.Schema(
  {
    learnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Learner ID is required"],
    },

    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Course ID is required"],
    },
  },
  { timestamps: true }
);

// Prevent duplicate enrollment of same learner in same course
enrollmentSchema.index(
  { learnerId: 1, courseId: 1 },
  { unique: true }
);

const Enrollment = mongoose.model("Enrollment", enrollmentSchema);

export default Enrollment;