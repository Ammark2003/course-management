const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect("mongodb://localhost:27017/coursedb");

const courseSchema = new mongoose.Schema({
  courseCode: { type: String, required: true, unique: true },
  courseName: { type: String, required: true },
  category: { type: String, required: true },
  duration: { type: Number, required: true },
});

const Course = mongoose.model("Course", courseSchema);

app.post("/api/courses", async (req, res) => {
  try {
    const { courseCode, courseName, category, duration } = req.body;

    if (!courseCode || !courseName || !category || !duration) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (isNaN(duration)) {
      return res.status(400).json({ error: "Duration must be numeric" });
    }

    const course = new Course({ courseCode, courseName, category, duration });
    await course.save();
    res.status(201).json(course);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ error: "Course code must be unique" });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

app.get("/api/courses", async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/courses/:id", async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }
    res.json(course);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/courses/:id", async (req, res) => {
  try {
    const { courseCode, courseName, category, duration } = req.body;

    if (!courseCode || !courseName || !category || !duration) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (isNaN(duration)) {
      return res.status(400).json({ error: "Duration must be numeric" });
    }

    const course = await Course.findByIdAndUpdate(
      req.params.id,
      { courseCode, courseName, category, duration },
      { new: true, runValidators: true }
    );

    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    res.json(course);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ error: "Course code must be unique" });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

app.delete("/api/courses/:id", async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }
    res.json({ message: "Course deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
