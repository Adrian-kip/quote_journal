// src/pages/SignupPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import AuthForm from '../components/AuthForm';
import { useAuth } from '../context/AuthContext';

const SignupPage = () => {
  const navigate = useNavigate();
  const { api } = useAuth(); // We get the pre-configured axios instance
  const [serverError, setServerError] = useState('');

  const initialValues = {
    username: '',
    email: '',
    password: '',
  };

  const validationSchema = Yup.object({
    username: Yup.string().required('Username is required'),
    email: Yup.string().email('Invalid email address').required('Email is required'),
    password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    setServerError('');
    try {
      await api.post('/signup', values);
      // After successful signup, redirect to the login page
      navigate('/login');
    } catch (error) {
      if (error.response && error.response.data.msg) {
        setServerError(error.response.data.msg);
      } else {
        setServerError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthForm
      title="Sign Up"
      isSignup={true}
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
      serverError={serverError}
    />
  );
};

export default SignupPage;