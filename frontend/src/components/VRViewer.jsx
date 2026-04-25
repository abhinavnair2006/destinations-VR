import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Cloud, Thermometer, Wind, Info, Map } from 'lucide-react';

function VRViewer() {
  const { id } = useParams();
  const [destination, setDestination] = useState(null);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showInfo, setShowInfo] = useState(false);
  const sceneRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const destRes = await axios.get(`http://localhost:5000/api/destinations/${id}`);
        setDestination(destRes.data);
        
        const weatherRes = await axios.get(`http://localhost:5000/api/destinations/${id}/weather`);
        setWeather(weatherRes.data);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) return (
    <div className="loading-screen vr-loading">
      <div className="spinner"></div>
      <p>Entering the VR Dimension...</p>
    </div>
  );
  
  if (!destination) return <div className="loading">Destination not found.</div>;

  return (
    <div className="vr-container">
      {/* VR Scene */}
      <a-scene 
        ref={sceneRef} 
        renderer="antialias: true; colorManagement: true;"
        loading-screen="enabled: false"
      >
        <a-assets timeout="15000">
          <img id="sky-texture" src={destination.image360Url} crossOrigin="anonymous" />
        </a-assets>

        {/* --- HIGH-QUALITY 360 IMMERSIVE ENVIRONMENT --- */}
        {/* We use a large radius to minimize distortion and shader:flat for maximum clarity */}
        <a-sky 
          src="#sky-texture" 
          radius="500"
          rotation="0 -90 0"
          material="shader: flat; side: back; src: #sky-texture; npot: true"
          animation="property: rotation; to: 0 270 0; dur: 600000; easing: linear; loop: true"
        ></a-sky>

        {/* Global Atmosphere Lighting - Boosted for better visibility */}
        <a-light type="ambient" color="#FFF" intensity="1.5"></a-light>
        <a-light type="directional" color="#FFF" intensity="0.5" position="-1 4 3"></a-light>

        {/* Camera with interactive cursor */}
        <a-camera look-controls="reverseMouseDrag: true" position="0 1.6 0">
          <a-cursor 
            color="#0ea5e9"
            animation__click="property: scale; startEvents: click; easing: easeInCubic; dur: 150; from: 0.1 0.1 0.1; to: 1 1 1"
          ></a-cursor>
        </a-camera>
      </a-scene>

      {/* --- PREMIUM UI OVERLAY --- */}
      <div className="vr-interface">
        <div className="vr-top-nav">
          <Link to="/" className="glass-btn back-link">
            <ArrowLeft size={18} /> Exit VR
          </Link>
          
          <div className="vr-location-badge glass-panel">
            <Map size={16} className="icon-blue" />
            <span>{destination.name}, {destination.country}</span>
          </div>
        </div>

        <div className={`vr-side-panel glass-panel ${showInfo ? 'expanded' : ''}`}>
          <button className="panel-toggle" onClick={() => setShowInfo(!showInfo)}>
            <Info size={24} />
          </button>
          
          {showInfo && (
            <div className="panel-content fade-in">
              <h3>About {destination.name}</h3>
              <p>{destination.description}</p>
              
              <div className="weather-grid">
                <div className="weather-item">
                  <Thermometer size={18} />
                  <span>{Math.round(weather?.main?.temp || 0)}°C</span>
                </div>
                <div className="weather-item">
                  <Cloud size={18} />
                  <span>{weather?.weather?.[0]?.description || 'Clear Sky'}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Floating Mini Weather Badge */}
        {!showInfo && weather && (
          <div className="vr-quick-weather glass-panel fade-in">
            <Thermometer size={16} />
            <span>{Math.round(weather.main?.temp || 0)}°C</span>
            <span className="separator">|</span>
            <span className="weather-desc">{weather.weather?.[0]?.main}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default VRViewer;
