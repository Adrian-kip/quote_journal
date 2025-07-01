import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import QuoteCard from '../components/QuoteCard';
import './HomePage.css';

const HomePage = () => {
  const [quotes, setQuotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { api } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  const fetchQuotes = useCallback(async (query) => {
    try {
      const url = query ? `/quotes?q=${query}` : '/quotes';
      const response = await api.get(url);
      setQuotes(response.data);
    } catch (error) {
      console.error("Failed to fetch quotes", error);
    } finally {
      setIsLoading(false); 
    }
  }, [api]);

  
  useEffect(() => {
    setIsLoading(true);
    fetchQuotes(); 

    const handleQuotesUpdate = () => fetchQuotes(searchTerm);
    
    
    window.addEventListener('quotesUpdated', handleQuotesUpdate);

    
    return () => {
      window.removeEventListener('quotesUpdated', handleQuotesUpdate);
    };
  }, []); 

  const handleSearch = (e) => {
    e.preventDefault();
    fetchQuotes(searchTerm);
  };
  
  
  const handleActionSuccess = () => {
    fetchQuotes(searchTerm);
  };

  if (isLoading) {
    return <div>Loading quotes...</div>;
  }

  return (
    <div>
      <div className="search-container">
        <form onSubmit={handleSearch}>
          <input type="text" placeholder="Search for quotes..." className="search-input" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          <button type="submit" className="search-button">Search</button>
        </form>
      </div>

      <div className="quote-feed">
        {quotes.length > 0 ? (
          quotes.map(quote => (
            <QuoteCard key={quote.id} quote={quote} onActionSuccess={handleActionSuccess} />
          ))
        ) : (
          <p className="no-quotes-message">No quotes found. Try a different search or create one!</p>
        )}
      </div>
    </div>
  );
};

export default HomePage;