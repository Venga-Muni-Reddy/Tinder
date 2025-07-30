import axios from 'axios';
import { useState } from 'react';
import { VITE_BASE_URL } from '../config';
import { Container, Row, Col, Form, Button, InputGroup } from 'react-bootstrap';
import { EyeFill, EyeSlashFill } from 'react-bootstrap-icons'; // Make sure you've installed 'react-bootstrap-icons'
import './LoginPage.css'; // Importing the dedicated CSS file
import { useDispatch } from 'react-redux';
import { addUser } from '../redux/userSlice';
import { Link, useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({}); // To manage validation errors
  const navigate = useNavigate()

  const validateForm = () => {
    let newErrors = {};
    if (!email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Email address is invalid';
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const dispatch = useDispatch()

  const handleSubmit = async (e) => { // Added 'e' parameter for event object
    e.preventDefault(); // Prevent default form submission to handle it with React

    if (validateForm()) {
      try {
        const user = await axios.post(`${VITE_BASE_URL}/login`, { emailID: email, password: password },{withCredentials:true});
        console.log("Login successful:", user.data);
        dispatch(addUser(user.data))
        // Here you would typically redirect the user or update application state
        alert('Login attempt successful! Check console for response.');
        navigate('/body/feed')
      } catch (error) {
        console.error("Login failed:", error.response ? error.response.data : error.message);
        // Handle login error (e.g., display error message to user)
        setErrors(prev => ({ ...prev, api: 'Invalid credentials or server error.' }));
      }
    }
  };
  return (
    <div className="login-page-wrapper d-flex align-items-center justify-content-center"> {/* Changed vh-60 to vh-100 for full height */}
      <Container>
        <Row className="justify-content-center">
          <Col md={6} lg={4}>
            <div className="login-card p-4 shadow-lg rounded">
              <h2 className="text-center mb-4">Welcome Back!</h2>
              <Form onSubmit={handleSubmit}>
                {/* Email Field with Floating Label */}
                <Form.Group className="form-floating mb-3" controlId="formBasicEmail">
                  <Form.Control
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    isInvalid={!!errors.email}
                  />
                  <Form.Label>Email address</Form.Label>
                  <Form.Control.Feedback type="invalid">
                    {errors.email}
                  </Form.Control.Feedback>
                </Form.Group>

                {/* Password Field with Toggle (Corrected for floating label with InputGroup) */}
                <Form.Group className="mb-3">
                  <div className="form-floating"> {/* This div enables the floating label behavior */}
                    <InputGroup>
                      <Form.Control
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        isInvalid={!!errors.password}
                        id="formBasicPassword"
                      />
                      <Form.Label htmlFor="formBasicPassword">Password</Form.Label> {/* Linked to controlId */}
                      <Button
                        variant="outline-secondary"
                        onClick={() => setShowPassword(!showPassword)}
                        className="btn-password-toggle" /* Custom class for styling the button within floating label */
                      >
                        {showPassword ? <EyeSlashFill /> : <EyeFill />}
                      </Button>
                      <Form.Control.Feedback type="invalid">
                        {errors.password}
                      </Form.Control.Feedback>
                    </InputGroup>
                  </div>
                </Form.Group>

                {/* Remember Me Toggle */}
                <Form.Group className="mb-3 d-flex justify-content-between align-items-center">
                  <Form.Check
                    type="switch"
                    id="rememberMeSwitch"
                    label="Remember me"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <a href="#" className="text-decoration-none">Forgot Password?</a>
                </Form.Group>

                {/* API Error Feedback (if any) */}
                {errors.api && <p className="text-danger text-center mt-2">{errors.api}</p>}

                <Button variant="primary" type="submit" className="w-100 mt-3">
                  Login
                </Button>

                <div className="text-center mt-3">
                  Don't have an account? <Link to="/signup" className="text-decoration-none">Sign Up</Link>
                </div>

                {/* Optional: Social Login Buttons */}
                <div className="text-center mt-4">
                  <p className="text-muted">Or login with</p>
                  {/* Example: Google, Facebook buttons */}
                  {/*
                  <Button variant="outline-danger" className="me-2">
                    <i className="bi bi-google"></i> Google
                  </Button>
                  <Button variant="outline-primary">
                    <i className="bi bi-facebook"></i> Facebook
                  </Button>
                  */}
                </div>
              </Form>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default LoginPage;