import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import QuoteCard from '../components/QuoteCard';

const HomePage = () => {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const { api } = useAuth();

  const fetchQuotes = useCallback(async () => {
    
    try {
      const response = await api.get('/quotes');
      setQuotes(response.data);
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
  
  

  if (loading) {
    return <div>Loading quotes...</div>;
  }
  
  if (quotes.length === 0) {
      return <div>No quotes found. Be the first to add one!</div>
  }

  return (
    <div>
      {quotes.map(quote => (
        <QuoteCard 
          key={quote.id} 
          quote={quote}
          
          
          onActionSuccess={fetchQuotes}
        />
      ))}
    </div>
  );
};

export default HomePage;