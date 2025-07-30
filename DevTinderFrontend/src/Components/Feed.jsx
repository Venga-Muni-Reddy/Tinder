import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { VITE_BASE_URL } from '../constants/config';
import { Container, Card, Button, Spinner, Alert } from 'react-bootstrap'; // Removed Row, Col as we're showing one card
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faTimes } from '@fortawesome/free-solid-svg-icons';

// Optional: Add some custom CSS for centered card and transitions
// import './Feed.css'; // Add this if you want specific styling for the single card

const Feed = () => {
  const loggedInUser = useSelector((state) => state.user);

  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [feedLoading, setFeedLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false); // Changed to boolean as only one action at a time
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  // Use a ref or state for the current user being displayed, or simply access users[0]
  const currentUser = users[0]; // This will be the user currently shown

  const fetchFeedUsers = useCallback(async (pageToFetch) => {
    if (feedLoading || !hasMore) return;

    setFeedLoading(true);
    setError(null);

    try {
      // Fetch more users, e.g., 5-10 at a time to keep a buffer
      const res = await axios.get(`${VITE_BASE_URL}/users/feed?page=${pageToFetch}&limit=10`, { withCredentials: true });
      const newUsers = res.data;
      
      if (newUsers && newUsers.length > 0) {
        setUsers((prevUsers) => {
          // Filter out duplicates in case of network issues or quick actions
          const userIds = new Set(prevUsers.map(u => u._id));
          const filteredNewUsers = newUsers.filter(u => !userIds.has(u._id));
          return [...prevUsers, ...filteredNewUsers];
        });
        // Check if the number of new users received is less than the limit, indicating no more data
        setHasMore(newUsers.length === 10); 
      } else {
        setHasMore(false); // No new users returned, so no more data
      }

    } catch (err) {
      console.error("Error fetching feed:", err.response?.data?.message || err.message);
      setError(err.response?.data?.message || "Failed to load user feed.");
      setHasMore(false); // Assume no more data on error
    } finally {
      setFeedLoading(false);
    }
  }, [feedLoading, hasMore]); 

  useEffect(() => {
    if (loggedInUser) {
      fetchFeedUsers(1);
    }
  }, [loggedInUser, fetchFeedUsers]);


  // Function to send a connection request (Interested/Ignored)
  const sendConnectionRequest = async (toUserId, status) => {
    if (!loggedInUser || !currentUser || actionLoading) { // Prevent action if not logged in, no current user, or already loading
      return;
    }

    setActionLoading(true); // Set action loading for ANY action now
    setError(null);

    try {
      const res = await axios.post(`${VITE_BASE_URL}/request/send/${status}/${toUserId}`, {}, { withCredentials: true });
      console.log(`Request ${status} sent:`, res.data);
      
      // Remove the current user from the front of the array
      setUsers((prevUsers) => prevUsers.slice(1)); 

      // If the buffer of users is getting low, fetch more
      // For example, if we have less than 5 users left, fetch next page
      if (users.length <= 5 && hasMore) { // Adjust this threshold (e.g., 2, 3, 5)
        setCurrentPage((prevPage) => prevPage + 1);
        fetchFeedUsers(currentPage + 1); 
      }

    } catch (err) {
      console.error("Error sending connection request:", err.response?.data?.message || err.message);
      setError(err.response?.data?.message || "Failed to send request.");
    } finally {
      setActionLoading(false); // Reset action loading
    }
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName ? firstName.charAt(0) : ''}${lastName ? lastName.charAt(0) : ''}`.toUpperCase();
  };

  if (!loggedInUser) {
    return (
      <Container className="my-5 text-center">
        <Alert variant="info">Please log in to view your DevTinder feed.</Alert>
      </Container>
    );
  }

  // Initial loading state (before any users are fetched)
  if (feedLoading && users.length === 0) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: 'calc(100vh - 120px)' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading Devs...</span>
        </Spinner>
      </Container>
    );
  }

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: 'calc(100vh - 120px)' }}>
      <div className="feed-card-wrapper" style={{ width: '100%', maxWidth: '400px' }}> {/* Max width for a single card */}
        <h2 className="text-center mb-4">Discover Devs</h2>

        {error && <Alert variant="danger">{error}</Alert>}

        {/* Display the current user card */}
        {currentUser ? (
          <Card className="shadow-lg border-0 feed-card">
            {currentUser.profileUrl ? (
              <Card.Img 
                variant="top" 
                src={currentUser.profileUrl} 
                alt={`${currentUser.firstName} ${currentUser.lastName}`} 
                style={{ height: '300px', objectFit: 'cover' }}
              />
            ) : (
              <div 
                className="bg-secondary text-white d-flex justify-content-center align-items-center" 
                style={{ height: '300px', fontSize: '5rem' }}
              >
                {getInitials(currentUser.firstName, currentUser.lastName)}
              </div>
            )}
            <Card.Body className="d-flex flex-column">
              <Card.Title className="mb-1 text-center">
                {currentUser.firstName} {currentUser.lastName}, {currentUser.age}
              </Card.Title>
              <Card.Subtitle className="mb-2 text-muted text-center">
                {currentUser.gender}
              </Card.Subtitle>
              {currentUser.skills && currentUser.skills.length > 0 && (
                <Card.Text className="text-center">
                  <strong>Skills:</strong> {currentUser.skills.join(', ')}
                </Card.Text>
              )}
              {currentUser.about && (
                <Card.Text className="text-center" style={{ maxHeight: '4em', overflowY: 'auto' }}>
                  {currentUser.about}
                </Card.Text>
              )}
              <div className="mt-auto d-flex justify-content-around pt-3">
                <Button 
                  variant="danger" // Changed to danger for "ignore"
                  onClick={() => sendConnectionRequest(currentUser._id, 'ignored')}
                  disabled={actionLoading} // Disable all actions if one is pending
                  className="me-2 rounded-circle d-flex align-items-center justify-content-center"
                  style={{ width: '60px', height: '60px', fontSize: '1.5rem' }}
                >
                  {actionLoading ? (
                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                  ) : (
                    <FontAwesomeIcon icon={faTimes} />
                  )}
                </Button>
                <Button 
                  variant="success" 
                  onClick={() => sendConnectionRequest(currentUser._id, 'interested')}
                  disabled={actionLoading} // Disable all actions if one is pending
                  className="rounded-circle d-flex align-items-center justify-content-center"
                  style={{ width: '60px', height: '60px', fontSize: '1.5rem' }}
                >
                  {actionLoading ? (
                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                  ) : (
                    <FontAwesomeIcon icon={faHeart} />
                  )}
                </Button>
              </div>
            </Card.Body>
          </Card>
        ) : (
          // If no current user, and not loading more, and we had more originally
          users.length === 0 && !feedLoading && hasMore && (
            <div className="text-center">
              <p>Loading next dev...</p>
              <Spinner animation="border" />
            </div>
          )
        )}

        {/* Display "No more devs" message only when appropriate */}
        {users.length === 0 && !feedLoading && !hasMore && !error && (
          <Alert variant="info" className="text-center mt-4">
            No more developers in your feed at the moment. Try again later!
          </Alert>
        )}
      </div>
    </Container>
  );
};

export default Feed;