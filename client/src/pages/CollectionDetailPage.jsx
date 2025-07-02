import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import QuoteCard from '../components/QuoteCard';
import './HomePage.css';

const CollectionDetailPage = () => {
  const { id } = useParams();
  const [collection, setCollection] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { api, token } = useAuth();

  const fetchCollection = useCallback(async () => {
    setIsLoading(true);
    try {
      
      const response = await api.get(`/collections/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setCollection(response.data);
    } catch (error) {
      console.error("Failed to fetch collection", error);
      setCollection(null);
    } finally {
      setIsLoading(false);
    }
  }, [api, id, token]); 

  useEffect(() => {
    if(token) { 
        fetchCollection();
    }
  }, [fetchCollection, token]);

  const handleActionSuccess = () => {
    fetchCollection();
  };

  if (isLoading) {
    return <div>Loading collection...</div>;
  }

  if (!collection) {
    return <div>Collection not found or you do not have permission to view it.</div>;
  }

  return (
    <div>
      <h1 className="collection-detail-header">Collection: {collection.name}</h1>
      <div className="quote-feed">
        {collection.quotes.length > 0 ? (
          collection.quotes.map(quote => (
            <QuoteCard
              key={quote.id}
              quote={quote}
              onActionSuccess={handleActionSuccess}
            />
          ))
        ) : (
          <p className="no-quotes-message">There are no quotes in this collection yet.</p>
        )}
      </div>
    </div>
  );
};

export default CollectionDetailPage;