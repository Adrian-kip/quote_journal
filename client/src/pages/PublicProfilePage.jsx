import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import QuoteCard from '../components/QuoteCard';
import './HomePage.css';
import './ProfilePage.css';

const PublicProfilePage = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user, api, token } = useAuth();

  const fetchProfile = useCallback(async () => {
    
    try {
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      const response = await api.get(`/users/${id}`, { headers });
      setProfile(response.data);
    } catch (error) {
      console.error("Failed to fetch profile", error);
    } finally {
      setIsLoading(false);
    }
  }, [id, api, token]);

  useEffect(() => {
    setIsLoading(true);
    fetchProfile();
  }, [fetchProfile]);
  
  const handleFollow = async () => {
    if (!user) return alert("Please log in to follow users.");
    try {
      await api.post(`/users/${id}/follow`, {}, { headers: { 'Authorization': `Bearer ${token}` } });
      fetchProfile();
    } catch (error) { console.error("Failed to follow user", error); }
  };

  const handleUnfollow = async () => {
    if (!user) return;
    try {
      await api.post(`/users/${id}/unfollow`, {}, { headers: { 'Authorization': `Bearer ${token}` } });
      fetchProfile();
    } catch (error) { console.error("Failed to unfollow user", error); }
  };

  if (isLoading) return <div>Loading profile...</div>;
  if (!profile) return <div>User not found.</div>;

  const isOwnProfile = user && user.id == id;

  return (
    <div className="profile-page">
      <div className="profile-header-public">
        <img src={`https://ui-avatars.com/api/?name=${profile.username}&background=random&size=128&color=fff`} alt={profile.username} className="profile-avatar-large" />
        <h1>{profile.username}</h1>
        <div className="profile-stats">
          <span><strong>{profile.quotes.length}</strong> Quotes</span>
          <span><strong>{profile.followers_count}</strong> Followers</span>
          <span><strong>{profile.following_count}</strong> Following</span>
        </div>
        {user && !isOwnProfile && (
          profile.is_following ? (
            <button onClick={handleUnfollow} className="profile-action-btn unfollow">Unfollow</button>
          ) : (
            <button onClick={handleFollow} className="profile-action-btn follow">Follow</button>
          )
        )}
      </div>
      <div className="profile-section">
        <h2>{isOwnProfile ? 'Your' : `${profile.username}'s`} Quotes</h2>
        <div className="quote-feed">
          {profile.quotes.length > 0 ? (
            profile.quotes.map(quote => (
              
              <QuoteCard key={quote.id} quote={quote} onActionSuccess={fetchProfile} />
            ))
          ) : (
            <p>This user hasn't posted any quotes yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PublicProfilePage;