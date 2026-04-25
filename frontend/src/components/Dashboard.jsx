import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { MapPin, ArrowRight, Search, Globe, Compass } from 'lucide-react';

function Dashboard() {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/destinations');
        setDestinations(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching destinations:', error);
        setLoading(false);
      }
    };

    fetchDestinations();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearching(true);
    try {
      const response = await axios.post('http://localhost:5000/api/destinations/search', { query: searchQuery });
      const newDest = response.data;
      navigate(`/destination/${newDest._id}`);
    } catch (error) {
      alert('Could not find that destination. Please try another city.');
    } finally {
      setSearching(false);
    }
  };

  if (loading) return <div className="loading-screen">
    <div className="spinner"></div>
    <p>Preparing your global journey...</p>
  </div>;

  return (
    <div className="dashboard">
      <div className="hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="hero-title">Experience the World in VR</h1>
          <p className="hero-subtitle">
            Search any city and immerse yourself in its atmosphere from anywhere.
          </p>
          
          <form onSubmit={handleSearch} className="search-container">
            <Search className="search-icon" size={24} />
            <input 
              type="text" 
              placeholder="Where do you want to go? (e.g., London, Sydney, Dubai)" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-btn" disabled={searching}>
              {searching ? 'Finding...' : 'Explore Now'}
            </button>
          </form>
        </div>
      </div>

      <div className="destinations-section">
        <div className="section-header">
          <h2 className="section-title">
            <Compass size={28} className="icon-blue" />
            Trending Destinations
          </h2>
          <p className="section-desc">Handpicked experiences for your next virtual adventure.</p>
        </div>

        <div className="destinations-grid">
          {destinations.map((dest) => (
            <Link to={`/destination/${dest._id}`} key={dest._id} className="destination-card">
              <div className="card-image-container">
                <img src={dest.thumbnailUrl} alt={dest.name} className="card-image" />
                <div className="card-badge">{dest.country}</div>
              </div>
              <div className="card-content">
                <h3 className="card-title">
                  <MapPin size={20} className="icon-blue" />
                  {dest.name}
                </h3>
                <p className="card-description">{dest.description.substring(0, 100)}...</p>
                <div className="card-footer">
                  <span className="card-action">
                    Enter Experience <ArrowRight size={16} />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
