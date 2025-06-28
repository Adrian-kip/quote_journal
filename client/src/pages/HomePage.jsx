// src/pages/HomePage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import QuoteCard from '../components/QuoteCard';

const HomePage = () => {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const { api } = useAuth();

  const fetchQuotes = useCallback(async () => {
    // We don't need to set loading to true here for refetches, 
    // it can cause a jarring flash of the "Loading..." text.
    // We only want the main loading text on the initial load.
    try {
      const response = await api.get('/quotes');
      setQuotes(response.data);
    } catch (error) {
      console.error("Failed to fetch quotes", error);
    } finally {
      // Ensure loading is false after the first fetch.
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    setLoading(true); // Set loading to true only on initial mount
    fetchQuotes();
  }, [fetchQuotes]);
  
  // We no longer need the handleQuoteUpdate function.

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
          // *** THE CHANGE IS HERE ***
          // Pass the fetchQuotes function directly to the newly named prop.
          onActionSuccess={fetchQuotes}
        />
      ))}
    </div>
  );
};

export default HomePage;