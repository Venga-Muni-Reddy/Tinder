import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { VITE_BASE_URL } from '../config';

const getInitials = (firstName, lastName) =>
  `${firstName ? firstName.charAt(0) : ''}${lastName ? lastName.charAt(0) : ''}`.toUpperCase();

const ReceivedRequests = () => {
  const loggedInUser = useSelector((state) => state.user);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  const fetchReceivedRequests = useCallback(async () => {
    if (!loggedInUser) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${VITE_BASE_URL}/user/request/received`, { withCredentials: true });
      setRequests(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load requests.');
    } finally {
      setLoading(false);
    }
  }, [loggedInUser]);

  useEffect(() => {
    fetchReceivedRequests();
  }, [fetchReceivedRequests]);

  const handleReview = async (requestId, status) => {
    if (processingId) return;
    setProcessingId(requestId);
    setError(null);
    try {
      await axios.post(`${VITE_BASE_URL}/request/review/${status}/${requestId}`, {}, { withCredentials: true });
      setRequests((prev) => prev.filter((r) => r._id !== requestId));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to review request.');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) return <div className="spinner" />;

  return (
    <div>
      <h2 className="page-title">Connection requests</h2>
      <p className="page-subtitle">Accept a request to unlock chat with that developer.</p>

      {error && <div className="alert alert-error">{error}</div>}

      {requests.length === 0 && !error ? (
        <div className="empty-state">
          <div className="empty-icon">&lt;/&gt;</div>
          <p>No pending requests right now. Keep your profile sharp and they will come.</p>
        </div>
      ) : (
        <div className="people-grid">
          {requests.map((request) => {
            const u = request.fromUserId || {};
            return (
              <div className="card person-card" key={request._id}>
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
                    <button
                      className="btn btn-accept btn-sm"
                      onClick={() => handleReview(request._id, 'accepted')}
                      disabled={processingId === request._id}
                    >
                      Accept
                    </button>
                    <button
                      className="btn btn-reject btn-sm"
                      onClick={() => handleReview(request._id, 'reject')}
                      disabled={processingId === request._id}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ReceivedRequests;
