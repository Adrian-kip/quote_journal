import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import './AuthForm.css';

const AuthForm = ({ title, isSignup, initialValues, validationSchema, onSubmit, serverError }) => {
  return (
    <div className="form-container">
      <h2 className="form-title">{title}</h2>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={onSubmit}
      >
        {({ isSubmitting }) => (
          <Form>
            {serverError && <div className="form-server-error">{serverError}</div>}

            {isSignup && (
              <div className="form-group">
                <label htmlFor="username" className="form-label">Username</label>
                <Field type="text" name="username" className="form-input" />
                <ErrorMessage name="username" component="div" className="form-error" />
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email" className="form-label">Email</label>
              <Field type="email" name="email" className="form-input" />
              <ErrorMessage name="email" component="div" className="form-error" />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">Password</label>
              <Field type="password" name="password" className="form-input" />
              <ErrorMessage name="password" component="div" className="form-error" />
            </div>

            <button type="submit" disabled={isSubmitting} className="submit-button">
              {isSubmitting ? 'Submitting...' : title}
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default AuthForm;