import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes.js";
import courseRoutes from "./routes/course.routes.js";
dotenv.config();

const app = express();

app.use(express.json());

const PORT = process.env.PORT;


mongoose.connect(process.env.MONGODB_URI).then(() => {
    console.log("MongoDB connected successfully");
  })
  .catch((error) => {
    console.log("MongoDB connection failed:", error.message);
  });


app.get("/", (req, res) => {
  res.send("Backend is running");
});

app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);

app.listen(PORT,()=>{
    console.log("3001 active")
})

