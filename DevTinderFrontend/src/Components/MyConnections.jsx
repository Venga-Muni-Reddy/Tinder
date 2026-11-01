import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { VITE_BASE_URL } from '../config';

const getInitials = (firstName, lastName) =>
  `${firstName ? firstName.charAt(0) : ''}${lastName ? lastName.charAt(0) : ''}`.toUpperCase();

const MyConnections = () => {
  const loggedInUser = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchConnections = useCallback(async () => {
    if (!loggedInUser) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${VITE_BASE_URL}/user/connections`, { withCredentials: true });
      setConnections(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load connections.');
    } finally {
      setLoading(false);
    }
  }, [loggedInUser]);

  useEffect(() => {
    fetchConnections();
  }, [fetchConnections]);

  if (loading) return <div className="spinner" />;

  return (
    <div>
      <h2 className="page-title">My connections</h2>
      <p className="page-subtitle">Developers you matched with. Open a chat and start building something together.</p>

      {error && <div className="alert alert-error">{error}</div>}

      {connections.length === 0 && !error ? (
        <div className="empty-state">
          <div className="empty-icon">&lt;/&gt;</div>
          <p>No connections yet. Like a profile in the feed and get liked back to connect.</p>
        </div>
      ) : (
        <div className="people-grid">
          {connections.map((u) => (
            <div className="card person-card" key={u._id}>
              <div className="person-photo">
                {u.photoUrl ? (
                  <img src={u.photoUrl} alt={`${u.firstName} ${u.lastName}`} />
                ) : (
                  <div className="photo-fallback">{getInitials(u.firstName, u.lastName)}</div>
                )}
              </div>
              <div className="person-body">
                <h3 className="person-name">{u.firstName} {u.lastName}{u.age ? `, ${u.age}` : ''}</h3>
                {u.skills && u.skills.length > 0 && (
                  <div>{u.skills.slice(0, 5).map((s) => <span className="chip" key={s}>{s}</span>)}</div>
                )}
                {u.about && <p className="person-about">{u.about}</p>}
                <div className="person-actions">
                  <button className="btn btn-chat btn-sm" onClick={() => navigate(`/body/chat/${u._id}`)}>
                    Chat
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyConnections;
