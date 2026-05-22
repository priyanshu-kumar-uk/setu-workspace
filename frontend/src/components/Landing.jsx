import React from 'react';
import { FileText, Video, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Landing.css';

const Landing = () => {

  
  return (
    <div className="landing-page">
      {/* ===== NAVBAR ===== */}
      <nav className="navbar">
        <Link to="/" className="navbar-brand">
          SETU<span className="navbar-brand-highlight"></span>
        </Link>
        <div className="navbar-actions">
          <Link to="/login" className="btn btn-ghost">Sign-in</Link>
          <Link to="/register" className="btn btn-primary">Sign-up</Link>
        </div>
      </nav>

      {/* ===== HERO SECTION ===== */}
      <section className="hero-section">
        <h1 className="hero-headline">
          Collaborate Better. 
          <br />
          <span className="hero-headline-accent">Connect Smarter.</span>
        </h1>
        <p className="hero-subtext">
          Setu brings together video conferencing, real-time notes, and AI-powered intelligence 
          to transform how teams communicate and create together.
        </p>
        <button className="hero-cta-button">Get Started Free</button>
      </section>

      {/* ===== FEATURES SECTION ===== */}
      <section className="features-section">
        <div className="features-container">
          <h2 style={{ 
            fontSize: '2rem', 
            fontWeight: '700', 
            color: '#232333',
            textAlign: 'center',
            marginBottom: '1rem'
          }}>
            Powerful Features
          </h2>
          <p style={{
            fontSize: '1.1rem',
            color: '#666666',
            textAlign: 'center',
            marginBottom: '3rem',
            maxWidth: '600px',
            margin: '0 auto 3rem'
          }}>
            Everything you need for seamless collaboration in one unified platform
          </p>
          
          <div className="features-grid">
            {/* Notes Card */}
            <div className="feature-card">
              <div className="feature-icon">
                <FileText size={32} strokeWidth={1.5} />
              </div>
              <h3 className="feature-title">Smart Notes</h3>
              <p className="feature-description">
                Capture ideas in real-time during meetings. Auto-organized, searchable, 
                and synced across all your devices instantly.
              </p>
            </div>

            {/* Video Room Card */}
            <div className="feature-card">
              <div className="feature-icon">
                <Video size={32} strokeWidth={1.5} />
              </div>
              <h3 className="feature-title">Video Rooms</h3>
              <p className="feature-description">
                Crystal-clear HD video conferencing with support for unlimited participants. 
                Built for teams of any size.
              </p>
            </div>

            {/* AI Card */}
            <div className="feature-card">
              <div className="feature-icon">
                <Sparkles size={32} strokeWidth={1.5} />
              </div>
              <h3 className="feature-title">AI Assistant</h3>
              <p className="feature-description">
                Get intelligent summaries, action items, and insights powered by cutting-edge AI. 
                Never miss important details.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;