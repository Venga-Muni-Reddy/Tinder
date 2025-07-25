import { useState, useEffect } from 'react';
import { Navbar, Container, Nav, NavDropdown, Image, Spinner } from "react-bootstrap";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLaptopCode, faUserCircle } from '@fortawesome/free-solid-svg-icons';
import { useSelector, useDispatch } from 'react-redux';
import { removeUser, addUser } from '../redux/userSlice'; // Ensure this path is correct
import { useNavigate, NavLink } from 'react-router-dom'; // Import NavLink for active styling
import axios from 'axios'; // Import axios for the logout API call
// import Profile from './Profile'; // Not needed to import here as it's for routing

// You might want a CSS file for custom styles
// import './Navbar.css';

function DevTinderNavbar() {
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const user = useSelector((store) => store.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // State to manage loading specific to the Navbar's display
  const [isLoadingNavbarProfile, setIsLoadingNavbarProfile] = useState(true);

  useEffect(() => {
    // This effect ensures the Navbar updates its loading state once user data is resolved
    if (user !== null) {
      setIsLoadingNavbarProfile(false);
    } else {
      // If user is null, it means either they are not logged in,
      // or Body is still fetching, or logout just occurred.
      // We set isLoadingNavbarProfile to false here to avoid an indefinite spinner
      // if no user is found after initial fetch or after logout.
      setIsLoadingNavbarProfile(false);
    }
  }, [user]);

  const toggleDropdown = () => {
    setShowProfileDropdown(!showProfileDropdown);
  };

  const handleLogout = async () => {
    try {
      // 1. Call your backend logout API
      const res = await axios.post(`${import.meta.env.VITE_BASE_URL}/logout`, {}, { withCredentials: true });
      console.log("Logout successful on backend:", res.data.message);

      // 2. Clear user details from the Redux store
      dispatch(removeUser()); 

      // 3. Redirect to the login page
      navigate('/body/login');

    } catch (err) {
      console.error("Error during logout:", err.response ? err.response.data : err.message);
      // Even if backend logout fails, clear frontend state for consistency
      dispatch(removeUser()); 
      navigate('/body/login'); // Still redirect, as user session might be broken
      alert("Logout failed, but your local session has been cleared. Please try logging in again."); // Inform user
    }
  };

  // Determine the profile image source or fallback
  const profileImageSrc = user?.photoUrl || 'https://via.placeholder.com/150/0000FF/FFFFFF?text=User';

  const renderLoggedInNavbar = (
    <Navbar bg="dark" variant="dark" expand="lg" className="devtinder-navbar">
      <Container fluid>
        <Navbar.Brand as={NavLink} to="/body/feed" className="d-flex align-items-center"> {/* Changed to NavLink */}
          <div className="logo-wrapper me-3">
            <FontAwesomeIcon icon={faLaptopCode} className="developer-icon" />
          </div>
          <span className="brand-text">DevTinder</span>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            {/* Direct links for Feed, Requests, and Connections */}
            <NavLink to="/body/feed" className="nav-link">Feed</NavLink>
            <NavLink to="/body/requests" className="nav-link">Requests</NavLink>
            <NavLink to="/body/connections" className="nav-link">Connections</NavLink>

            {/* Profile Dropdown */}
            <NavDropdown
              title={
                isLoadingNavbarProfile ? ( 
                  <Spinner animation="border" size="sm" variant="light" /> 
                ) : user?.photoUrl ? (
                  <Image
                    src={profileImageSrc}
                    alt="Profile Picture"
                    roundedCircle
                    className="profile-pic"
                    style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                  />
                ) : (
                  <FontAwesomeIcon icon={faUserCircle} size="2x" className="text-white" />
                )
              }
              id="profile-nav-dropdown"
              align="end"
              show={showProfileDropdown}
              onClick={toggleDropdown}
              onToggle={(isOpen) => setShowProfileDropdown(isOpen)}
            >
              {/* Profile link within dropdown */}
              <NavDropdown.Item as={NavLink} to="/body/profile">My Profile</NavDropdown.Item>
              {/* Settings removed as requested */}
              <NavDropdown.Divider />
              <NavDropdown.Item onClick={handleLogout}>Logout</NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );

  const renderPublicNavbar = (
    <Navbar bg="dark" variant="dark" expand="lg" className="devtinder-navbar">
      <Container fluid>
        <Navbar.Brand as={NavLink} to="/" className="d-flex align-items-center"> {/* Changed to NavLink, default to / */}
          <div className="logo-wrapper me-3">
            <FontAwesomeIcon icon={faLaptopCode} className="developer-icon" />
          </div>
          <span className="brand-text">DevTinder</span>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <NavLink to="/body/login" className="nav-link">Login</NavLink> {/* Changed to NavLink */}
            <NavLink to="/signup" className="nav-link">Sign Up</NavLink> {/* Changed to NavLink */}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );

  return user ? renderLoggedInNavbar : renderPublicNavbar;
}

export default DevTinderNavbar;