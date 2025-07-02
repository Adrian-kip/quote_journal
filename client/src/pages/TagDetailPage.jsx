import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import QuoteCard from '../components/QuoteCard';
import './HomePage.css'; 

const TagDetailPage = () => {
  const { tagName } = useParams(); 
  const [quotes, setQuotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { api } = useAuth();

  const fetchQuotesByTag = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get(`/tags/${tagName}`);
      setQuotes(response.data);
    } catch (error) {
      console.error(`Failed to fetch quotes for tag ${tagName}`, error);
    } finally {
      setIsLoading(false);
    }
  }, [api, tagName]);

  useEffect(() => {
    fetchQuotesByTag();
  }, [fetchQuotesByTag]);

  const handleActionSuccess = () => {
    fetchQuotesByTag();
  };

  if (isLoading) {
    return <div>Loading quotes tagged with #{tagName}...</div>;
  }

  return (
    <div>
      <h1 className="collection-detail-header">Quotes tagged with #{tagName}</h1>
      <div className="quote-feed">
        {quotes.length > 0 ? (
          quotes.map(quote => (
            <QuoteCard key={quote.id} quote={quote} onActionSuccess={handleActionSuccess} />
          ))
        ) : (
          <p className="no-quotes-message">No quotes found with this tag.</p>
        )}
      </div>
    </div>
  );
};

export default TagDetailPage;