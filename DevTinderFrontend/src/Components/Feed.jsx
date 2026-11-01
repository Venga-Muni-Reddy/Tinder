import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { VITE_BASE_URL } from '../config';

const PAGE_SIZE = 10;

const getInitials = (firstName, lastName) =>
  `${firstName ? firstName.charAt(0) : ''}${lastName ? lastName.charAt(0) : ''}`.toUpperCase();

const Feed = () => {
  const loggedInUser = useSelector((state) => state.user);

  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [feedLoading, setFeedLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  const currentUser = users[0];

  const fetchFeedUsers = useCallback(async (pageToFetch) => {
    setFeedLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${VITE_BASE_URL}/users/feed?page=${pageToFetch}&limit=${PAGE_SIZE}`, { withCredentials: true });
      const newUsers = res.data;
      if (newUsers && newUsers.length > 0) {
        setUsers((prev) => {
          const ids = new Set(prev.map((u) => u._id));
          return [...prev, ...newUsers.filter((u) => !ids.has(u._id))];
        });
        setHasMore(newUsers.length === PAGE_SIZE);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load your feed.');
      setHasMore(false);
    } finally {
      setFeedLoading(false);
    }
  }, []);

  useEffect(() => {
    if (loggedInUser) fetchFeedUsers(1);
  }, [loggedInUser, fetchFeedUsers]);

  const sendConnectionRequest = async (toUserId, status) => {
    if (!loggedInUser || !currentUser || actionLoading) return;
    setActionLoading(true);
    setError(null);
    try {
      await axios.post(`${VITE_BASE_URL}/request/send/${status}/${toUserId}`, {}, { withCredentials: true });
      setUsers((prev) => prev.slice(1));
      if (users.length <= 5 && hasMore) {
        setCurrentPage((p) => p + 1);
        fetchFeedUsers(currentPage + 1);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send request.');
    } finally {
      setActionLoading(false);
    }
  };

  if (!loggedInUser) {
    return <div className="empty-state"><div className="empty-icon">&lt;/&gt;</div><p>Please log in to discover developers.</p></div>;
  }

  if (feedLoading && users.length === 0) {
    return <div className="spinner" />;
  }

  return (
    <div className="feed-stage">
      <h2 className="page-title">Discover developers</h2>
      <p className="page-subtitle">Like a profile to send a connection request.</p>

      {error && <div className="alert alert-error" style={{ maxWidth: 380, width: '100%' }}>{error}</div>}

      {currentUser ? (
        <div className="card feed-card" key={currentUser._id}>
          <div className="feed-photo">
            {currentUser.photoUrl ? (
              <img src={currentUser.photoUrl} alt={`${currentUser.firstName} ${currentUser.lastName}`} />
            ) : (
              <div className="photo-fallback">{getInitials(currentUser.firstName, currentUser.lastName)}</div>
            )}
            <div className="feed-name">{currentUser.firstName} {currentUser.lastName}{currentUser.age ? `, ${currentUser.age}` : ''}</div>
          </div>
          <div className="feed-body">
            {currentUser.skills && currentUser.skills.length > 0 && (
              <div>{currentUser.skills.slice(0, 6).map((s) => <span className="chip" key={s}>{s}</span>)}</div>
            )}
            {currentUser.about && <p className="feed-about">{currentUser.about}</p>}
            <div className="feed-actions">
              <button
                className="action-btn action-pass"
                onClick={() => sendConnectionRequest(currentUser._id, 'ignored')}
                disabled={actionLoading}
                aria-label="Pass"
                title="Pass"
              >
                &#10005;
              </button>
              <button
                className="action-btn action-like"
                onClick={() => sendConnectionRequest(currentUser._id, 'interested')}
                disabled={actionLoading}
                aria-label="Interested"
                title="Interested"
              >
                &#10084;
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">&lt;/&gt;</div>
          <p>{feedLoading ? 'Loading more developers...' : 'No more developers in your feed right now. Check back later!'}</p>
        </div>
      )}
    </div>
  );
};

export default Feed;
