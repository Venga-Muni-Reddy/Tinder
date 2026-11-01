import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { VITE_BASE_URL } from '../config';
import { addUser } from '../redux/userSlice';

const getInitials = (firstName, lastName) =>
  `${firstName ? firstName.charAt(0) : ''}${lastName ? lastName.charAt(0) : ''}`.toUpperCase();

const ProfilePage = () => {
  const user = useSelector((store) => store.user);
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({ photoUrl: '', gender: '', age: '', skills: '', about: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (user) {
      setFormData({
        photoUrl: user.photoUrl || '',
        gender: user.gender || '',
        age: user.age || '',
        skills: Array.isArray(user.skills) ? user.skills.join(', ') : '',
        about: user.about || '',
      });
    }
  }, [user]);

  if (!user) return <div className="spinner" />;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const payload = {
        gender: formData.gender,
        age: formData.age,
        about: formData.about,
        skills: formData.skills ? formData.skills.split(',').map((s) => s.trim()).filter(Boolean) : [],
      };
      if (formData.photoUrl) payload.photoUrl = formData.photoUrl;

      const res = await axios.patch(`${VITE_BASE_URL}/profile/edit`, payload, { withCredentials: true });
      if (res.data?.data) dispatch(addUser(res.data.data));
      setSuccess('Profile updated.');
    } catch (err) {
      setError(err.response?.data?.Danger || err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="page-title">My profile</h2>
      <p className="page-subtitle">This is how other developers see you on DevTinder.</p>

      <div className="profile-grid">
        <div className="card profile-card">
          <div className="profile-photo">
            {user.photoUrl ? (
              <img src={user.photoUrl} alt={`${user.firstName} ${user.lastName}`} />
            ) : (
              <div className="photo-fallback">{getInitials(user.firstName, user.lastName)}</div>
            )}
          </div>
          <div className="profile-card-body">
            <h3>{user.firstName} {user.lastName}{user.age ? `, ${user.age}` : ''}</h3>
            <p className="meta">{user.emailID}</p>
            {user.skills && user.skills.length > 0 && (
              <div style={{ marginBottom: 10 }}>{user.skills.map((s) => <span className="chip" key={s}>{s}</span>)}</div>
            )}
            {user.about && <p style={{ color: 'var(--muted)', margin: 0 }}>{user.about}</p>}
          </div>
        </div>

        <div className="card profile-edit-card">
          <h3 style={{ marginTop: 0 }}>Edit profile</h3>

          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Profile picture URL</label>
              <input className="form-input" type="url" name="photoUrl" value={formData.photoUrl} onChange={handleChange} placeholder="https://example.com/photo.jpg" />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Age</label>
                <input className="form-input" type="number" name="age" min="18" max="99" value={formData.age} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Gender</label>
                <select className="form-select" name="gender" value={formData.gender} onChange={handleChange}>
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Skills</label>
              <input className="form-input" name="skills" value={formData.skills} onChange={handleChange} placeholder="React, Node.js, MongoDB" />
              <div className="form-hint">Comma-separated.</div>
            </div>
            <div className="form-group">
              <label className="form-label">About</label>
              <textarea className="form-textarea" name="about" maxLength="500" value={formData.about} onChange={handleChange} />
            </div>
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
