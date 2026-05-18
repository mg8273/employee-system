const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  addEmployee,
  getAllEmployees,
  searchEmployees,
  updateEmployee,
  deleteEmployee
} = require('../controllers/employeeController');

router.post('/', auth, addEmployee);
router.get('/search', searchEmployees);
router.get('/', getAllEmployees);
router.put('/:id', auth, updateEmployee);
router.delete('/:id', auth, deleteEmployee);
module.exports = router;
