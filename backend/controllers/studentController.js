const Student = require("../models/Student");

// @desc    Create a new student
// @route   POST /api/students
exports.createStudent = async (req, res) => {
  try {
    const { studentId, name, email, department, semester, contact } = req.body;

    if (!studentId || !name || !email || !department || !semester) {
      return res.status(400).json({
        success: false,
        message: "studentId, name, email, department and semester are required",
      });
    }

    const existing = await Student.findOne({ studentId });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: `A student with ID ${studentId} already exists`,
      });
    }

    const student = await Student.create({
      studentId,
      name,
      email,
      department,
      semester,
      contact,
    });

    res.status(201).json({
      success: true,
      message: "Student added successfully",
      data: student,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// @desc    Get all students (supports optional ?search= query on name/studentId)
// @route   GET /api/students
exports.getStudents = async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};

    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { studentId: { $regex: search, $options: "i" } },
          { department: { $regex: search, $options: "i" } },
        ],
      };
    }

    const students = await Student.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: students.length,
      data: students,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// @desc    Get a single student by studentId
// @route   GET /api/students/:id
exports.getStudentById = async (req, res) => {
  try {
    const student = await Student.findOne({ studentId: req.params.id });

    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    res.status(200).json({ success: true, data: student });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// @desc    Update a student by studentId
// @route   PUT /api/students/:id
exports.updateStudent = async (req, res) => {
  try {
    const student = await Student.findOneAndUpdate(
      { studentId: req.params.id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    res.status(200).json({
      success: true,
      message: "Student updated successfully",
      data: student,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// @desc    Delete a student by studentId
// @route   DELETE /api/students/:id
exports.deleteStudent = async (req, res) => {
  try {
    const student = await Student.findOneAndDelete({ studentId: req.params.id });

    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    res.status(200).json({
      success: true,
      message: "Student deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};
