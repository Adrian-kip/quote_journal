import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../context/AuthContext';
import '../components/QuoteForm.css'; 

const CreateQuotePage = () => {
  const navigate = useNavigate();
  const { api } = useAuth();

  const initialValues = {
    content: '',
    tags: '',
  };

  const validationSchema = Yup.object({
    content: Yup.string().required('Quote content cannot be empty.'),
    tags: Yup.string(), 
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      await api.post('/quotes', values);
      navigate('/'); 
    } catch (error) {
      console.error('Failed to create quote', error);
      alert('There was an error creating your quote. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="form-container">
      <h2 className="form-title">Post a New Quote</h2>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form>
            <div className="form-group">
              <label htmlFor="content" className="form-label">Quote</label>
              <Field
                as="textarea"
                name="content"
                className="form-input textarea"
                placeholder="The greatest glory in living lies not in never falling, but in rising every time we fall."
              />
              <ErrorMessage name="content" component="div" className="form-error" />
            </div>

            <div className="form-group">
              <label htmlFor="tags" className="form-label">Tags (optional, comma-separated)</label>
              <Field
                type="text"
                name="tags"
                className="form-input"
                placeholder="#wisdom, #life, #motivation"
              />
              <ErrorMessage name="tags" component="div" className="form-error" />
            </div>

            <button type="submit" disabled={isSubmitting} className="submit-button">
              {isSubmitting ? 'Posting...' : 'Post Quote'}
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default CreateQuotePage;