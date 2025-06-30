import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import QuoteCard from '../components/QuoteCard';

const ProfilePage = () => {
  const [allQuotes, setAllQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, api } = useAuth(); 

  
  const fetchQuotes = useCallback(async () => {
    try {
      const response = await api.get('/quotes');
      setAllQuotes(response.data);
    } catch (error) {
      console.error("Failed to fetch quotes", error);
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    setLoading(true);
    fetchQuotes();
  }, [fetchQuotes]);

  
  const handleActionSuccess = () => {
    fetchQuotes();
  };

  if (loading) {
    return <div>Loading your quotes...</div>;
  }
  
  
  const userQuotes = allQuotes.filter(quote => quote.user_id == user.id);

  return (
    <div>
      <h1 style={{ marginBottom: '2rem', textAlign: 'center' }}>Your Quotes</h1>
      
      {userQuotes.length > 0 ? (
        userQuotes.map(quote => (
          <QuoteCard 
            key={quote.id} 
            quote={quote}
            onActionSuccess={handleActionSuccess}
          />
        ))
      ) : (
        <p style={{ textAlign: 'center' }}>You haven't posted any quotes yet. <a href="/new">Create one!</a></p>
      )}
    </div>
  );
};

export default ProfilePage;