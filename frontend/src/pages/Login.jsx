import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as securityService from '../services/securityService';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loginAttempts, setLoginAttempts] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Rate limiting
    const rateLimiter = securityService.createRateLimiter(5, 15 * 60 * 1000);
    const limiterCheck = rateLimiter(email);
    
    if (!limiterCheck.allowed) {
      setError(`Too many login attempts. Please try again in 15 minutes.`);
      return;
    }

    // Validation
    if (!securityService.isValidEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!password) {
      setError('Password is required.');
      return;
    }

    setIsLoading(true);
    setLoginAttempts(prev => prev + 1);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      
      if (err.response?.status === 401) {
        setError('Invalid email or password. Please try again.');
      } else if (err.response?.status === 429) {
        setError('Too many login attempts. Please try again later.');
      } else {
        setError(err.response?.data?.message || 'Login failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>Welcome Back</h2>
        <p className="auth-subtitle">Sign in to your account</p>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              disabled={isLoading}
              required
              autoComplete="email"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              disabled={isLoading}
              required
              autoComplete="current-password"
            />
            <small className="password-hint">
              Min. 12 characters with uppercase, lowercase, number, and special character
            </small>
          </div>
          
          <button type="submit" className="btn btn-primary" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Don't have an account? <a href="/signup">Sign up here</a></p>
          <p><a href="/forgot-password">Forgot your password?</a></p>
        </div>

        <div className="security-notice">
          <small>
            🔒 Your information is encrypted and secure. We never store passwords in plain text.
          </small>
        </div>
      </div>
    </div>
  );
}

export default Login;
