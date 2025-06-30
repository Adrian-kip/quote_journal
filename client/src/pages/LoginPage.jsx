import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import AuthForm from '../components/AuthForm';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const { loginUser, api } = useAuth();
  const [serverError, setServerError] = useState('');

  const initialValues = {
    email: '',
    password: '',
  };

  const validationSchema = Yup.object({
    email: Yup.string().email('Invalid email address').required('Email is required'),
    password: Yup.string().required('Password is required'),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    setServerError('');
    try {
      const response = await api.post('/login', values);
      
      loginUser(response.data.access_token, response.data.user);
      
      navigate('/');
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
      title="Login"
      isSignup={false}
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
      serverError={serverError}
    />
  );
};

export default LoginPage;