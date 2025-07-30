// src/pages/MyConnections.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { VITE_BASE_URL } from '../config';
import axios from 'axios';
import { Container, Row, Col, Card, Spinner, Alert } from 'react-bootstrap';
// import './MyConnections.css'; // Optional custom CSS

const MyConnections = () => {
  const loggedInUser = useSelector((state) => state.user);

  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchConnections = useCallback(async () => {
    if (!loggedInUser) {
      setLoading(false);
      setError("Please log in to view your connections.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${VITE_BASE_URL}/user/connections`, { withCredentials: true });
      // The backend should send an array of user objects that are connected
      setConnections(res.data);
    } catch (err) {
      console.error("Error fetching connections:", err.response?.data?.message || err.message);
      setError(err.response?.data?.message || "Failed to load connections.");
    } finally {
      setLoading(false);
    }
  }, [loggedInUser]);

  useEffect(() => {
    fetchConnections();
  }, [fetchConnections]);

  const getInitials = (firstName, lastName) => {
    return `${firstName ? firstName.charAt(0) : ''}${lastName ? lastName.charAt(0) : ''}`.toUpperCase();
  };

  if (!loggedInUser) {
    return (
      <Container className="my-5 text-center">
        <Alert variant="info">Please log in to view your connections.</Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: 'calc(100vh - 120px)' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading Connections...</span>
        </Spinner>
      </Container>
    );
  }

  return (
    <Container className="my-5">
      <h2 className="text-center mb-4">My Dev Connections</h2>

      {error && <Alert variant="danger">{error}</Alert>}

      {connections.length === 0 && !loading && !error && (
        <Alert variant="info" className="text-center">
          You don't have any accepted connections yet. Get swiping!
        </Alert>
      )}

      <Row xs={1} md={2} lg={3} className="g-4 justify-content-center">
        {connections.map((connectedUser) => (
          <Col key={connectedUser._id}>
            <Card className="h-100 shadow-sm border-0">
              {connectedUser.photoUrl ? (
                <Card.Img 
                  variant="top" 
                  src={connectedUser.photoUrl} 
                  alt={`${connectedUser.firstName} ${connectedUser.lastName}`} 
                  style={{ height: '200px', objectFit: 'cover' }}
                />
              ) : (
                <div 
                  className="bg-secondary text-white d-flex justify-content-center align-items-center" 
                  style={{ height: '200px', fontSize: '3rem' }}
                >
                  {getInitials(connectedUser.firstName, connectedUser.lastName)}
                </div>
              )}
              <Card.Body className="d-flex flex-column">
                <Card.Title className="mb-1">
                  {connectedUser.firstName} {connectedUser.lastName}, {connectedUser.age}
                </Card.Title>
                <Card.Subtitle className="mb-2 text-muted">
                  {connectedUser.gender}
                </Card.Subtitle>
                {connectedUser.skills && connectedUser.skills.length > 0 && (
                  <Card.Text>
                    <strong>Skills:</strong> {connectedUser.skills.join(', ')}
                  </Card.Text>
                )}
                {connectedUser.about && (
                  <Card.Text className="text-truncate" style={{ maxHeight: '3em' }}>
                    {connectedUser.about}
                  </Card.Text>
                )}
                {/* You might add a "View Profile" or "Message" button here */}
                {/* <div className="mt-auto text-center pt-3">
                  <Button variant="outline-primary" size="sm">View Profile</Button>
                </div> */}
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default MyConnections;