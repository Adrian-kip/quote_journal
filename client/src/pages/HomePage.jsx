import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import QuoteCard from '../components/QuoteCard';
import './HomePage.css';

const HomePage = () => {
  const [quotes, setQuotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { api, user, token } = useAuth();

  const fetchQuotes = useCallback(async () => {
    
    if (isLoading) {
        try {
          
          const endpoint = user ? `/quotes/feed` : `/quotes/trending`;
          const headers = user ? { 'Authorization': `Bearer ${token}` } : {};
          
          const response = await api.get(endpoint, { headers });
          
          setQuotes(response.data.quotes || []);
        } catch (error) {
          console.error("Failed to fetch quotes", error);
          setQuotes([]);
        } finally {
          setIsLoading(false);
        }
    }
  }, [api, user, token, isLoading]); 

  
  useEffect(() => {
    setIsLoading(true); 
  }, [user])

 
  useEffect(() => {
    if (isLoading) {
        fetchQuotes();
    }
  }, [isLoading, fetchQuotes]);

  
  useEffect(() => {
    const handleUpdate = () => setIsLoading(true); 
    window.addEventListener('quotesUpdated', handleUpdate);
    return () => {
      window.removeEventListener('quotesUpdated', handleUpdate);
    };
  }, []);

  
  const handleActionSuccess = () => {
   
    const refetchSilently = async () => {
        try {
            const endpoint = user ? `/quotes/feed` : `/quotes/trending`;
            const headers = user ? { 'Authorization': `Bearer ${token}` } : {};
            const response = await api.get(endpoint, { headers });
            setQuotes(response.data.quotes || []);
        } catch (error) {
            console.error("Failed to refetch quotes", error);
        }
    }
    refetchSilently();
  };


  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {/* The search bar has been removed */}
      <div className="quote-feed">
        {quotes.length > 0 ? (
          quotes.map(quote => (
            <QuoteCard
              key={quote.id}
              quote={quote}
              onActionSuccess={handleActionSuccess}
            />
          ))
        ) : (
          <p className="no-quotes-message">
            {user ? "Your feed is empty. Follow some users to see their quotes here!" : "No quotes found."}
          </p>
        )}
      </div>
    </div>
  );
};

export default HomePage;