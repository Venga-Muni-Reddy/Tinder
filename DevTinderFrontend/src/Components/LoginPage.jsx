import axios from 'axios';
import { useState } from 'react';
import { VITE_BASE_URL } from '../config';
import { useDispatch } from 'react-redux';
import { addUser } from '../redux/userSlice';
import { Link, useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const validateForm = () => {
    const newErrors = {};
    if (!email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Email address is invalid';
    if (!password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      const res = await axios.post(
        `${VITE_BASE_URL}/login`,
        { emailID: email, password },
        { withCredentials: true }
      );
      dispatch(addUser(res.data));
      navigate('/body/feed');
    } catch (error) {
      setErrors({ api: 'Invalid credentials. Please check your email and password.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="card auth-card">
        <div className="auth-logo"><span className="brand-mark">&lt;/&gt;</span></div>
        <h2 className="auth-title">Welcome back</h2>
        <p className="auth-sub">Log in to match with developers like you.</p>

        {errors.api && <div className="alert alert-error">{errors.api}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email address</label>
            <input
              id="email"
              className="form-input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {errors.email && <div className="form-hint" style={{ color: 'var(--danger)' }}>{errors.email}</div>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <div className="pw-field">
              <input
                id="password"
                className="form-input"
                type={showPassword ? 'text' : 'password'}
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="pw-toggle"
                onClick={() => setShowPassword((v) => !v)}
                aria-label="Toggle password visibility"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            {errors.password && <div className="form-hint" style={{ color: 'var(--danger)' }}>{errors.password}</div>}
          </div>

          <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Log in'}
          </button>
        </form>

        <div className="auth-switch">
          New to DevTinder? <Link to="/signup">Create an account</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
