const Task = require('../model/Task');
const User = require('../model/User');

// Validate task input
const validateTaskInput = (title, description, status, priority, dueDate) => {
    const errors = [];

    // Title validation
    if (!title || title.trim().length === 0) {
        errors.push('Task title is required');
    } else if (title.trim().length < 3) {
        errors.push('Title must be at least 3 characters');
    } else if (title.trim().length > 100) {
        errors.push('Title cannot exceed 100 characters');
    }

    // Description validation
    if (!description || description.trim().length === 0) {
        errors.push('Task description is required');
    } else if (description.trim().length < 10) {
        errors.push('Description must be at least 10 characters');
    } else if (description.trim().length > 500) {
        errors.push('Description cannot exceed 500 characters');
    }

    // Status validation
    if (status && !['pending', 'in-progress', 'completed'].includes(status)) {
        errors.push('Status must be one of: pending, in-progress, completed');
    }

    // Priority validation
    if (priority && !['low', 'medium', 'high'].includes(priority)) {
        errors.push('Priority must be one of: low, medium, high');
    }

    // Due date validation
    if (dueDate) {
        const date = new Date(dueDate);
        if (isNaN(date.getTime())) {
            errors.push('Please provide a valid due date');
        } else if (date <= new Date()) {
            errors.push('Due date must be in the future');
        }
    }

    return errors;
};

// Create a new task
const createTask = async (req, res) => {
    try {
        const { title, description, status, priority, dueDate, assignedTo } = req.body;

        // Validate input
        const validationErrors = validateTaskInput(title, description, status, priority, dueDate);
        if (validationErrors.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validationErrors
            });
        }

        // If assignedTo is provided, verify the user exists
        if (assignedTo) {
            const assignedUser = await User.findById(assignedTo);
            if (!assignedUser) {
                return res.status(400).json({
                    success: false,
                    message: 'Assigned user not found'
                });
            }
        }

        const task = await Task.create({
            title: title.trim(),
            description: description.trim(),
            status: status || 'pending',
            priority: priority || 'medium',
            dueDate: dueDate ? new Date(dueDate) : undefined,
            createdBy: req.user.id,
            assignedTo: assignedTo || req.user.id
        });

        await task.populate('createdBy assignedTo', 'name email');

        res.status(201).json({
            success: true,
            message: 'Task created successfully',
            data: { task }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error during task creation',
            error: error.message
        });
    }
};

// Get all tasks (with filtering and pagination)
const getTasks = async (req, res) => {
    try {
        const { status, priority, page = 1, limit = 10, search } = req.query;

        // Build query based on user role
        let query = {};

        if (req.user.role === 'admin') {
            // Admin can see all tasks
        } else {
            // Regular users can only see their own tasks
            query = {
                $or: [
                    { createdBy: req.user.id },
                    { assignedTo: req.user.id }
                ]
            };
        }

        // Add filters
        if (status) query.status = status;
        if (priority) query.priority = priority;
        if (search) {
            query.$and = query.$and || [];
            query.$and.push({
                $or: [
                    { title: { $regex: search, $options: 'i' } },
                    { description: { $regex: search, $options: 'i' } }
                ]
            });
        }

        const skip = (page - 1) * limit;

        const tasks = await Task.find(query)
            .populate('createdBy assignedTo', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Task.countDocuments(query);

        res.status(200).json({
            success: true,
            data: {
                tasks,
                pagination: {
                    current: parseInt(page),
                    total: Math.ceil(total / limit),
                    count: tasks.length,
                    totalTasks: total
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error while fetching tasks',
            error: error.message
        });
    }
};

// Get single task by ID
const getTaskById = async (req, res) => {
    try {
        const { id } = req.params;

        let query = { _id: id };

        // Non-admin users can only access their own tasks
        if (req.user.role !== 'admin') {
            query.$or = [
                { createdBy: req.user.id },
                { assignedTo: req.user.id }
            ];
        }

        const task = await Task.findOne(query)
            .populate('createdBy assignedTo', 'name email');

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        res.status(200).json({
            success: true,
            data: { task }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error while fetching task',
            error: error.message
        });
    }
};

// Update task
const updateTask = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, status, priority, dueDate, assignedTo } = req.body;

        // Validate input if provided
        const validationErrors = validateTaskInput(
            title || 'dummy', // Use dummy value if not provided for validation
            description || 'dummy description',
            status,
            priority,
            dueDate
        );

        // Filter out errors for fields that weren't provided
        const filteredErrors = validationErrors.filter(error => {
            if (!title && error.includes('title')) return false;
            if (!description && error.includes('description')) return false;
            return true;
        });

        if (filteredErrors.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: filteredErrors
            });
        }

        let query = { _id: id };

        // Non-admin users can only update their own tasks
        if (req.user.role !== 'admin') {
            query.createdBy = req.user.id;
        }

        const task = await Task.findOne(query);
        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found or you do not have permission to update it'
            });
        }

        // If assignedTo is being updated, verify the user exists
        if (assignedTo && assignedTo !== task.assignedTo.toString()) {
            const assignedUser = await User.findById(assignedTo);
            if (!assignedUser) {
                return res.status(400).json({
                    success: false,
                    message: 'Assigned user not found'
                });
            }
        }

        const updateData = {};
        if (title) updateData.title = title.trim();
        if (description) updateData.description = description.trim();
        if (status) updateData.status = status;
        if (priority) updateData.priority = priority;
        if (dueDate) updateData.dueDate = new Date(dueDate);
        if (assignedTo) updateData.assignedTo = assignedTo;

        const updatedTask = await Task.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        ).populate('createdBy assignedTo', 'name email');

        res.status(200).json({
            success: true,
            message: 'Task updated successfully',
            data: { task: updatedTask }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error during task update',
            error: error.message
        });
    }
};

// Delete task
const deleteTask = async (req, res) => {
    try {
        const { id } = req.params;

        let query = { _id: id };

        // Non-admin users can only delete their own tasks
        if (req.user.role !== 'admin') {
            query.createdBy = req.user.id;
        }

        const task = await Task.findOneAndDelete(query);

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found or you do not have permission to delete it'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Task deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error during task deletion',
            error: error.message
        });
    }
};

// Get task statistics (admin only)
const getTaskStats = async (req, res) => {
    try {
        const stats = await Task.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        const priorityStats = await Task.aggregate([
            {
                $group: {
                    _id: '$priority',
                    count: { $sum: 1 }
                }
            }
        ]);

        const totalTasks = await Task.countDocuments();
        const overdueTasks = await Task.countDocuments({
            dueDate: { $lt: new Date() },
            status: { $ne: 'completed' }
        });

        res.status(200).json({
            success: true,
            data: {
                statusStats: stats,
                priorityStats,
                totalTasks,
                overdueTasks
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error while fetching statistics',
            error: error.message
        });
    }
};

module.exports = {
    createTask,
    getTasks,
    getTaskById,
    updateTask,
    deleteTask,
    getTaskStats
};