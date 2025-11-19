const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const {
    createTask,
    getTasks,
    getTaskById,
    updateTask,
    deleteTask,
    getTaskStats
} = require('../controller/taskController');


/**
 * @swagger
 * tags:
 *   name: Tasks
 *   description: Task CRUD management
 */

/**
 * @swagger
 * /api/v2/tasks:
 *   post:
 *     summary: Create a new task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *                 example: Build Swagger API
 *               description:
 *                 type: string
 *                 example: Implement API documentation using Swagger
 *               priority:
 *                 type: string
 *                 example: high
 *     responses:
 *       201:
 *         description: Task created successfully
 */
router.post('/', authenticate, createTask);

/**
 * @swagger
 * /api/v2/tasks:
 *   get:
 *     summary: Get all tasks of logged-in user
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of tasks
 */
router.get('/', authenticate, getTasks);

/**
 * @swagger
 * /api/v2/tasks/{id}:
 *   put:
 *     summary: Update task (only owner or admin)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Task ID
 *     responses:
 *       200:
 *         description: Task updated successfully
 *       403:
 *         description: Not authorized to update this task
 */
router.put('/:id', authenticate, updateTask);

/**
 * @swagger
 * /api/v2/tasks/{id}:
 *   delete:
 *     summary: Delete a task (Admin only)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Task ID
 *     responses:
 *       200:
 *         description: Task deleted successfully
 *       403:
 *         description: Access denied (Admin only)
 */
router.delete('/:id', authenticate, authorize('admin'), deleteTask);


router.post('/', authenticate, createTask);
router.get('/', authenticate, getTasks);
router.get('/stats', authenticate, authorize('admin'), getTaskStats);
router.get('/:id', authenticate, getTaskById);
router.put('/:id', authenticate, updateTask);
router.delete('/:id', authenticate, deleteTask);

module.exports = router;