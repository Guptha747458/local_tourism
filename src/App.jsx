import React, { useState, useMemo, useEffect } from 'react';
import './App.css'; 
import { CATEGORIES, AZURE_COAST_SPOTS } from './data.js';
import { MapPin, Star, ChevronLeft, ChevronRight, X, Waves } from 'lucide-react';
const CategoryIcon = ({ category }) => {
  const categoryData = CATEGORIES.find(c => c.value === category);
  const Icon = categoryData?.icon || MapPin; 
  const colorClass = categoryData?.colorClass || "icon-gray";
  
  return <Icon className={`icon-small icon-card ${colorClass}`} />;
};

const StarRating = ({ rating }) => {
  const fullStars = Math.floor(rating);
  const stars = [];
  for (let i = 0; i < 5; i++) {
    stars.push(
      <Star
        key={i}
        className={`icon-xsmall star-icon ${
          i < fullStars ? 'star-filled' : 'star-empty'
        }`}
        fill={i < fullStars ? 'currentColor' : 'none'}
        aria-hidden="true" 
      />
    );
  }
  return (
    <div className="rating-container">
      {stars}
      {/* A11y: Announce the rating clearly */}
      <span className="sr-only">Rating: {rating} out of 5 stars</span>
      <span aria-hidden="true">({rating})</span>
    </div>
  );
};

// --- Main Components ---

const CategoryFilter = ({ selected, onSelect }) => (
  <div className="filter-bar">
    {CATEGORIES.map(({ name, value, icon: Icon }) => (
      <button
        key={value}
        onClick={() => onSelect(value)}
        className={`filter-button ${selected === value ? 'filter-active' : ''}`}
        aria-pressed={selected === value} 
      >
        <Icon className="icon-small icon-filter" />
        {name}
      </button>
    ))}
  </div>
);

const SpotCard = ({ spot, onSelect }) => (
  <div
    className="spot-card"
    onClick={() => onSelect(spot)}
    onKeyDown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault(); 
        onSelect(spot);
      }
    }}
    role="button"
    tabIndex="0"
    aria-label={`View details for ${spot.name}`} 
  >
    <div className="card-image-wrapper">
      <img
        src={spot.imagePlaceholder}
        alt={`Visual representation of ${spot.name}`} 
        className="card-image"
        onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/600x400/cccccc/333333?text=Image+Missing"; }}
      />
      <div className="card-badge" aria-hidden="true">
        {spot.category}
      </div>
    </div>
    <div className="card-content">
      <h3 className="card-title">{spot.name}</h3>
      <div className="card-meta">
        <StarRating rating={spot.rating} />
        <CategoryIcon category={spot.category} />
      </div>
      <p className="card-description">{spot.description}</p>
      <button
        onClick={(e) => { 
          e.stopPropagation();
          onSelect(spot); 
        }}
        className="card-button"
        aria-label={`View more details for ${spot.name}`} 
      >
        View Details <ChevronRight className="icon-xsmall icon-right" />
      </button>
    </div>
  </div>
);

const SpotDetail = ({ spot, onBack }) => {
  // A11y: Add 'Escape' key listener to close the modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onBack();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    
    // Cleanup function to remove listener
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onBack]); // Dependency array ensures 'onBack' is not stale

  return (
    <div 
      className="detail-overlay"
      // A11y: Modal attributes
      role="dialog"
      aria-modal="true"
      aria-labelledby="detail-title"
    >
      <div className="detail-container">
        
        {/* Detail Header */}
        <div className="detail-header-image-wrapper">
          <img
            src={spot.imagePlaceholder}
            alt={`Header for ${spot.name}`}
            className="detail-header-image"
            onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/800x600/cccccc/333333?text=Image+Missing"; }}
          />
          <button
            onClick={onBack}
            className="detail-back-button"
            aria-label="Go back to list"
          >
            <ChevronLeft className="icon-medium" />
          </button>
        </div>

        {/* Detail Body */}
        <div className="detail-content-body">
          {/* A11y: This 'id' matches the 'aria-labelledby' on the overlay */}
          <h1 className="detail-title" id="detail-title">{spot.name}</h1>
          
          <div className="detail-meta-group">
            <div className="detail-meta-item">
              <CategoryIcon category={spot.category} />
              <span className="detail-meta-text">{spot.category}</span>
            </div>
            <div className="detail-meta-divider" aria-hidden="true">|</div>
            <StarRating rating={spot.rating} />
          </div>

          <p className="detail-description-quote">
            "{spot.description}"
          </p>

          <h2 className="detail-subtitle">Key Information</h2>
          <p className="detail-body-text">{spot.details}</p>

          <div className="detail-tip-box">
              <MapPin className="icon-medium icon-indigo tip-icon" />
              <div>
                <h3 className="tip-title">How to Get There</h3>
                <p className="tip-text">Location is available on most local maps. Public transport available.</p>
              </div>
          </div>
        </div>
        
        {/* Footer Button (for mobile usability) */}
          <div className="detail-footer-bar">
            <button
              onClick={onBack}
              className="detail-close-button"
            >
              <X className="icon-small icon-white mr-2" /> Close Details
            </button>
          </div>
      </div>
    </div>
  );
};

const App = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSpot, setSelectedSpot] = useState(null);

  const filteredSpots = useMemo(() => {
    if (selectedCategory === 'All') {
      return AZURE_COAST_SPOTS;
    }
    return AZURE_COAST_SPOTS.filter(spot => spot.category === selectedCategory);
  }, [selectedCategory]);

  if (selectedSpot) {
    return <SpotDetail spot={selectedSpot} onBack={() => setSelectedSpot(null)} />;
  }

  return (
    <div className="app-container">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <h1 className="header-title">
            <Waves className="header-icon" />
            Local Tourism Guide App
          </h1>
          <p className="header-subtitle">Discover the best sights, tastes, and nature of the coast.</p>
        </div>
      </header>

      <main className="main-content">
        {/* Category Filter */}
        <CategoryFilter
          selected={selectedCategory}
          onSelect={setSelectedCategory}
        />
        
        {/* Results Count */}
        <div className="results-count">
            Showing {filteredSpots.length} {selectedCategory !== 'All' ? selectedCategory : 'total'} spots
        </div>

        {/* Spot List Grid */}
        <section className="spot-grid">
          {filteredSpots.length > 0 ? (
            filteredSpots.map(spot => (
              <SpotCard
                key={spot.id}
                spot={spot}
                onSelect={setSelectedSpot}
              />
            ))
          ) : (
            <div className="empty-state">
              <h3>No Spots Found</h3>
              <p>Try selecting a different category or view all spots.</p>
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="footer">
        <p>
          © {new Date().getFullYear()} Azure Coast Guide. Frontend powered by React & Custom CSS.
        </p>
      </footer>
    </div>
  );
};

export default App;