// src/pages/ReceivedRequests.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { Container, Row, Col, Card, Button, Spinner, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';

const ReceivedRequests = () => {
    const loggedInUser = useSelector((state) => state.user);

    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [processingRequestId, setProcessingRequestId] = useState(null); // To disable buttons per request

    const fetchReceivedRequests = useCallback(async () => {
        if (!loggedInUser) {
            setLoading(false);
            setError("Please log in to view received requests.");
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const res = await axios.get(`${import.meta.env.VITE_BASE_URL}/user/request/received`, { withCredentials: true });
            setRequests(res.data);
        } catch (err) {
            console.error("Error fetching received requests:", err.response?.data?.message || err.message);
            setError(err.response?.data?.message || "Failed to load received requests.");
        } finally {
            setLoading(false);
        }
    }, [loggedInUser]);

    useEffect(() => {
        fetchReceivedRequests();
    }, [fetchReceivedRequests]);

    const handleReviewRequest = async (requestId, status) => {
        if (!loggedInUser || processingRequestId) {
            return;
        }
        setProcessingRequestId(requestId);
        setError(null);

        try {
            const res = await axios.post(`${import.meta.env.VITE_BASE_URL}/request/review/${status}/${requestId}`, {}, { withCredentials: true });
            console.log(`Request ${requestId} ${status}d:`, res.data);
            setRequests((prevRequests) => prevRequests.filter((req) => req._id !== requestId));
        } catch (err) {
            console.error("Error reviewing request:", err.response?.data?.message || err.message);
            setError(err.response?.data?.message || "Failed to review request.");
        } finally {
            setProcessingRequestId(null);
        }
    };

    const getInitials = (firstName, lastName) => {
        return `${firstName ? firstName.charAt(0) : ''}${lastName ? lastName.charAt(0) : ''}`.toUpperCase();
    };

    // --- Core changes for fixing the footer issue below ---

    // Define a min-height calculation, accounting for header/footer if they have fixed heights
    // A safer approach might be to set min-height to a specific value or just use flexbox properties.
    // Let's use `min-height: 75vh` as a simple starting point.
    // Or even better: use Bootstrap's d-flex, flex-column on the container if needed
    // However, if the `main` tag is already `flex-grow-1`, then often the `Container` just needs to be part of that flow.

    // If you add `d-flex flex-column flex-grow-1` to the `Container`, it means
    // the Container itself will stretch to fill the space provided by the parent `main`.
    // Then, if the internal content is short, it won't collapse.
    
    // Let's modify the return structure.

    if (!loggedInUser) {
        return (
            <Container className="my-5 text-center d-flex flex-column flex-grow-1 justify-content-center align-items-center">
                 <Alert variant="info">Please log in to view your received connection requests.</Alert>
            </Container>
        );
    }

    if (loading) {
        return (
            <Container className="d-flex justify-content-center align-items-center flex-grow-1" style={{ minHeight: 'calc(100vh - 120px)' }}>
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading Requests...</span>
                </Spinner>
            </Container>
        );
    }

    return (
        // Adding `d-flex flex-column flex-grow-1` to the main Container.
        // This makes the Container itself a flex container that grows to fill available space,
        // and its children (header, alert, row of cards) are stacked.
        // If there are no requests, the alert will be centered, and the Container will still fill the space.
        <Container className="my-5 d-flex flex-column flex-grow-1">
            <h2 className="text-center mb-4">Received Dev Requests</h2>

            {error && <Alert variant="danger">{error}</Alert>}

            {requests.length === 0 && !loading && !error && (
                // Adding `flex-grow-1` and `justify-content-center` to the alert container
                // so it stretches and centers itself vertically within the main Container.
                <div className="flex-grow-1 d-flex justify-content-center align-items-center">
                    <Alert variant="info" className="text-center w-75">
                        No pending connection requests at the moment.
                    </Alert>
                </div>
            )}

            {/* This Row only appears if there are requests */}
            {requests.length > 0 && (
                <Row xs={1} md={2} lg={3} className="g-4 justify-content-center">
                    {requests.map((request) => (
                        <Col key={request._id}>
                            <Card className="h-100 shadow-sm border-0">
                                {request.fromUserId?.photoUrl ? (
                                    <Card.Img
                                        variant="top"
                                        src={request.fromUserId.photoUrl}
                                        alt={`${request.fromUserId.firstName} ${request.fromUserId.lastName}`}
                                        style={{ height: '200px', objectFit: 'cover' }}
                                    />
                                ) : (
                                    <div
                                        className="bg-secondary text-white d-flex justify-content-center align-items-center"
                                        style={{ height: '200px', fontSize: '3rem' }}
                                    >
                                        {getInitials(request.fromUserId?.firstName, request.fromUserId?.lastName)}
                                    </div>
                                )}
                                <Card.Body className="d-flex flex-column">
                                    <Card.Title className="mb-1">
                                        {request.fromUserId?.firstName} {request.fromUserId?.lastName}, {request.fromUserId?.age}
                                    </Card.Title>
                                    <Card.Subtitle className="mb-2 text-muted">
                                        {request.fromUserId?.gender}
                                    </Card.Subtitle>
                                    {request.fromUserId?.skills && request.fromUserId.skills.length > 0 && (
                                        <Card.Text>
                                            <strong>Skills:</strong> {request.fromUserId.skills.join(', ')}
                                        </Card.Text>
                                    )}
                                    {request.fromUserId?.about && (
                                        <Card.Text className="text-truncate" style={{ maxHeight: '3em' }}>
                                            {request.fromUserId.about}
                                        </Card.Text>
                                    )}
                                    <div className="mt-auto d-flex justify-content-around pt-3">
                                        <Button
                                            variant="success"
                                            onClick={() => handleReviewRequest(request._id, 'accepted')}
                                            disabled={processingRequestId === request._id}
                                            className="me-2"
                                        >
                                            {processingRequestId === request._id ? <Spinner as="span" animation="border" size="sm" /> : <FontAwesomeIcon icon={faCheck} />} Accept
                                        </Button>
                                        <Button
                                            variant="danger"
                                            onClick={() => handleReviewRequest(request._id, 'reject')} // Corrected from 'rejected'
                                            disabled={processingRequestId === request._id}
                                        >
                                            {processingRequestId === request._id ? <Spinner as="span" animation="border" size="sm" /> : <FontAwesomeIcon icon={faTimes} />} Reject
                                        </Button>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}
        </Container>
    );
};

export default ReceivedRequests;