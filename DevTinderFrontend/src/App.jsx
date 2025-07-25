import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'; // Import Navigate
import LoginPage from './Components/LoginPage';
import Profile from './Components/Profile';
import Body from './Components/Body';
import { Provider, useSelector } from 'react-redux'; // Import useSelector
import store from './redux/store';
import Feed from './Components/Feed';
import ReceivedRequests from './Components/ReceivedRequests';
import MyConnections from './Components/MyConnections';
import ProfilePage from './Components/ProfilePage'; // Your new ProfilePage component
import Signup from './Components/Signup';

// A simple wrapper to protect routes
const PrivateRoute = ({ children }) => {
  const user = useSelector(store => store.user);
  // While user is null, the Body component is attempting to fetch it.
  // If user remains null after the fetch attempt (e.g., login failed or not logged in),
  // then navigate to login.
  // This might briefly show children if the API call is slow, then redirect.
  // For a more robust solution, you might need a separate authentication status
  // in Redux (e.g., 'loading', 'authenticated', 'unauthenticated').
  
  // For now, if user is explicitly null, redirect to login.
  // The fetchUser in Body ensures that if a user *should* be logged in,
  // the data will eventually populate.
  
  // A better check would be: if (user === null && !isLoadingUserFromApi)
  // For simplicity, we'll let Body handle the redirect if fetch fails/no user.
  // This PrivateRoute just checks the Redux state after Body has tried to populate it.
  
  if (user === null) {
    // If the user state is null (meaning not logged in or failed fetch),
    // redirect to the login page. The Body component's fetchUser will handle
    // populating this if credentials are valid from the server.
    return <Navigate to="/body/login" replace />;
  }
  return children;
};


const App = () => {
  return (
    <Provider store={store}>
      <BrowserRouter basename="/">
        <Routes>
          {/* Main entry point, typically the login page or a landing page */}
          <Route path="/" element={<LoginPage />} />
          
          {/* Protected routes under /body */}
          <Route path="/body" element={<Body />}>
            {/* The login route directly under /body, if user navigates away */}
            <Route path="login" element={<LoginPage />} />
            <Route path="profileEdit" element={<ProfilePage />} />
            {/* These routes should be protected */}
            <Route path="profile" element={<Profile />} />
            <Route path="feed" element={<Feed />} />
            <Route path="requests" element={<ReceivedRequests />} /> {/* New route */}
            <Route path="connections" element={<MyConnections />} />
          </Route>

          {/* You might want a separate signup route, not nested under /body */}
          <Route path="/signup" element={<Signup />} /> 
          {/* Add a placeholder for signup or link to your actual signup component */}

          {/* Catch-all for undefined routes */}
          <Route path="*" element={<div>404 - Page Not Found</div>} />
        </Routes>
      </BrowserRouter>
    </Provider>
  );
};

export default App;