import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import QuoteCard from '../components/QuoteCard';
import './ProfilePage.css';

const ProfilePage = () => {
  const [allQuotes, setAllQuotes] = useState([]);
  const [collections, setCollections] = useState([]);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { user, api } = useAuth();

  const fetchAllData = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const [quotesResponse, collectionsResponse] = await Promise.all([
        api.get('/quotes'),
        api.get('/collections', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      setAllQuotes(quotesResponse.data);
      setCollections(collectionsResponse.data);
    } catch (error) {
      console.error("Failed to fetch profile data", error);
    } finally {
      setIsLoading(false);
    }
  }, [api]);

  
  useEffect(() => {
    setIsLoading(true);
    fetchAllData();

    
    window.addEventListener('quotesUpdated', fetchAllData);

    
    return () => {
      window.removeEventListener('quotesUpdated', fetchAllData);
    };
  }, []); 

  const handleActionSuccess = () => {
    fetchAllData();
  };

  const handleCreateCollection = async (e) => {
    e.preventDefault();
    if (!newCollectionName.trim()) return;
    try {
      const token = localStorage.getItem('token');
      await api.post('/collections', { name: newCollectionName }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setNewCollectionName('');
      fetchAllData();
    } catch (error) {
      console.error("Failed to create collection", error);
      alert("Failed to create collection. Please try again.");
    }
  };

  if (isLoading) {
    return <div>Loading your profile...</div>;
  }
  
  const userQuotes = allQuotes.filter(quote => quote.user_id == user.id);

  return (
    <div className="profile-page">
      <h1 className="profile-header">Welcome, {user.username}</h1>
      <div className="profile-section">
        <h2>Your Collections</h2>
        <div className="collections-grid">
          {collections.length > 0 ? (
            collections.map(collection => (
              <Link to={`/collections/${collection.id}`} key={collection.id} className="collection-card">
                <h3>{collection.name}</h3>
                <p>{collection.quote_count} quotes</p>
              </Link>
            ))
          ) : (<p>You haven't created any collections yet.</p>)}
        </div>
        <form onSubmit={handleCreateCollection} className="create-collection-form">
          <input type="text" value={newCollectionName} onChange={(e) => setNewCollectionName(e.target.value)} placeholder="New collection name..." className="collection-input" />
          <button type="submit" className="collection-button">Create</button>
        </form>
      </div>
      <div className="profile-section">
        <h2>Your Quotes</h2>
        <div className="quote-feed">
          {userQuotes.length > 0 ? (
            userQuotes.map(quote => (
              <QuoteCard key={quote.id} quote={quote} onActionSuccess={handleActionSuccess} />
            ))
          ) : (<p>You haven't posted any quotes yet.</p>)}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;