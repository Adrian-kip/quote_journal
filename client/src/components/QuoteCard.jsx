import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './QuoteCard.css';

const EMOJI_REACTIONS = ['❤️', '😂', '👍', '🔥'];

const QuoteCard = ({ quote, onActionSuccess }) => {
  const { user, api } = useAuth();

  const handleLike = async (reaction) => {
    if (!user) {
      alert('You must be logged in to like a quote.');
      return;
    }
    try {
      await api.post('/likes', {
        quote_id: quote.id,
        reaction: reaction,
      });
      
      onActionSuccess();
    } catch (error) {
      console.error('Failed to like quote', error);
    }
  };

  
  const handleDelete = async () => {
    
    
    console.log("--- FRONTEND CHECK ---");
    console.log(`Frontend sees user.id: ${user.id} (Type: ${typeof user.id})`);
    console.log(`Frontend sees quote.user_id: ${quote.user_id} (Type: ${typeof quote.user_id})`);
    console.log(`Frontend is sending quote.id: ${quote.id} to the API.`);
    

    if (window.confirm('Are you sure you want to delete this quote?')) {
      try {
        await api.delete(`/quotes/${quote.id}`);
        onActionSuccess();
      } catch (error) {
        console.error("API call failed. Check the Flask server's terminal output for the backend check.", error);
        alert('Deletion failed. Please check the developer console and the Flask server terminal for more information.');
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

      <p className="quote-content">"{quote.content}"</p>

      <div className="quote-footer">
        <span className="quote-author">- {quote.author}</span>
        <span className="quote-tags">{quote.tags}</span>
      </div>

      <div className="quote-actions">
        <div className="like-section">
          {EMOJI_REACTIONS.map((emoji) => (
            <button
              key={emoji}
              className={`reaction-btn ${userLike && userLike.reaction === emoji ? 'user-liked' : ''}`}
              onClick={() => handleLike(emoji)}
            >
              {emoji}
            </button>
          ))}
        </div>
        <div className="like-count">
          <span>{quote.likes.length} Likes</span>
        </div>
      </div>
    </div>
  );
};

export default QuoteCard;