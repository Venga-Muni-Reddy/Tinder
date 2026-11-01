import Navbar from './DevTinderNavbar';
import Footer from './Footer';
import { VITE_BASE_URL } from '../config';
import { Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import axios from 'axios';
import { addUser, removeUser } from '../redux/userSlice';
import { initSocket, disconnectSocket } from '../socket';

const Body = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((store) => store.user);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`${VITE_BASE_URL}/profile/view`, { withCredentials: true });
        dispatch(addUser(res.data));
      } catch (err) {
        dispatch(removeUser());
        disconnectSocket();
        navigate('/body/login');
      }
    };
    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Open the realtime channel once the user is known; close it on logout.
  useEffect(() => {
    if (user) {
      initSocket();
    } else {
      disconnectSocket();
    }
  }, [user]);

  return (
    <div className="shell">
      <Navbar />
      <main className="shell-main">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Body;
