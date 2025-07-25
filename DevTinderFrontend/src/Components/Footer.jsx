import { Container, Row, Col } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub, faLinkedin, faTwitter } from '@fortawesome/free-brands-svg-icons';
import { faHeart } from '@fortawesome/free-solid-svg-icons';
import './Footer.css'; // For custom styles

function Footer() {
  return (
    <footer className="footer-section py-4 py-md-3">
      <Container>
        <Row className="align-items-center justify-content-between text-center text-md-start">
          {/* Brand/Logo Section */}
          <Col md={4} className="mb-3 mb-md-0">
            <h5 className="footer-brand mb-1">DevTinder</h5>
            <p className="footer-tagline">Connecting Developers, Building Dreams</p>
          </Col>

          {/* Navigation/Links Section */}
          <Col md={4} className="mb-3 mb-md-0">
            <ul className="footer-links list-unstyled d-flex justify-content-center justify-content-md-start mb-0">
              <li className="me-3"><a href="#" className="text-decoration-none">Home</a></li>
              <li className="me-3"><a href="#" className="text-decoration-none">About Us</a></li>
              <li className="me-3"><a href="#" className="text-decoration-none">Contact</a></li>
              <li><a href="#" className="text-decoration-none">Privacy</a></li>
            </ul>
          </Col>

          {/* Social Media and Copyright */}
          <Col md={4} className="text-center text-md-end">
            <div className="social-icons mb-2">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="mx-2">
                <FontAwesomeIcon icon={faGithub} size="lg" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="mx-2">
                <FontAwesomeIcon icon={faLinkedin} size="lg" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="mx-2">
                <FontAwesomeIcon icon={faTwitter} size="lg" />
              </a>
            </div>
            <p className="footer-copyright mb-0">
              Made with <FontAwesomeIcon icon={faHeart} className="heart-icon" /> by DevTinder Team &copy; {new Date().getFullYear()}
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
}

export default Footer;