import { Sparkles } from 'lucide-react';
import './AboutAdmin.css';

export function AboutAdmin() {
  return (
    <div className="about-page">
      {/* Hero Header */}
      <section className="about-hero">
        <div>
          <div className="about-kicker">
            <Sparkles size={16} />
            System Info
          </div>
          <h1>About App</h1>
          <p>Information about the school management system portal application.</p>
        </div>
      </section>

      {/* Info Card */}
      <div className="about-card">
        <div className="about-brand-header">
          <h2 className="about-brand-title">SchoolIQ</h2>
          <p className="about-brand-version">Version 1.0.0</p>
        </div>

        <hr className="about-divider" />

        <div className="about-details-list">
          <div className="about-detail-item">
            <span className="about-detail-label">Developer / Publisher</span>
            <span className="about-detail-value">Avenra</span>
          </div>

          <div className="about-detail-item">
            <span className="about-detail-label">Website</span>
            <span className="about-detail-value">
              <a href="https://avenra.org" target="_blank" rel="noopener noreferrer">
                avenra.org
              </a>
            </span>
          </div>

          <div className="about-detail-item">
            <span className="about-detail-label">Support Desk</span>
            <span className="about-detail-value">
              <a href="mailto:founders@avenra.org">
                founders@avenra.org
              </a>
            </span>
          </div>

          <div className="about-detail-item">
            <span className="about-detail-label">Copyright</span>
            <span className="about-detail-value" style={{ color: '#64748b' }}>
              &copy; {new Date().getFullYear()} Avenra. All rights reserved.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
