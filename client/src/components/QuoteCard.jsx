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
    if (!user) return alert('You must be logged in to save quotes.');
    setShowCollections(!showCollections);
    if (!showCollections && collections.length === 0) {
      setIsLoadingCollections(true);
      try {
        const response = await api.get('/collections', { headers: { 'Authorization': `Bearer ${token}` } });
        setCollections(response.data);
      } catch (error) { console.error("Failed to fetch collections", error); }
      finally { setIsLoadingCollections(false); }
    }
  };

  const handleAddToCollection = async (collectionId) => {
    try {
      await api.post('/collections/add-quote', 
        { quote_id: quote.id, collection_id: collectionId },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      alert(`Quote saved to collection!`);
      setShowCollections(false);
    } catch (error) {
      console.error("Failed to add quote to collection", error);
      // --- Improved Error Handling ---
      if (error.response && error.response.status === 409) {
        // If the error is a 409 Conflict, show the specific message from the server.
        alert(error.response.data.msg);
      } else {
        // Otherwise, show the generic message.
        alert("Failed to save quote.");
      }
      // -----------------------------
    }
  };

  const handleLike = async (reaction) => {
    if (!user) return;
    try {
      const response = await api.post('/likes', 
        { quote_id: quote.id, reaction: reaction },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      onActionSuccess(response.data);
    } catch (error) { console.error('Failed to like quote', error); }
  };
  
  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this quote?')) {
      try {
        await api.delete(`/quotes/${quote.id}`, { headers: { 'Authorization': `Bearer ${token}` } });
        onActionSuccess();
      } catch (error) {
        console.error("Failed to delete quote.", error);
        alert('Deletion failed. Please try again.');
      }
    }
  };
  
  const isAuthor = user && user.id == quote.user_id;
  const userLike = user ? quote.likes.find(like => like.user_id === user.id) : null;

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
            <Link to={`/users/${quote.user_id}`} className="quote-author-link">
              <span className="quote-author">{quote.author}</span>
            </Link>
          </div>
          <div className="quote-tags">
            {(quote.tags || '').split(',').map(tag => tag.trim()).filter(tag => tag).map(tag => (
              <Link to={`/tags/${tag.replace('#', '')}`} key={tag} className="tag-link">
                {tag}
              </Link>
            ))}
          </div>
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