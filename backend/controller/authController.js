const User = require('../model/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_KEY, {
        expiresIn: '7d'
    });
};



const validateRegisterInput = (name, email, password) => {
    const errors = [];

    // Name validation
    if (!name || name.trim().length === 0) {
        errors.push('Name is required');
    } else if (name.trim().length < 2) {
        errors.push('Name must be at least 2 characters');
    } else if (name.trim().length > 50) {
        errors.push('Name cannot exceed 50 characters');
    } else if (!/^[a-zA-Z\s]+$/.test(name.trim())) {
        errors.push('Name can only contain letters and spaces');
    }

    // Email validation
    if (!email || email.trim().length === 0) {
        errors.push('Email is required');
    } else if (!validator.isEmail(email)) {
        errors.push('Please provide a valid email');
    }

    // Password validation
    if (!password) {
        errors.push('Password is required');
    } else if (password.length < 6) {
        errors.push('Password must be at least 6 characters');
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
        errors.push('Password must contain at least one uppercase letter, one lowercase letter, and one number');
    }

    return errors;
};

// Validate user input for login
const validateLoginInput = (email, password) => {
    const errors = [];

    if (!email || email.trim().length === 0) {
        errors.push('Email is required');
    } else if (!validator.isEmail(email)) {
        errors.push('Please provide a valid email');
    }

    if (!password) {
        errors.push('Password is required');
    }

    return errors;
};

// Register user
const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Validate input
        const validationErrors = validateRegisterInput(name, email, password);
        if (validationErrors.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validationErrors,
                type: 'VALIDATION_ERROR'
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'An account with this email already exists. Please login instead.',
                type: 'USER_EXISTS'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create new user
        const user = await User.create({
            name: name.trim(),
            email: email.toLowerCase(),
            password: hashedPassword,
            role:  'user'
        });

        // Generate token
        const token = generateToken(user._id);

        // Set cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        res.status(201).json({
            success: true,
            message: 'Account created successfully! Welcome aboard.',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                },
                token
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Something went wrong during registration. Please try again.',
            type: 'SERVER_ERROR'
        });
    }
};

// Login user
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        const validationErrors = validateLoginInput(email, password);
        if (validationErrors.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Please fill in all required fields correctly',
                errors: validationErrors,
                type: 'VALIDATION_ERROR'
            });
        }

        // Find user and include password for comparison
        const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

        // Check if user exists
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'No account found with this email address. Please register first.',
                type: 'USER_NOT_FOUND'
            });
        }

        // Check if user is active
        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: 'Your account has been deactivated. Please contact support.',
                type: 'ACCOUNT_DEACTIVATED'
            });
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Incorrect password. Please check your password and try again.',
                type: 'WRONG_PASSWORD'
            });
        }

        // Generate token
        const token = generateToken(user._id);

        // Set cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        res.status(200).json({
            success: true,
            message: `Welcome back, ${user.name}!`,
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                },
                token
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Something went wrong during login. Please try again.',
            type: 'SERVER_ERROR'
        });
    }
};

// Logout user
const logout = (req, res) => {
    res.cookie('token', '', {
        httpOnly: true,
        expires: new Date(0)
    });

    res.status(200).json({
        success: true,
        message: 'Logged out successfully'
    });
};

// Get current user profile
const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
                type: 'USER_NOT_FOUND'
            });
        }

        res.status(200).json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    createdAt: user.createdAt
                }
            }
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch profile information',
            type: 'SERVER_ERROR'
        });
    }
};

module.exports = {
    register,
    login,
    logout,
    getProfile
};