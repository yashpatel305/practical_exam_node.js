const express = require('express');
const taskController = require('../controllers/taskController');
const categoryController = require('../controllers/categoryController');
const { requireAuth, requireRole } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(requireAuth);

router.get('/', taskController.getTaskList);
router.get('/new', taskController.getTaskForm);
router.post('/', taskController.createTask);
router.get('/:id/edit', taskController.getEditTaskForm);
router.put('/:id', taskController.updateTask);
router.delete('/:id', taskController.deleteTask);

router.post('/categories', requireRole('admin', 'user'), categoryController.createCategory);

module.exports = router;
