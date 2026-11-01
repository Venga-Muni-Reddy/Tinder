import { useState } from 'react';
import axios from 'axios';
import { VITE_BASE_URL } from '../config';
import { Link, useNavigate } from 'react-router-dom';

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', emailID: '', password: '', confirmPassword: '',
    age: '', gender: '', photoUrl: '', about: '', skills: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    if (!formData.firstName || !formData.emailID || !formData.password || !formData.age || !formData.gender) {
      setError('Please fill in all required fields.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        emailID: formData.emailID,
        password: formData.password,
        age: formData.age,
        gender: formData.gender,
        about: formData.about || undefined,
        skills: formData.skills ? formData.skills.split(',').map((s) => s.trim()).filter(Boolean) : [],
      };
      if (formData.photoUrl) payload.photoUrl = formData.photoUrl;

      const response = await axios.post(`${VITE_BASE_URL}/signup`, payload);
      setSuccess(response.data.message || 'Signup successful! Redirecting to login...');
      setTimeout(() => navigate('/body/login'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="card auth-card wide">
        <div className="auth-logo"><span className="brand-mark">&lt;/&gt;</span></div>
        <h2 className="auth-title">Join DevTinder</h2>
        <p className="auth-sub">Connect with developers who share your stack and your ambition.</p>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">First name *</label>
              <input className="form-input" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="Ada" />
            </div>
            <div className="form-group">
              <label className="form-label">Last name</label>
              <input className="form-input" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Lovelace" />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email address *</label>
            <input className="form-input" type="email" name="emailID" value={formData.emailID} onChange={handleChange} placeholder="you@example.com" />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Password *</label>
              <input className="form-input" type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Strong password" />
              <div className="form-hint">Min 8 chars, with upper, lower, number and symbol.</div>
            </div>
            <div className="form-group">
              <label className="form-label">Confirm password *</label>
              <input className="form-input" type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Repeat password" />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Age *</label>
              <input className="form-input" type="number" name="age" min="18" max="99" value={formData.age} onChange={handleChange} placeholder="24" />
            </div>
            <div className="form-group">
              <label className="form-label">Gender *</label>
              <select className="form-select" name="gender" value={formData.gender} onChange={handleChange}>
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Profile picture URL</label>
            <input className="form-input" type="url" name="photoUrl" value={formData.photoUrl} onChange={handleChange} placeholder="https://example.com/your-photo.jpg" />
          </div>

          <div className="form-group">
            <label className="form-label">Skills</label>
            <input className="form-input" name="skills" value={formData.skills} onChange={handleChange} placeholder="React, Node.js, MongoDB" />
            <div className="form-hint">Comma-separated.</div>
          </div>

          <div className="form-group">
            <label className="form-label">About you</label>
            <textarea className="form-textarea" name="about" maxLength="500" value={formData.about} onChange={handleChange} placeholder="What are you building? What stack do you love?" />
          </div>

          <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Sign up'}
          </button>
        </form>

        <div className="auth-switch">
          Already have an account? <Link to="/body/login">Log in</Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
