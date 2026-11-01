import { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { NavLink, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { VITE_BASE_URL } from '../config';
import { removeUser } from '../redux/userSlice';
import { disconnectSocket } from '../socket';

const getInitials = (firstName, lastName) =>
  `${firstName ? firstName.charAt(0) : ''}${lastName ? lastName.charAt(0) : ''}`.toUpperCase();

function DevTinderNavbar() {
  const user = useSelector((store) => store.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post(`${VITE_BASE_URL}/logout`, {}, { withCredentials: true });
    } catch (err) {
      console.error('Logout error:', err.message);
    }
    disconnectSocket();
    dispatch(removeUser());
    navigate('/body/login');
  };

  return (
    <nav className="navbar">
      <NavLink to={user ? '/body/feed' : '/'} className="brand">
        <span className="brand-mark">&lt;/&gt;</span>
        DevTinder
      </NavLink>

      <div className="nav-links">
        {user ? (
          <>
            <NavLink to="/body/feed" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>Feed</NavLink>
            <NavLink to="/body/requests" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>Requests</NavLink>
            <NavLink to="/body/connections" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>Connections</NavLink>
            <div className="dropdown" ref={menuRef}>
              <button
                className={'avatar-btn' + (open ? ' open' : '')}
                onClick={() => setOpen((v) => !v)}
                aria-label="Account menu"
              >
                {user.photoUrl ? (
                  <img src={user.photoUrl} alt="Profile" />
                ) : (
                  <span className="avatar-fallback">{getInitials(user.firstName, user.lastName)}</span>
                )}
              </button>
              {open && (
                <div className="dropdown-menu">
                  <div className="dropdown-user">{user.firstName} {user.lastName}</div>
                  <div className="dropdown-divider" />
                  <NavLink to="/body/profile" className="dropdown-item" onClick={() => setOpen(false)}>My Profile</NavLink>
                  <button className="dropdown-item danger" onClick={handleLogout}>Logout</button>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <NavLink to="/body/login" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>Login</NavLink>
            <NavLink to="/signup" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>Sign Up</NavLink>
          </>
        )}
      </div>
    </nav>
  );
}

export default DevTinderNavbar;
