import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../context/AuthContext';
import '../components/QuoteForm.css'; 

const EditQuotePage = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const { api, user } = useAuth();
  

  const [initialValues, setInitialValues] = useState({ content: '', tags: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');


  useEffect(() => {
    const fetchQuote = async () => {
      try {
        const response = await api.get(`/quotes/${id}`);
        
        if (response.data.user_id !== user.id) {
            setError("You are not authorized to edit this quote.");
            setLoading(false);
            return;
        }
        setInitialValues({
          content: response.data.content,
          tags: response.data.tags || '', 
        });
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch quote data.");
        setLoading(false);
        console.error(err);
      }
    };

    if (user) { 
        fetchQuote();
    }
  }, [id, api, user]);

  const validationSchema = Yup.object({
    content: Yup.string().required('Quote content cannot be empty.'),
    tags: Yup.string(),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      await api.patch(`/quotes/${id}`, values);
      navigate('/'); 
    } catch (err) {
      console.error('Failed to update quote', err);
      alert('There was an error updating your quote.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div>Loading quote...</div>;
  }

  if (error) {
    return <div className="form-container"><p className="form-server-error">{error}</p></div>;
  }

  return (
    <div className="form-container">
      <h2 className="form-title">Edit Your Quote</h2>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize 
      >
        {({ isSubmitting }) => (
          <Form>
            <div className="form-group">
              <label htmlFor="content" className="form-label">Quote</label>
              <Field
                as="textarea"
                name="content"
                className="form-input textarea"
              />
              <ErrorMessage name="content" component="div" className="form-error" />
            </div>
            <div className="form-group">
              <label htmlFor="tags" className="form-label">Tags (optional, comma-separated)</label>
              <Field
                type="text"
                name="tags"
                className="form-input"
              />
              <ErrorMessage name="tags" component="div" className="form-error" />
            </div>
            <button type="submit" disabled={isSubmitting} className="submit-button">
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default EditQuotePage;