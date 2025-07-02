import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import QuoteCard from '../components/QuoteCard';
import './ProfilePage.css';

const ProfilePage = () => {
  const [profileData, setProfileData] = useState(null);
  const [collections, setCollections] = useState([]);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { user, api, token } = useAuth();

  const fetchAllData = useCallback(async () => {
    if (!user) return;
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      const [profileResponse, collectionsResponse] = await Promise.all([
        api.get(`/users/${user.id}`, { headers }),
        api.get('/collections', { headers })
      ]);
      setProfileData(profileResponse.data);
      setCollections(collectionsResponse.data);
    } catch (error) {
      console.error("Failed to fetch profile data", error);
    } finally {
      setIsLoading(false);
    }
  }, [api, user, token]);

  useEffect(() => {
    setIsLoading(true);
    fetchAllData();
    const handleUpdate = () => fetchAllData();
    window.addEventListener('quotesUpdated', handleUpdate);
    return () => {
      window.removeEventListener('quotesUpdated', handleUpdate);
    };
  }, [fetchAllData]);

  const handleActionSuccess = () => {
    fetchAllData();
  };

  const handleCreateCollection = async (e) => {
    e.preventDefault();
    if (!newCollectionName.trim()) return;
    try {
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

  const handleDeleteCollection = async (collectionId) => {
    if (window.confirm("Are you sure you want to delete this entire collection? This cannot be undone.")) {
      try {
        await api.delete(`/collections/${collectionId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        fetchAllData(); // Refresh the list of collections
      } catch (error) {
        console.error("Failed to delete collection", error);
        alert("Failed to delete collection.");
      }
    }
  };

  if (isLoading || !profileData) {
    return <div>Loading your profile...</div>;
  }
  
  const userQuotes = profileData.quotes;

  return (
    <div className="profile-page">
      <div className="profile-header-public">
        <img src={`https://ui-avatars.com/api/?name=${profileData.username}&background=random&size=128&color=fff`} alt={profileData.username} className="profile-avatar-large" />
        <h1>{profileData.username}</h1>
        <div className="profile-stats">
          <span><strong>{userQuotes.length}</strong> Quotes</span>
          <span><strong>{profileData.followers_count}</strong> Followers</span>
          <span><strong>{profileData.following_count}</strong> Following</span>
        </div>
      </div>
      
      <div className="profile-section">
        <h2>Your Collections</h2>
        <div className="collections-grid">
          {collections.map(collection => (
            // The card is now a div, not a Link
            <div key={collection.id} className="collection-card">
              <button 
                className="collection-delete-btn" 
                onClick={() => handleDeleteCollection(collection.id)}
                title="Delete Collection"
              >
                &times;
              </button>
              {/* The Link now wraps only the content */}
              <Link to={`/collections/${collection.id}`} className="collection-card-link">
                <h3>{collection.name}</h3>
                <p>{collection.quote_count} quotes</p>
              </Link>
            </div>
          ))}
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
          ) : (
            <p>You haven't posted any quotes yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;