import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';

const validationSchema = Yup.object({
    title: Yup.string()
        .min(3, 'Title must be at least 3 characters')
        .max(100, 'Title cannot exceed 100 characters')
        .required('Title is required'),
    description: Yup.string()
        .min(10, 'Description must be at least 10 characters')
        .max(500, 'Description cannot exceed 500 characters')
        .required('Description is required'),
    status: Yup.string()
        .oneOf(['pending', 'in-progress', 'completed'], 'Please select a valid status')
        .required('Status is required'),
    priority: Yup.string()
        .oneOf(['low', 'medium', 'high'], 'Please select a valid priority')
        .required('Priority is required'),
    dueDate: Yup.date()
        .min(new Date(), 'Due date must be in the future')
        .nullable()
});

const TaskForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditing = Boolean(id);

    const [initialValues, setInitialValues] = useState({
        title: '',
        description: '',
        status: 'pending',
        priority: 'medium',
        dueDate: '',
        assignedTo: ''
    });
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(isEditing);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isEditing) {
            fetchTask();
        }
        // Note: In a real app, you'd fetch users for assignment
        // For now, we'll just use the current user
    }, [id, isEditing]);

    const fetchTask = async () => {
        try {
            const response = await axios.get(`/api/v2/tasks/${id}`);

            if (response.data.success) {
                const task = response.data.data.task;
                setInitialValues({
                    title: task.title,
                    description: task.description,
                    status: task.status,
                    priority: task.priority,
                    dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
                    assignedTo: task.assignedTo?._id || ''
                });
            }
        } catch (error) {
            console.error('Error fetching task:', error);
            setError('Failed to load task');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (values, { setSubmitting, setFieldError }) => {
        try {
            setError('');

            // Prepare data for submission
            const taskData = {
                ...values,
                dueDate: values.dueDate ? new Date(values.dueDate).toISOString() : null
            };

            // Remove empty assignedTo
            if (!taskData.assignedTo) {
                delete taskData.assignedTo;
            }

            let response;
            if (isEditing) {
                response = await axios.put(`/api/v2/tasks/${id}`, taskData);
            } else {
                response = await axios.post('/api/v2/tasks', taskData);
            }

            if (response.data.success) {
                navigate('/tasks');
            }
        } catch (error) {
            console.error('Error saving task:', error);

            if (error.response?.data?.errors) {
                // Handle validation errors
                error.response.data.errors.forEach(err => {
                    if (err.includes('title')) {
                        setFieldError('title', err);
                    } else if (err.includes('description')) {
                        setFieldError('description', err);
                    } else if (err.includes('due date')) {
                        setFieldError('dueDate', err);
                    }
                });
            } else {
                setError(error.response?.data?.message || 'Failed to save task');
            }
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <div className="loading">Loading task...</div>;
    }

    return (
        <div className="task-form">
            <div className="task-form-container">
                <h2>{isEditing ? 'Edit Task' : 'Create New Task'}</h2>

                {error && (
                    <div className="alert alert-error">
                        {error}
                    </div>
                )}

                <Formik
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    onSubmit={handleSubmit}
                    enableReinitialize={true}
                >
                    {({ isSubmitting, isValid, dirty }) => (
                        <Form>
                            <div className="form-group">
                                <label htmlFor="title">Task Title *</label>
                                <Field
                                    type="text"
                                    id="title"
                                    name="title"
                                    placeholder="Enter task title"
                                />
                                <ErrorMessage name="title" component="div" className="error-message" />
                            </div>

                            <div className="form-group">
                                <label htmlFor="description">Description *</label>
                                <Field
                                    as="textarea"
                                    id="description"
                                    name="description"
                                    rows="4"
                                    placeholder="Enter task description"
                                />
                                <ErrorMessage name="description" component="div" className="error-message" />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="status">Status *</label>
                                    <Field as="select" id="status" name="status">
                                        <option value="pending">Pending</option>
                                        <option value="in-progress">In Progress</option>
                                        <option value="completed">Completed</option>
                                    </Field>
                                    <ErrorMessage name="status" component="div" className="error-message" />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="priority">Priority *</label>
                                    <Field as="select" id="priority" name="priority">
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </Field>
                                    <ErrorMessage name="priority" component="div" className="error-message" />
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="dueDate">Due Date</label>
                                <Field
                                    type="date"
                                    id="dueDate"
                                    name="dueDate"
                                    min={new Date().toISOString().split('T')[0]}
                                />
                                <ErrorMessage name="dueDate" component="div" className="error-message" />
                            </div>

                            <div className="form-actions">
                                <button
                                    type="button"
                                    onClick={() => navigate('/tasks')}
                                    className="btn btn-secondary"
                                    style={{ background: '#6c757d', marginRight: '1rem' }}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="btn"
                                    disabled={!isValid || (!dirty && !isEditing) || isSubmitting}
                                >
                                    {isSubmitting
                                        ? (isEditing ? 'Updating...' : 'Creating...')
                                        : (isEditing ? 'Update Task' : 'Create Task')
                                    }
                                </button>
                            </div>
                        </Form>
                    )}
                </Formik>
            </div>
        </div>
    );
};

export default TaskForm;