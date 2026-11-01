import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './redux/store';
import Body from './Components/Body';
import LoginPage from './Components/LoginPage';
import Signup from './Components/Signup';
import Feed from './Components/Feed';
import ReceivedRequests from './Components/ReceivedRequests';
import MyConnections from './Components/MyConnections';
import ProfilePage from './Components/ProfilePage';
import Chat from './Components/Chat';

const App = () => {
  return (
    <Provider store={store}>
      <BrowserRouter basename="/">
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/body" element={<Body />}>
            <Route path="login" element={<LoginPage />} />
            <Route path="feed" element={<Feed />} />
            <Route path="requests" element={<ReceivedRequests />} />
            <Route path="connections" element={<MyConnections />} />
            <Route path="chat/:targetUserId" element={<Chat />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>
          <Route
            path="*"
            element={
              <div className="auth-wrap">
                <div className="card auth-card">
                  <h2 className="auth-title">404</h2>
                  <p className="auth-sub">This page does not exist.</p>
                </div>
              </div>
            }
          />
        </Routes>
      </BrowserRouter>
    </Provider>
  );
};

export default App;
