import { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { VITE_BASE_URL } from '../config';
import { getSocket } from '../socket';

const getInitials = (firstName, lastName) =>
  `${firstName ? firstName.charAt(0) : ''}${lastName ? lastName.charAt(0) : ''}`.toUpperCase();

const formatTime = (iso) => {
  try {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
};

const Chat = () => {
  const { targetUserId } = useParams();
  const navigate = useNavigate();
  const loggedInUser = useSelector((state) => state.user);

  const [participant, setParticipant] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sendError, setSendError] = useState(null);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Load conversation history (server rejects users who are not connected).
  useEffect(() => {
    if (!loggedInUser) return;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(`${VITE_BASE_URL}/chat/${targetUserId}`, { withCredentials: true });
        setParticipant(res.data.participant);
        setMessages(res.data.messages || []);
      } catch (err) {
        if (err.response?.status === 403) {
          setError('You can only chat with accepted connections. Send a request and get accepted first.');
        } else {
          setError(err.response?.data?.message || 'Could not load this conversation.');
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [loggedInUser, targetUserId]);

  // Live messages for this conversation.
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    const onMessage = (msg) => {
      const involvesTarget =
        (msg.fromUserId === targetUserId && msg.toUserId === loggedInUser?._id) ||
        (msg.fromUserId === loggedInUser?._id && msg.toUserId === targetUserId);
      if (involvesTarget) {
        setMessages((prev) => (prev.some((m) => m._id === msg._id) ? prev : [...prev, msg]));
      }
    };
    socket.on('messageReceived', onMessage);
    return () => socket.off('messageReceived', onMessage);
  }, [targetUserId, loggedInUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSend = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const text = draft.trim();
    if (!text || sending) return;
    const socket = getSocket();
    if (!socket || !socket.connected) {
      setSendError('Realtime connection is not ready yet. Try again in a moment.');
      return;
    }
    setSending(true);
    setSendError(null);
    socket.emit('sendMessage', { targetUserId, text }, (res) => {
      setSending(false);
      if (res?.error) {
        setSendError(res.error);
      } else if (res?.message) {
        setMessages((prev) => (prev.some((m) => m._id === res.message._id) ? prev : [...prev, res.message]));
        setDraft('');
      }
    });
  };

  if (loading) return <div className="spinner" />;

  if (error) {
    return (
      <div className="chat-wrap">
        <div className="chat-header">
          <Link to="/body/connections" className="chat-back">&#8592;</Link>
          <h3 className="chat-header-name">Chat</h3>
        </div>
        <div className="chat-notice">
          <p>{error}</p>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/body/connections')}>Back to connections</button>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-wrap">
      <div className="chat-header">
        <Link to="/body/connections" className="chat-back" aria-label="Back to connections">&#8592;</Link>
        <div className="chat-avatar">
          {participant?.photoUrl ? (
            <img src={participant.photoUrl} alt={participant.firstName} />
          ) : (
            <div className="avatar-fallback" style={{ width: '100%', height: '100%' }}>{getInitials(participant?.firstName, participant?.lastName)}</div>
          )}
        </div>
        <div>
          <h3 className="chat-header-name">{participant?.firstName} {participant?.lastName}</h3>
          <p className="chat-header-sub">{participant?.skills && participant.skills.length > 0 ? participant.skills.slice(0, 4).join(' · ') : 'Connected developer'}</p>
        </div>
      </div>

      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="chat-notice">
            No messages yet. Say hi to {participant?.firstName}!
          </div>
        )}
        {messages.map((m) => {
          const mine = String(m.fromUserId) === String(loggedInUser?._id);
          return (
            <div className={'bubble-row' + (mine ? ' mine' : '')} key={m._id}>
              <div className="bubble">
                {m.text}
                <span className="bubble-time">{formatTime(m.createdAt)}</span>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {sendError && <div className="alert alert-error" style={{ margin: '0 14px' }}>{sendError}</div>}

      <form className="chat-input-bar" onSubmit={handleSend}>
        <input
          className="form-input chat-input"
          placeholder={`Message ${participant?.firstName || ''}...`}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          maxLength={1000}
        />
        <button className="btn btn-primary chat-send" type="button" onClick={handleSend} disabled={!draft.trim() || sending} aria-label="Send message">
          &#10148;
        </button>
      </form>
    </div>
  );
};

export default Chat;
