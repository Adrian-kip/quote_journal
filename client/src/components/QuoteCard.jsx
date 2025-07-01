import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './QuoteCard.css';

const EMOJI_REACTIONS = ['❤️', '😂', '👍', '🔥'];

const QuoteCard = ({ quote, onActionSuccess }) => {
  
  const { user, api, token } = useAuth();
  
  const [showCollections, setShowCollections] = useState(false);
  const [collections, setCollections] = useState([]);
  const [isLoadingCollections, setIsLoadingCollections] = useState(false);

  const avatarUrl = `https://ui-avatars.com/api/?name=${quote.author.split(' ').join('+')}&background=random&size=32&color=fff`;

  const handleSaveClick = async () => {
    if (!user) return;
    setShowCollections(!showCollections);
    if (!showCollections && collections.length === 0) {
      setIsLoadingCollections(true);
      try {
        const response = await api.get('/collections', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setCollections(response.data);
      } catch (error) {
        console.error("Failed to fetch collections", error);
      } finally {
        setIsLoadingCollections(false);
      }
    }
  };

  const handleAddToCollection = async (collectionId) => {
    try {
      await api.post('/collections/add-quote', 
        { quote_id: quote.id, collection_id: collectionId },
        { headers: { 'Authorization': `Bearer ${token}` } } // Add header
      );
      alert(`Quote saved to collection!`);
      setShowCollections(false);
      onActionSuccess();
    } catch (error) {
      console.error("Failed to add quote to collection", error);
      alert("Failed to save quote. Maybe it's already in that collection?");
    }
  };

  const handleLike = async (reaction) => {
    if (!user) return;
    try {
      await api.post('/likes', 
        { quote_id: quote.id, reaction: reaction },
        { headers: { 'Authorization': `Bearer ${token}` } } // Add header
      );
      onActionSuccess();
    } catch (error) {
      console.error('Failed to like quote', error);
    }
  };
  
  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this quote?')) {
      try {
        await api.delete(`/quotes/${quote.id}`, {
          headers: { 'Authorization': `Bearer ${token}` } // Add header
        });
        onActionSuccess();
      } catch (error) {
        console.error("Failed to delete quote.", error);
        alert('Deletion failed. Please try again.');
      }
    }
  };
  
  const isAuthor = user && user.id == quote.user_id;
  const userLike = user ? quote.likes.find(like => like.user_id === user.id) : null;

  // ... The JSX return statement remains exactly the same ...
  return (
    <div className="quote-card">
      {isAuthor && (
        <div className="card-author-controls">
          <Link to={`/edit/${quote.id}`} className="control-btn edit-btn">Edit</Link>
          <button onClick={handleDelete} className="control-btn delete-btn">Delete</button>
        </div>
      )}
      <div className="quote-card-content">
        <p className="quote-content">"{quote.content}"</p>
        <div className="quote-footer">
          <div className="author-details">
            <img src={avatarUrl} alt={quote.author} className="author-avatar" />
            <span className="quote-author">{quote.author}</span>
          </div>
          <span className="quote-tags">{quote.tags}</span>
        </div>
      </div>
      <div className="quote-actions">
        <div className="like-section">
          {EMOJI_REACTIONS.map((emoji) => (
            <button key={emoji} className={`reaction-btn ${userLike && userLike.reaction === emoji ? 'user-liked' : ''}`} onClick={() => handleLike(emoji)}>
              {emoji}
            </button>
          ))}
        </div>
        <div className="save-section">
          {user && (<button className="save-btn" onClick={handleSaveClick}>+ Save</button>)}
          {showCollections && (
            <div className="collections-popup">
              {isLoadingCollections ? (<div>Loading...</div>) : (
                collections.length > 0 ? (
                  collections.map(collection => (
                    <div key={collection.id} className="collection-item" onClick={() => handleAddToCollection(collection.id)}>
                      {collection.name}
                    </div>
                  ))
                ) : (<div className="collection-item-none">No collections yet.</div>)
              )}
            </div>
          )}
        </div>
        <div className="like-count">
          <span>{quote.likes.length} Likes</span>
        </div>
      </div>
    </div>
  );
};

export default QuoteCard;