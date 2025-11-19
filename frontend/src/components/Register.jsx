import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../context/AuthContext';

const validationSchema = Yup.object({
    name: Yup.string()
        .min(2, 'Name must be at least 2 characters')
        .max(50, 'Name cannot exceed 50 characters')
        .matches(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces')
        .required('Name is required'),
    email: Yup.string()
        .email('Please enter a valid email address')
        .required('Email is required'),
    password: Yup.string()
        .min(6, 'Password must be at least 6 characters')
        .matches(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
            'Password must contain at least one uppercase letter, one lowercase letter, and one number'
        )
        .required('Password is required'),
    confirmPassword: Yup.string()
        .oneOf([Yup.ref('password'), null], 'Passwords must match')
        .required('Please confirm your password')
});

const Register = () => {
    const navigate = useNavigate();
    const { register } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [errorType, setErrorType] = useState('');

    const handleSubmit = async (values, { setFieldError }) => {
        setIsSubmitting(true);
        setErrorMessage('');
        setErrorType('');

        // Remove confirmPassword from the data sent to backend
        const { confirmPassword, ...registerData } = values;

        const result = await register(registerData);

        if (result.success) {
            navigate('/dashboard');
        } else {
            // Handle specific error types
            if (result.type === 'USER_EXISTS') {
                setErrorMessage(result.error);
                setErrorType('user-exists');
                setFieldError('email', 'This email is already registered');
            } else if (result.type === 'VALIDATION_ERROR') {
                setErrorMessage('Please check your input and try again');
                setErrorType('validation-error');
                // Handle validation errors
                if (result.errors) {
                    result.errors.forEach(error => {
                        if (error.includes('name') || error.includes('Name')) {
                            setFieldError('name', error);
                        } else if (error.includes('email') || error.includes('Email')) {
                            setFieldError('email', error);
                        } else if (error.includes('password') || error.includes('Password')) {
                            setFieldError('password', error);
                        }
                    });
                }
            } else {
                setErrorMessage(result.error || 'Registration failed. Please try again.');
                setErrorType('general-error');
            }
        }

        setIsSubmitting(false);
    };

    return (
        <div className="auth-container">
            <div className="auth-form">
                <h2>Create Your Account</h2>

                {errorMessage && (
                    <div className={`alert alert-error ${errorType}`}>
                        {errorMessage}
                        {errorType === 'user-exists' && (
                            <div style={{ marginTop: '10px' }}>
                                <Link to="/login" style={{ color: '#fff', textDecoration: 'underline' }}>
                                    Login to your account instead
                                </Link>
                            </div>
                        )}
                    </div>
                )}

                <Formik
                    initialValues={{
                        name: '',
                        email: '',
                        password: '',
                        confirmPassword: '',
                        role: 'user'
                    }}
                    validationSchema={validationSchema}
                    onSubmit={handleSubmit}
                >
                    {({ isValid, dirty }) => (
                        <Form>
                            <div className="form-group">
                                <label htmlFor="name">Full Name</label>
                                <Field
                                    type="text"
                                    id="name"
                                    name="name"
                                    placeholder="Enter your full name"
                                />
                                <ErrorMessage name="name" component="div" className="error-message" />
                            </div>

                            <div className="form-group">
                                <label htmlFor="email">Email Address</label>
                                <Field
                                    type="email"
                                    id="email"
                                    name="email"
                                    placeholder="Enter your email"
                                />
                                <ErrorMessage name="email" component="div" className="error-message" />
                            </div>

                            <div className="form-group">
                                <label htmlFor="password">Password</label>
                                <Field
                                    type="password"
                                    id="password"
                                    name="password"
                                    placeholder="Create a strong password"
                                />
                                <ErrorMessage name="password" component="div" className="error-message" />
                            </div>

                            <div className="form-group">
                                <label htmlFor="confirmPassword">Confirm Password</label>
                                <Field
                                    type="password"
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    placeholder="Confirm your password"
                                />
                                <ErrorMessage name="confirmPassword" component="div" className="error-message" />
                            </div>

                            

                            <button
                                type="submit"
                                className="btn"
                                disabled={!isValid || !dirty || isSubmitting}
                            >
                                {isSubmitting ? 'Creating Account...' : 'Register'}
                            </button>
                        </Form>
                    )}
                </Formik>

                <div className="auth-link">
                    <p>Already have an account? <Link to="/login">Login here</Link></p>
                </div>
            </div>
        </div>
    );
};

export default Register;