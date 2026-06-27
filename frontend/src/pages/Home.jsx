import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="home-container">
      <section className="hero">
        <div className="hero-content">
          <h1>🧠 Your Mental Health AI Companion</h1>
          <p>Supporting cybersecurity students' mental wellness with AI-powered guidance</p>
          <Link to="/signup" className="cta-button">Get Started</Link>
        </div>
      </section>

      <section className="features">
        <h2>Why Choose MindCompanion?</h2>
        <div className="feature-grid">
          <div className="feature-card">
            <div className="feature-icon">🤖</div>
            <h3>AI Chatbot</h3>
            <p>24/7 intelligent support that understands your challenges</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Wellness Tracking</h3>
            <p>Monitor your mental health with regular assessments</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📚</div>
            <h3>Resource Library</h3>
            <p>Expert-curated content for stress management and mindfulness</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">👥</div>
            <h3>Community Support</h3>
            <p>Connect with peers facing similar challenges</p>
          </div>
        </div>
      </section>

      <section className="testimonials">
        <h2>Student Testimonials</h2>
        <div className="testimonial-grid">
          <div className="testimonial-card">
            <p>"MindCompanion helped me manage burnout during my final semester. Highly recommended!"</p>
            <strong>- Alex, Cybersecurity Student</strong>
          </div>
          <div className="testimonial-card">
            <p>"The AI chatbot actually understands the stress of incident response work."</p>
            <strong>- Jordan, Security Analyst</strong>
          </div>
          <div className="testimonial-card">
            <p>"Finally, a mental health tool designed specifically for tech professionals."</p>
            <strong>- Casey, Security Researcher</strong>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <h2>Ready to prioritize your mental health?</h2>
        <p>Join hundreds of cybersecurity students using MindCompanion</p>
        <Link to="/signup" className="cta-button large">Start Your Journey Today</Link>
      </section>
    </div>
  );
}

export default Home;
