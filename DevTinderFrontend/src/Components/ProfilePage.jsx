import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { VITE_BASE_URL } from '../config';
import { Form, Button, Container, Row, Col, Image, Spinner, Alert, Toast, ToastContainer } from 'react-bootstrap';
import axios from 'axios';
import { addUser } from '../redux/userSlice'; // To update user after edit

// Assume you have a CSS file for styling
// import './ProfilePage.css';

const ProfilePage = () => {
  const user = useSelector((store) => store.user);
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    photoUrl: '',
    gender: '',
    age: '',
    skills: '', // Stored as a comma-separated string in form state
    about: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null); // Keeping this for the Alert, if desired
  const [showToast, setShowToast] = useState(false); // State for toast visibility
  const [toastMessage, setToastMessage] = useState(''); // State for toast content

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null); // Clear previous Alert success
    setShowToast(false); // Hide any active toast
    setToastMessage(''); // Clear any old toast message

    try {
      const dataToSend = { ...formData };
      if (typeof dataToSend.skills === 'string') {
        dataToSend.skills = dataToSend.skills.split(',').map(s => s.trim()).filter(s => s.length > 0);
      }
      dataToSend.age = dataToSend.age ? Number(dataToSend.age) : undefined;

      const res = await axios.patch(`${VITE_BASE_URL}/profile/edit`, dataToSend, { withCredentials: true });
      
      const message = res.data.message || "Profile updated successfully!";
      setSuccess(message); // Optional: if you still want the Bootstrap Alert
      setToastMessage(message); // Set message for the toast
      setShowToast(true);       // Show the toast

      dispatch(addUser(res.data.data)); 
      
    } catch (err) {
      console.error("Error updating profile:", err.response ? err.response.data : err.message);
      setError(err.response?.data?.Danger || err.message || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: 'calc(100vh - 120px)' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading Profile...</span>
        </Spinner>
      </Container>
    );
  }

  const displayedPhotoUrl = formData.photoUrl || 'https://via.placeholder.com/150/0000FF/FFFFFF?text=No+Photo';
  const displayedGender = formData.gender;
  const displayedAge = formData.age;
  const displayedSkills = typeof formData.skills === 'string' 
    ? formData.skills.split(',').map(s => s.trim()).filter(s => s.length > 0)
    : [];
  const displayedAbout = formData.about;

  return (
    <Container className="my-5 profile-page">
      <h2 className="text-center mb-4">My Profile</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>} {/* This Alert will show alongside the Toast */}

      {/* --- Toast Container --- */}
      <ToastContainer
        position="top-end"
        className="p-3"
        style={{ zIndex: 1050 }} // Use a high z-index to ensure it's on top
      >
        <Toast 
          onClose={() => setShowToast(false)}
          show={showToast}
          delay={5000}
          autohide
          bg="success" // You can change this to 'primary', 'info', etc.
        >
          <Toast.Header>
            <strong className="me-auto">DevTinder Notification</strong>
          </Toast.Header>
          <Toast.Body className="text-white">
            {toastMessage}
          </Toast.Body>
        </Toast>
      </ToastContainer>
      {/* --- End Toast Container --- */}

      <Row>
        {/* Left Side: Edit Profile Form */}
        <Col md={7}>
          <div className="profile-edit-form p-4 border rounded shadow-sm">
            <h4>Edit Your Details</h4>
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3" controlId="formPhotoUrl">
                <Form.Label>Profile Photo URL</Form.Label>
                <Form.Control
                  type="text"
                  name="photoUrl"
                  value={formData.photoUrl}
                  onChange={handleChange}
                  placeholder="Enter URL for your profile picture"
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formGender">
                <Form.Label>Gender</Form.Label>
                <Form.Select name="gender" value={formData.gender} onChange={handleChange}>
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3" controlId="formAge">
                <Form.Label>Age</Form.Label>
                <Form.Control
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  placeholder="Enter your age"
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formSkills">
                <Form.Label>Skills (Comma-separated)</Form.Label>
                <Form.Control
                  type="text"
                  name="skills"
                  value={formData.skills}
                  onChange={handleChange}
                  placeholder="e.g., React, Node.js, JavaScript"
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formAbout">
                <Form.Label>About You</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="about"
                  value={formData.about}
                  onChange={handleChange}
                  placeholder="Tell us a little about yourself"
                />
              </Form.Group>

              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> : 'Save Changes'}
              </Button>
            </Form>
          </div>
        </Col>

        {/* Right Side: Profile Photo and Details (Now using formData for live updates) */}
        <Col md={5}>
          <div className="profile-details p-4 border rounded shadow-sm text-center">
            <h4 className="mb-3">Your Profile</h4>
            <div className="profile-photo-wrapper mb-3">
              <Image
                src={displayedPhotoUrl}
                alt="Profile"
                roundedCircle
                fluid
                style={{ width: '150px', height: '150px', objectFit: 'cover', border: '2px solid #007bff' }}
              />
            </div>
            <h5 className="mb-2">{user.firstName || user.email || 'DevTinder User'}</h5> 
            {displayedGender && <p><strong>Gender:</strong> {displayedGender}</p>}
            {displayedAge && <p><strong>Age:</strong> {displayedAge}</p>}
            {displayedSkills.length > 0 && (
              <p><strong>Skills:</strong> {displayedSkills.join(', ')}</p>
            )}
            {displayedAbout && <p><strong>About:</strong> {displayedAbout}</p>}
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default ProfilePage;