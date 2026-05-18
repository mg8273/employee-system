const Employee = require('../models/Employee');

exports.addEmployee = async (req, res) => {
  try {
    const { name, email, department, skills, performanceScore, experience } = req.body;
    if (!name || !email || !department || !performanceScore || !experience)
      return res.status(400).json({ message: 'All fields required' });
    const existing = await Employee.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already exists' });
    const employee = await Employee.create({ name, email, department, skills, performanceScore, experience });
    res.status(201).json(employee);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.find().sort({ performanceScore: -1 });
    res.json(employees);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.searchEmployees = async (req, res) => {
  try {
    const { department } = req.query;
    const employees = await Employee.find({
      department: { $regex: department, $options: 'i' }
    });
    res.json(employees);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    res.json(employee);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteEmployee = async (req, res) => {
  try {
    await Employee.findByIdAndDelete(req.params.id);
    res.json({ message: 'Employee deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
