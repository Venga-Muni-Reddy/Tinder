import React, { useState } from 'react';
import { Container, Form, Button, Card, Alert, Spinner, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import { VITE_BASE_URL } from '../constants/config';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserPlus, faInfoCircle, faCodeBranch, faEnvelope, faLock, faIdCard, faBirthdayCake, faVenusMars, faCameraRetro, faBook } from '@fortawesome/free-solid-svg-icons';

// Optional: Custom CSS for a more polished look
// import './Signup.css'; 

const Signup = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    emailID: '',
    password: '',
    confirmPassword: '',
    age: '',
    gender: '',
    photoUrl: '',
    about: '',
    skills: '', // Will be parsed as a comma-separated string
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [validated, setValidated] = useState(false); // For Bootstrap's form validation

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    const form = event.currentTarget;
    event.preventDefault(); // Prevent default browser form submission
    event.stopPropagation(); // Stop event propagation

    // Manual validation check for required fields and password match
    if (form.checkValidity() === false || formData.password !== formData.confirmPassword) {
      setValidated(true); // Enable Bootstrap's validation feedback
      setError("Please ensure all required fields are filled correctly and passwords match.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Prepare data for backend
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        emailID: formData.emailID,
        password: formData.password,
        age: parseInt(formData.age), // Ensure age is a number
        gender: formData.gender,
        photoUrl: formData.photoUrl || null, // Send null if empty
        about: formData.about || null,     // Send null if empty
        // Split skills string by comma and trim whitespace, filter out empty strings
        skills: formData.skills ? formData.skills.split(',').map(s => s.trim()).filter(s => s.length > 0) : [],
      };

      const response = await axios.post(`${VITE_BASE_URL}/signup`, payload);

      setSuccess(response.data.message || 'Signup successful! Redirecting to login...');
      // Clear form data after successful signup
      setFormData({
        firstName: '', lastName: '', emailID: '', password: '', confirmPassword: '',
        age: '', gender: '', photoUrl: '', about: '', skills: ''
      });
      setValidated(false); // Reset validation state

      // Redirect to login page after a short delay
      setTimeout(() => {
        navigate('/body/login');
      }, 2000);

    } catch (err) {
      console.error('Signup error:', err);
      setError(err.response?.data?.message || 'An unexpected error occurred during signup.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="my-5 d-flex justify-content-center">
      <Card className="shadow-lg p-4" style={{ maxWidth: '600px', width: '100%' }}>
        <Card.Body>
          <h2 className="text-center mb-4">
            <FontAwesomeIcon icon={faUserPlus} className="me-2" />
            Join DevTinder
          </h2>
          <p className="text-muted text-center mb-4">
            Connect with fellow developers who share your passion!
          </p>

          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}

          <Form noValidate validated={validated} onSubmit={handleSubmit}>
            <Row className="mb-3">
              <Form.Group as={Col} controlId="formFirstName">
                <Form.Label><FontAwesomeIcon icon={faIdCard} className="me-1" /> First Name</Form.Label>
                <Form.Control
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Enter first name"
                  required
                />
                <Form.Control.Feedback type="invalid">
                  Please provide your first name.
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group as={Col} controlId="formLastName">
                <Form.Label><FontAwesomeIcon icon={faIdCard} className="me-1" /> Last Name</Form.Label>
                <Form.Control
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Enter last name"
                  required
                />
                <Form.Control.Feedback type="invalid">
                  Please provide your last name.
                </Form.Control.Feedback>
              </Form.Group>
            </Row>

            <Form.Group className="mb-3" controlId="formEmail">
              <Form.Label><FontAwesomeIcon icon={faEnvelope} className="me-1" /> Email address</Form.Label>
              <Form.Control
                type="email"
                name="emailID"
                value={formData.emailID}
                onChange={handleChange}
                placeholder="Enter email"
                required
              />
              <Form.Control.Feedback type="invalid">
                Please provide a valid email.
              </Form.Control.Feedback>
            </Form.Group>

            <Row className="mb-3">
              <Form.Group as={Col} controlId="formPassword">
                <Form.Label><FontAwesomeIcon icon={faLock} className="me-1" /> Password</Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Password"
                  required
                  minLength="6" // Example: Minimum password length
                />
                <Form.Control.Feedback type="invalid">
                  Password must be at least 6 characters.
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group as={Col} controlId="formConfirmPassword">
                <Form.Label><FontAwesomeIcon icon={faLock} className="me-1" /> Confirm Password</Form.Label>
                <Form.Control
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm Password"
                  required
                  isInvalid={validated && formData.password !== formData.confirmPassword} // Live feedback
                />
                <Form.Control.Feedback type="invalid">
                  Passwords do not match.
                </Form.Control.Feedback>
              </Form.Group>
            </Row>

            <Row className="mb-3">
              <Form.Group as={Col} controlId="formAge">
                <Form.Label><FontAwesomeIcon icon={faBirthdayCake} className="me-1" /> Age</Form.Label>
                <Form.Control
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  placeholder="Your age"
                  required
                  min="18" // DevTinder is for adults!
                  max="99"
                />
                <Form.Control.Feedback type="invalid">
                  Please enter a valid age (18-99).
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group as={Col} controlId="formGender">
                <Form.Label><FontAwesomeIcon icon={faVenusMars} className="me-1" /> Gender</Form.Label>
                <Form.Select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="male">male</option>
                  <option value="female">female</option>
                  <option value="other">Other</option>
                 
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  Please select your gender.
                </Form.Control.Feedback>
              </Form.Group>
            </Row>

            <Form.Group className="mb-3" controlId="formPhotoUrl">
              <Form.Label><FontAwesomeIcon icon={faCameraRetro} className="me-1" /> Profile Picture URL (Optional)</Form.Label>
              <Form.Control
                type="url"
                name="photoUrl"
                value={formData.photoUrl}
                onChange={handleChange}
                placeholder="e.g., https://example.com/your-pic.jpg"
              />
              <Form.Text className="text-muted">
                You can provide a link to your profile picture.
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3" controlId="formAbout">
              <Form.Label><FontAwesomeIcon icon={faBook} className="me-1" /> About You (Optional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="about"
                value={formData.about}
                onChange={handleChange}
                placeholder="Tell us about yourself, your dev journey, passions..."
                maxLength="500" // Limit bio length
              />
              <Form.Text className="text-muted">
                A brief bio (max 500 characters).
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-4" controlId="formSkills">
              <Form.Label><FontAwesomeIcon icon={faCodeBranch} className="me-1" /> Skills (Comma-separated)</Form.Label>
              <Form.Control
                type="text"
                name="skills"
                value={formData.skills}
                onChange={handleChange}
                placeholder="e.g., React, Node.js, Python, AWS"
              />
              <Form.Text className="text-muted">
                List your core tech skills, separated by commas.
              </Form.Text>
            </Form.Group>

            <Button
              variant="primary"
              type="submit"
              className="w-100 py-2"
              disabled={loading}
            >
              {loading ? (
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                />
              ) : (
                'Sign Up'
              )}
            </Button>
          </Form>

          <div className="text-center mt-3">
            Already have an account? <a href="/body/login">Log In</a>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Signup;