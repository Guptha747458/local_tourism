import React, { useState, useMemo, useEffect } from 'react';
import './App.css';
import { CATEGORIES, AZURE_COAST_SPOTS } from './data.js';
import { MapPin, Star, ChevronLeft, ChevronRight, X, Waves, Heart, List, Home } from 'lucide-react';

// --- Shared Components (Kept the same) ---

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
        className={`icon-xsmall star-icon ${i < fullStars ? 'star-filled' : 'star-empty'
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

// --- Main Components (Kept the same) ---

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

// SpotCard updated to include 'onToggleFavorite' and 'isFavorite'
const SpotCard = ({ spot, onSelect, isFavorite, onToggleFavorite }) => (
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
    <button
      className={`favorite-toggle-button ${isFavorite ? 'is-favorite' : ''}`}
      onClick={(e) => {
        e.stopPropagation(); // Prevent card click
        onToggleFavorite(spot.id);
      }}
      aria-label={isFavorite ? `Remove ${spot.name} from favorites` : `Add ${spot.name} to favorites`}
    >
      <Heart className="icon-small" fill={isFavorite ? 'currentColor' : 'none'} />
    </button>
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

// --- UPDATED SpotDetail Component ---
const SpotDetail = ({ spot, onBack, isFavorite, onToggleFavorite }) => {
  // A11y: Add 'Escape' key listener to close the modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onBack();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onBack]);

  // NEW: Create the Google Maps URL
  // This opens Google Maps directions with the spot as the destination.
  // It will use the user's current location as the starting point.
  const directionsUrl = useMemo(() => {
    const destination = encodeURIComponent(spot.name);
    return `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
  }, [spot.name]);

  return (
    <div
      className="detail-overlay"
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

          <button
            className={`detail-favorite-toggle ${isFavorite ? 'is-favorite' : ''}`}
            onClick={() => onToggleFavorite(spot.id)}
            aria-label={isFavorite ? `Remove ${spot.name} from favorites` : `Add ${spot.name} to favorites`}
          >
            <Heart className="icon-medium" fill={isFavorite ? 'currentColor' : 'none'} />
          </button>
        </div>

        {/* Detail Body */}
        <div className="detail-content-body">
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

          {/* --- MODIFIED SECTION --- */}
          <div className="detail-tip-box">
            <MapPin className="icon-medium icon-indigo tip-icon" />
            <div className="tip-content-wrapper"> {/* Added wrapper for layout */}
              <h3 className="tip-title">How to Get There</h3>
              <p className="tip-text">Location is available on most local maps. Public transport available.</p>

              {/* NEW: "Get Directions" button 
                  This is an anchor 'a' tag styled as a button.
                */}
              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="card-button get-directions-button"
                aria-label={`Get directions to ${spot.name}`}
              >
                Get Directions
              </a>
            </div>
          </div>
          {/* --- END OF MODIFIED SECTION --- */}

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


// --- New Home Page Component (No changes) ---
const HomePage = ({ selectedCategory, setSelectedCategory, filteredSpots, setSelectedSpot, favoriteSpotIds, onToggleFavorite }) => (
  <main className="main-content">
    <CategoryFilter
      selected={selectedCategory}
      onSelect={setSelectedCategory}
    />
    <div className="results-count">
      Showing **{filteredSpots.length}** {selectedCategory !== 'All' ? selectedCategory : 'total'} spots
    </div>
    <section className="spot-grid">
      {filteredSpots.length > 0 ? (
        filteredSpots.map(spot => (
          <SpotCard
            key={spot.id}
            spot={spot}
            onSelect={setSelectedSpot}
            isFavorite={favoriteSpotIds.includes(spot.id)}
            onToggleFavorite={onToggleFavorite}
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
);

// --- New Favorites Page Component (No changes) ---
const FavoritesPage = ({ favoriteSpots, setSelectedSpot, favoriteSpotIds, onToggleFavorite }) => (
  <main className="main-content">
    <header className="page-header">
      <h2 className="page-title">
        <Heart className="header-icon" /> Your Favorite Spots
      </h2>
      <p className="page-subtitle">A collection of your top picks on the Azure Coast.</p>
    </header>

    <div className="results-count">
      You have **{favoriteSpots.length}** favorite spots
    </div>

    <section className="spot-grid">
      {favoriteSpots.length > 0 ? (
        favoriteSpots.map(spot => (
          <SpotCard
            key={spot.id}
            spot={spot}
            onSelect={setSelectedSpot}
            isFavorite={favoriteSpotIds.includes(spot.id)}
            onToggleFavorite={onToggleFavorite}
          />
        ))
      ) : (
        <div className="empty-state">
          <h3>No Favorites Yet!</h3>
          <p>Find a spot you love on the home page and click the heart icon to add it here.</p>
        </div>
      )}
    </section>
  </main>
);

// --- New Navigation Component (No changes) ---
const BottomNavigation = ({ currentPage, onNavigate }) => (
  <nav className="bottom-nav">
    <button
      className={`nav-button ${currentPage === 'home' ? 'nav-active' : ''}`}
      onClick={() => onNavigate('home')}
      aria-current={currentPage === 'home' ? 'page' : undefined}
    >
      <Home className="icon-medium" />
      Home
    </button>
    <button
      className={`nav-button ${currentPage === 'favorites' ? 'nav-active' : ''}`}
      onClick={() => onNavigate('favorites')}
      aria-current={currentPage === 'favorites' ? 'page' : undefined}
    >
      <Heart className="icon-medium" />
      Favorites
    </button>
  </nav>
);

// --- Updated App Component (No changes) ---
const App = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [currentPage, setCurrentPage] = useState('home');
  const [favoriteSpotIds, setFavoriteSpotIds] = useState(() => {
    try {
      const storedFavorites = localStorage.getItem('azureCoastFavorites');
      return storedFavorites ? JSON.parse(storedFavorites) : [];
    } catch (error) {
      console.error("Could not load favorites from localStorage:", error);
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('azureCoastFavorites', JSON.stringify(favoriteSpotIds));
    } catch (error) {
      console.error("Could not save favorites to localStorage:", error);
    }
  }, [favoriteSpotIds]);

  const toggleFavorite = (spotId) => {
    setFavoriteSpotIds(prevIds => {
      if (prevIds.includes(spotId)) {
        return prevIds.filter(id => id !== spotId);
      } else {
        return [...prevIds, spotId];
      }
    });
  };

  const filteredSpots = useMemo(() => {
    if (selectedCategory === 'All') {
      return AZURE_COAST_SPOTS;
    }
    return AZURE_COAST_SPOTS.filter(spot => spot.category === selectedCategory);
  }, [selectedCategory]);

  const favoriteSpots = useMemo(() => {
    return AZURE_COAST_SPOTS.filter(spot => favoriteSpotIds.includes(spot.id));
  }, [favoriteSpotIds]);

  if (selectedSpot) {
    return (
      <SpotDetail
        spot={selectedSpot}
        onBack={() => setSelectedSpot(null)}
        s isFavorite={favoriteSpotIds.includes(selectedSpot.id)}
        onToggleFavorite={toggleFavorite}
      />
    );
  }

  const renderMainContent = () => {
    if (currentPage === 'favorites') {
      return (
        <FavoritesPage
          favoriteSpots={favoriteSpots}
          setSelectedSpot={setSelectedSpot}
          favoriteSpotIds={favoriteSpotIds}
          onToggleFavorite={toggleFavorite}
        />
      );
    }
    return (
      <HomePage
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        filteredSpots={filteredSpots}
        setSelectedSpot={setSelectedSpot}
        favoriteSpotIds={favoriteSpotIds}
        _ onToggleFavorite={toggleFavorite}
      />
    );
  };

  return (
    <div className="app-container">
      <header className="header">
        <div className="header-content">
          <h1 className="header-title">
            <Waves className="header-icon" />
            Local Tourism Guide App
          </h1>
          <p className="header-subtitle">Discover the best sights, tastes, and nature of the coast.</p>
        </div>
      </header>

      {renderMainContent()}

      <footer className="footer">
        <p>
          © {new Date().getFullYear()} Azure Coast Guide. Frontend powered by React & Custom CSS.
        </p>
      </footer>

      <BottomNavigation currentPage={currentPage} onNavigate={setCurrentPage} />
    </div>
  );
};

export default App;