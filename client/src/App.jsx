import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import './App.css';
import { CATEGORIES, AZURE_COAST_SPOTS } from './data.js';
import { MapPin, Star, ChevronLeft, ChevronRight, X, Waves, Heart, Home, LogOut } from 'lucide-react';

import { LoginPage } from './LoginPage.jsx';
import { SignUpPage } from './SignPage.jsx';
import { ForgotPasswordPage } from './ForgotPasswordPage.jsx';
import { ResetPasswordPage } from './ResetPasswordPage.jsx';

const BASE_URL = import.meta.env.VITE_REACT_APP_BACKEND_BASEURL;

// --- Shared Components ---

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
        className={`icon-xsmall star-icon ${i < fullStars ? 'star-filled' : 'star-empty'}`}
        fill={i < fullStars ? 'currentColor' : 'none'}
        aria-hidden="true"
      />
    );
  }
  return (
    <div className="rating-container">
      {stars}
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
        e.stopPropagation();
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

const SpotDetail = ({ spot, onBack, isFavorite, onToggleFavorite }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onBack();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onBack]);

  const directionsUrl = useMemo(() => {
    const destination = encodeURIComponent(spot.name);
    return `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
  }, [spot.name]);

  return (
    <div className="detail-overlay" role="dialog" aria-modal="true" aria-labelledby="detail-title">
      <div className="detail-container">
        <div className="detail-header-image-wrapper">
          <img
            src={spot.imagePlaceholder}
            alt={`Header for ${spot.name}`}
            className="detail-header-image"
            onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/800x600/cccccc/333333?text=Image+Missing"; }}
          />
          <button onClick={onBack} className="detail-back-button" aria-label="Go back to list">
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
          <p className="detail-description-quote">"{spot.description}"</p>
          <h2 className="detail-subtitle">Key Information</h2>
          <p className="detail-body-text">{spot.details}</p>
          <div className="detail-tip-box">
            <MapPin className="icon-medium icon-indigo tip-icon" />
            <div className="tip-content-wrapper">
              <h3 className="tip-title">How to Get There</h3>
              <p className="tip-text">{spot.transport}</p>
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
        </div>

        <div className="detail-footer-bar">
          <button onClick={onBack} className="detail-close-button">
            <X className="icon-small icon-white mr-2" /> Close Details
          </button>
        </div>
      </div>
    </div>
  );
};

const HomePage = ({ selectedCategory, setSelectedCategory, filteredSpots, setSelectedSpot, favoriteSpotIds, onToggleFavorite }) => (
  <main className="main-content">
    <CategoryFilter selected={selectedCategory} onSelect={setSelectedCategory} />
    <div className="results-count">
      Showing {filteredSpots.length} {selectedCategory !== 'All' ? selectedCategory : 'total'} spots
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

const FavoritesPage = ({ favoriteSpots, setSelectedSpot, favoriteSpotIds, onToggleFavorite }) => (
  <main className="main-content">
    <header className="page-header">
      <h2 className="page-title">
        <Heart className="header-icon" /> Your Favorite Spots
      </h2>
      <p className="page-subtitle">A collection of your top picks on the Azure Coast.</p>
    </header>
    <div className="results-count">You have {favoriteSpots.length} favorite spots</div>
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

// --- App Component ---
const App = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [currentPage, setCurrentPage] = useState('home');

  // Auth state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authPage, setAuthPage] = useState('login');
  const [userName, setUserName] = useState('');
  const [authLoading, setAuthLoading] = useState(true); // checking session on load

  // Favorites — synced to MongoDB when logged in
  const [favoriteSpotIds, setFavoriteSpotIds] = useState([]);
  // Debounce timer ref for saving favorites to server
  const favSaveTimer = useRef(null);
  // Track whether this is the first favorites load (skip save on init)
  const favInitialized = useRef(false);

  // ── Restore session on page load ──────────────────────────────────────────
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch(`${BASE_URL}api/me`, {
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          setIsLoggedIn(true);
          setUserName(data.user.name);
          // Merge server favorites with any localStorage favorites (migration path)
          const serverFavs = data.user.favorites || [];
          const localFavs = (() => {
            try {
              return JSON.parse(localStorage.getItem('azureCoastFavorites') || '[]');
            } catch { return []; }
          })();
          const merged = [...new Set([...serverFavs, ...localFavs])];
          setFavoriteSpotIds(merged);
          favInitialized.current = true;
        }
      } catch (err) {
        console.warn('Session check failed:', err);
      } finally {
        setAuthLoading(false);
      }
    };
    checkSession();
  }, []);

  // ── Sync favorites to server (debounced, 1 second) ───────────────────────
  useEffect(() => {
    if (!isLoggedIn || !favInitialized.current) return;

    // Also keep localStorage as offline fallback
    try {
      localStorage.setItem('azureCoastFavorites', JSON.stringify(favoriteSpotIds));
    } catch { /* ignore */ }

    if (favSaveTimer.current) clearTimeout(favSaveTimer.current);
    favSaveTimer.current = setTimeout(async () => {
      try {
        await fetch(`${BASE_URL}api/favorites`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ favorites: favoriteSpotIds }),
        });
      } catch (err) {
        console.warn('Failed to sync favorites:', err);
      }
    }, 1000);

    return () => { if (favSaveTimer.current) clearTimeout(favSaveTimer.current); };
  }, [favoriteSpotIds, isLoggedIn]);

  const toggleFavorite = useCallback((spotId) => {
    setFavoriteSpotIds(prevIds =>
      prevIds.includes(spotId)
        ? prevIds.filter(id => id !== spotId)
        : [...prevIds, spotId]
    );
  }, []);

  const filteredSpots = useMemo(() => {
    if (selectedCategory === 'All') return AZURE_COAST_SPOTS;
    return AZURE_COAST_SPOTS.filter(spot => spot.category === selectedCategory);
  }, [selectedCategory]);

  const favoriteSpots = useMemo(() =>
    AZURE_COAST_SPOTS.filter(spot => favoriteSpotIds.includes(spot.id)),
    [favoriteSpotIds]
  );

  // ── Auth Handlers ─────────────────────────────────────────────────────────
  const handleAuthSuccess = useCallback((user) => {
    setIsLoggedIn(true);
    setUserName(user.name);
    const serverFavs = user.favorites || [];
    const localFavs = (() => {
      try { return JSON.parse(localStorage.getItem('azureCoastFavorites') || '[]'); }
      catch { return []; }
    })();
    const merged = [...new Set([...serverFavs, ...localFavs])];
    setFavoriteSpotIds(merged);
    favInitialized.current = true;
    setAuthPage('login');
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await fetch(`${BASE_URL}api/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch { /* ignore network errors on logout */ }
    setIsLoggedIn(false);
    setUserName('');
    setFavoriteSpotIds([]);
    favInitialized.current = false;
    setSelectedSpot(null);
    setCurrentPage('home');
    setAuthPage('login');
  }, []);

  // ── Loading splash while checking session ─────────────────────────────────
  if (authLoading) {
    return (
      <div className="auth-container">
        <p style={{ color: 'var(--color-primary, #6366f1)', fontWeight: 600 }}>Loading…</p>
      </div>
    );
  }

  // ── Reset-password deep link — handle before auth gates ───────────────────
  // When user clicks the emailed link (/reset-password?token=...) render the
  // reset form regardless of login state.
  const isResetPath = window.location.pathname === '/reset-password' ||
    new URLSearchParams(window.location.search).has('token');
  if (isResetPath) {
    return (
      <ResetPasswordPage
        onNavigateToLogin={() => {
          // Strip the token param and navigate back to login
          window.history.replaceState({}, '', '/');
          setAuthPage('login');
        }}
      />
    );
  }

  // ── Auth gates — single clean if/else chain ───────────────────────────────
  if (!isLoggedIn) {
    if (authPage === 'signup') {
      return (
        <SignUpPage
          onSignUpSuccess={handleAuthSuccess}
          onNavigateToLogin={() => setAuthPage('login')}
        />
      );
    }
    if (authPage === 'forgot') {
      return (
        <ForgotPasswordPage
          onNavigateToLogin={() => setAuthPage('login')}
        />
      );
    }
    // Default: login
    return (
      <LoginPage
        onLoginSuccess={handleAuthSuccess}
        onNavigateToSignUp={() => setAuthPage('signup')}
        onNavigateToForgotPassword={() => setAuthPage('forgot')}
      />
    );
  }

  // ── Spot detail modal ─────────────────────────────────────────────────────
  if (selectedSpot) {
    return (
      <SpotDetail
        spot={selectedSpot}
        onBack={() => setSelectedSpot(null)}
        isFavorite={favoriteSpotIds.includes(selectedSpot.id)}
        onToggleFavorite={toggleFavorite}
      />
    );
  }

  // ── Main app ──────────────────────────────────────────────────────────────
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
        onToggleFavorite={toggleFavorite}
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
        <button onClick={handleLogout} className="logout-button" aria-label="Log out">
          <LogOut className="icon-medium" />
          {userName && <span className="logout-username">{userName}</span>}
        </button>
      </header>

      {renderMainContent()}

      <footer className="footer">
        <p>
          © {new Date().getFullYear()} Azure Coast Guide. Frontend powered by React &amp; Custom CSS.
        </p>
      </footer>

      <BottomNavigation currentPage={currentPage} onNavigate={setCurrentPage} />
    </div>
  );
};

export default App;