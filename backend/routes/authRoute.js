const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
    register,
    login,
    logout,
    getProfile
} = require('../controller/authController');


/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User login, register, profile, logout
 */

/**
 * @swagger
 * /api/v2/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 example: Test@123
 *     responses:
 *       201:
 *         description: User registered successfully
 */

/**
 * @swagger
 * /api/v2/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 example: Test@123
 *     responses:
 *       200:
 *         description: Login successful
 */

/**
 * @swagger
 * /api/v2/auth/profile:
 *   get:
 *     summary: Get user profile (Logged-in users only)
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile fetched successfully
 */

/**
 * @swagger
 * /api/v2/auth/logout:
 *   post:
 *     summary: Logout user (clears cookie or token)
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 */


router.post('/register', register);
router.post('/login', login);
router.post('/logout',authenticate, logout);
router.get('/profile', authenticate, getProfile);

module.exports = router;