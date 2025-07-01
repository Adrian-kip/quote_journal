// client/src/pages/CollectionDetailPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom'; // Import useParams to read the URL
import { useAuth } from '../context/AuthContext';
import QuoteCard from '../components/QuoteCard';
import './HomePage.css'; // We can reuse the same styles as the homepage feed

const CollectionDetailPage = () => {
  const { id } = useParams(); // This gets the collection ID from the URL
  const [collection, setCollection] = useState(null);
  const [loading, setLoading] = useState(true);
  const { api } = useAuth();

  const fetchCollection = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch the specific collection by its ID
      const response = await api.get(`/collections/${id}`);
      setCollection(response.data);
    } catch (error) {
      console.error("Failed to fetch collection", error);
      setCollection(null); // Set to null on error
    } finally {
      setLoading(false);
    }
  }, [api, id]);

  useEffect(() => {
    fetchCollection();
  }, [fetchCollection]);

  // When a quote is liked/deleted inside the collection, refetch the data
  const handleActionSuccess = () => {
    fetchCollection();
  };

  if (loading) {
    return <div>Loading collection...</div>;
  }

  if (!collection) {
    return <div>Collection not found.</div>;
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