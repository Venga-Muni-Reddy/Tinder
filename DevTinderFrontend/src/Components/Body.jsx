import Navbar from './DevTinderNavbar';
import { VITE_BASE_URL } from '../constants/config';
import { Outlet, useNavigate } from 'react-router-dom';
import Footer from './Footer';
import { useDispatch } from 'react-redux'; // Keep useDispatch
import { useEffect } from 'react'; // Keep useEffect
import axios from 'axios';
import { addUser,removeUser } from '../redux/userSlice'; // Ensure this path is correct
// import './Body.css'; // Uncomment if you have this CSS file

const Body = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const fetchUser = async () => {
    try {
      const res = await axios.get(`${VITE_BASE_URL}/profile/view`, { withCredentials: true });
      console.log(res.data)
      dispatch(addUser(res.data));
    } catch (err) {
      console.error("Error fetching user profile:", err);
      // If there's an error (e.g., not logged in), navigate to login
      dispatch(removeUser()); // Explicitly set user to null in Redux on error
      navigate('/body/login'); 
    }
  };

  useEffect(() => {
    // This effect will run once when the Body component mounts
    // This means it will run every time the page refreshes.
    fetchUser();
  }, []); // Empty dependency array means this runs only once on component mount

  return (
    // 'body-wrapper' will be our flex container
    <div className="body-wrapper">
      <Navbar />
      {/* 'main-content' will take up available space, pushing footer down */}
      <div className="main-content">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
};

export default Body;

//While refreshing data will not be erased 
//logout feature
//EditProfile feature
//feed feature [use feedSlice]