import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { io } from 'socket.io-client';
import { useAuth } from '../../context/AuthContext';
import {
  getConversations,
  getMessages,
  sendMessage,
  editMessage,
  deleteMessage,
  markConversationRead,
  createConversation,
  searchUsers,
} from '../../services/messageService';
import GradientButton from '../../components/common/GradientButton';

function getInitials(name) {
  if (!name || typeof name !== 'string') return 'U';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'U';
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function formatChatTime(dateStr) {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

function formatRelativeDate(dateStr) {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffSec = Math.floor((now - date) / 1000);
    if (diffSec < 60) return 'Just now';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
}

function Messages() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const socketRef = useRef(null);

  // Core State
  const [conversations, setConversations] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [sending, setSending] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [typingUser, setTypingUser] = useState('');

  // Edit & Delete State
  const [editingMsgId, setEditingMsgId] = useState(null);
  const [editText, setEditText] = useState('');
  const [deleteMsgId, setDeleteMsgId] = useState(null);

  // Search & New Modal State
  const [convSearch, setConvSearch] = useState('');
  const [showNewModal, setShowNewModal] = useState(false);
  const [userQuery, setUserQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  // Mobile View Toggle
  const [showMobileChat, setShowMobileChat] = useState(false);

  const [toast, setToast] = useState(null);
  const messagesEndRef = useRef(null);

  const showToast = (msg, isError = false) => {
    setToast({ text: msg, isError });
    setTimeout(() => setToast(null), 3500);
  };

  const scrollToBottom = (smooth = true) => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
    }, 100);
  };

  const fetchConversationsList = useCallback(async (targetConvId = null) => {
    try {
      setLoadingConvs(true);
      const res = await getConversations();
      if (res?.success) {
        const list = res.conversations || [];
        setConversations(list);

        if (targetConvId) {
          const found = list.find((c) => c.id === targetConvId);
          if (found) {
            setSelectedConv(found);
            setShowMobileChat(true);
          }
        } else if (!selectedConv && list.length > 0) {
          setSelectedConv(list[0]);
        }
      }
    } catch (err) {
      console.error('Fetch conversations error:', err);
      showToast('Unable to load conversations', true);
    } finally {
      setLoadingConvs(false);
    }
  }, [selectedConv]);

  const fetchMessagesList = useCallback(async (convId, pageNum = 1) => {
    try {
      setLoadingMsgs(true);
      const res = await getMessages(convId, pageNum, 30);
      if (res?.success) {
        if (pageNum === 1) {
          setMessages(res.messages || []);
          scrollToBottom(false);
        } else {
          setMessages((prev) => [...(res.messages || []), ...prev]);
        }
        setPage(res.page || 1);
        setHasMore(res.hasMore || false);

        await markConversationRead(convId);
        setConversations((prev) =>
          prev.map((c) => (c.id === convId ? { ...c, unreadCount: 0 } : c))
        );
      }
    } catch (err) {
      console.error('Fetch messages error:', err);
      showToast('Unable to load messages', true);
    } finally {
      setLoadingMsgs(false);
    }
  }, []);

  // Socket.IO Integration
  useEffect(() => {
    if (!user?._id && !user?.id) return;
    const currentUserId = user._id || user.id;

    socketRef.current = io(window.location.origin || 'http://localhost:5000', {
      transports: ['websocket', 'polling'],
    });

    socketRef.current.emit('join', currentUserId);

    socketRef.current.on('message:new', (newMsg) => {
      setSelectedConv((active) => {
        if (active && active.id === newMsg.conversationId) {
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
          scrollToBottom(true);
          markConversationRead(active.id).catch(() => {});
        }
        return active;
      });

      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === newMsg.conversationId) {
            return {
              ...c,
              lastMessageText: newMsg.text,
              lastMessageAt: newMsg.createdAt,
              unreadCount: c.id === selectedConv?.id ? 0 : (c.unreadCount || 0) + 1,
            };
          }
          return c;
        })
      );
    });

    socketRef.current.on('message:updated', (updatedMsg) => {
      setMessages((prev) =>
        prev.map((m) => (m.id === updatedMsg.id ? { ...m, text: updatedMsg.text, edited: true, editedAt: updatedMsg.editedAt } : m))
      );
    });

    socketRef.current.on('message:deleted', ({ messageId }) => {
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, text: 'This message was deleted', deleted: true } : m))
      );
    });

    socketRef.current.on('typing:start', ({ conversationId, userName }) => {
      if (selectedConv && selectedConv.id === conversationId) {
        setTypingUser(userName || 'Participant');
      }
    });

    socketRef.current.on('typing:stop', ({ conversationId }) => {
      if (selectedConv && selectedConv.id === conversationId) {
        setTypingUser('');
      }
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [user, selectedConv]);

  // Handle Navigation Deep Link
  useEffect(() => {
    if (!user) return;

    const handleInitialLoad = async () => {
      const targetParticipantId = location.state?.participantId;
      const targetJobId = location.state?.jobId;

      if (targetParticipantId) {
        try {
          const res = await createConversation(targetParticipantId, targetJobId);
          if (res?.success && res.data) {
            await fetchConversationsList(res.data._id);
            return;
          }
        } catch (err) {
          console.error('Deep link conversation error:', err);
        }
      }

      fetchConversationsList();
    };

    handleInitialLoad();
  }, [user, location.state, fetchConversationsList]);

  useEffect(() => {
    if (selectedConv?.id) {
      fetchMessagesList(selectedConv.id, 1);
    }
  }, [selectedConv?.id, fetchMessagesList]);

  // User Search
  const handleUserSearch = useCallback(async () => {
    try {
      setSearching(true);
      const res = await searchUsers(userQuery, roleFilter);
      if (res?.success) {
        setSearchResults(res.users || []);
      }
    } catch (err) {
      console.error('Search users error:', err);
    } finally {
      setSearching(false);
    }
  }, [userQuery, roleFilter]);

  useEffect(() => {
    if (showNewModal) {
      handleUserSearch();
    }
  }, [showNewModal, handleUserSearch]);

  const handleSelectUserToMessage = async (participantId) => {
    try {
      const res = await createConversation(participantId);
      if (res?.success && res.data) {
        setShowNewModal(false);
        await fetchConversationsList(res.data._id);
        setShowMobileChat(true);
        showToast('Conversation started!');
      }
    } catch (err) {
      console.error('Create conversation error:', err);
      showToast(err.response?.data?.message || 'Failed to start conversation', true);
    }
  };

  // Send Message
  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!selectedConv || !messageText.trim() || sending) return;

    const textToSend = messageText.trim();
    setMessageText('');
    setSending(true);

    socketRef.current?.emit('typing:stop', {
      conversationId: selectedConv.id,
      receiverId: selectedConv.participant?._id,
    });

    try {
      const res = await sendMessage(selectedConv.id, textToSend);
      if (res?.success && res.data) {
        setMessages((prev) => [...prev, res.data]);
        scrollToBottom(true);

        setConversations((prev) =>
          prev.map((c) =>
            c.id === selectedConv.id
              ? { ...c, lastMessageText: textToSend, lastMessageAt: new Date().toISOString() }
              : c
          )
        );
      }
    } catch (err) {
      console.error('Send message error:', err);
      setMessageText(textToSend);
      showToast(err.response?.data?.message || 'Failed to send message', true);
    } finally {
      setSending(false);
    }
  };

  // Edit Message Handlers
  const handleStartEdit = (msg) => {
    if (msg.deleted) return;
    setEditingMsgId(msg.id);
    setEditText(msg.text);
  };

  const handleSaveEdit = async (msgId) => {
    if (!editText.trim()) return;
    try {
      const res = await editMessage(msgId, editText.trim());
      if (res?.success && res.data) {
        setMessages((prev) =>
          prev.map((m) => (m.id === msgId ? { ...m, text: res.data.text, edited: true } : m))
        );
        setEditingMsgId(null);
        showToast('Message edited');
      }
    } catch (err) {
      console.error('Save edit error:', err);
      showToast(err.response?.data?.message || 'Failed to edit message', true);
    }
  };

  // Soft Delete Message Handler
  const handleConfirmDelete = async () => {
    if (!deleteMsgId) return;
    try {
      const res = await deleteMessage(deleteMsgId);
      if (res?.success) {
        setMessages((prev) =>
          prev.map((m) => (m.id === deleteMsgId ? { ...m, text: 'This message was deleted', deleted: true } : m))
        );
        setDeleteMsgId(null);
        showToast('Message deleted');
      }
    } catch (err) {
      console.error('Delete message error:', err);
      showToast(err.response?.data?.message || 'Failed to delete message', true);
    }
  };

  const handleInputChange = (e) => {
    setMessageText(e.target.value);

    if (selectedConv && socketRef.current) {
      socketRef.current.emit('typing:start', {
        conversationId: selectedConv.id,
        receiverId: selectedConv.participant?._id,
        userName: user?.name,
      });

      clearTimeout(window.typingTimer);
      window.typingTimer = setTimeout(() => {
        socketRef.current?.emit('typing:stop', {
          conversationId: selectedConv.id,
          receiverId: selectedConv.participant?._id,
        });
      }, 2000);
    }
  };

  const filteredConversations = conversations.filter((c) => {
    if (!convSearch.trim()) return true;
    const q = convSearch.toLowerCase();
    return (
      (c.participant?.name || '').toLowerCase().includes(q) ||
      (c.participant?.companyName || '').toLowerCase().includes(q) ||
      (c.lastMessageText || '').toLowerCase().includes(q)
    );
  });

  const currentUserId = (user?._id || user?.id || '').toString();

  return (
    <div style={{ padding: '2rem', width: '100%', height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              position: 'fixed',
              top: '20px',
              right: '20px',
              zIndex: 9999,
              background: toast.isError ? '#EF4444' : '#10B981',
              color: '#FFFFFF',
              padding: '0.85rem 1.5rem',
              borderRadius: '10px',
              fontWeight: 600,
              boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            }}
          >
            {toast.isError ? '⚠️ ' : '💬 '}
            {toast.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main 2-Column Chat Layout */}
      <div
        className="glass-panel"
        style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: '320px 1fr',
          borderRadius: '18px',
          overflow: 'hidden',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
        }}
      >
        {/* LEFT COLUMN: CONVERSATION SIDEBAR */}
        <div
          style={{
            borderRight: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            background: 'var(--bg-secondary)',
          }}
        >
          {/* Header */}
          <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Messages
            </h3>
            <button
              type="button"
              onClick={() => setShowNewModal(true)}
              style={{
                padding: '0.45rem 0.85rem',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #8B5CF6, #6C63FF)',
                color: '#FFFFFF',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
              }}
            >
              + New
            </button>
          </div>

          {/* Conversation Search Bar */}
          <div style={{ padding: '0.85rem 1rem', borderBottom: '1px solid var(--border-color)' }}>
            <input
              type="text"
              value={convSearch}
              onChange={(e) => setConvSearch(e.target.value)}
              placeholder="🔍 Search people..."
              style={{
                width: '100%',
                padding: '0.55rem 0.85rem',
                borderRadius: '8px',
                background: 'var(--input-bg)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                fontSize: '0.85rem',
              }}
            />
          </div>

          {/* Conversation List */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem' }}>
            {loadingConvs ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                Loading conversations...
              </div>
            ) : filteredConversations.length === 0 ? (
              <div style={{ padding: '2.5rem 1rem', textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💬</div>
                <p style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.92rem', marginBottom: '0.25rem' }}>
                  Your inbox is empty
                </p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '1rem' }}>
                  Connect with recruiters or developers to start a conversation.
                </p>
                <button
                  type="button"
                  onClick={() => setShowNewModal(true)}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    background: 'var(--hover-bg)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    fontWeight: 600,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                  }}
                >
                  Find People
                </button>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isSelected = selectedConv?.id === conv.id;
                const initials = getInitials(conv.participant?.name);

                return (
                  <div
                    key={conv.id}
                    onClick={() => {
                      setSelectedConv(conv);
                      setShowMobileChat(true);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.85rem',
                      padding: '0.85rem 1rem',
                      borderRadius: '12px',
                      background: isSelected ? 'rgba(139, 92, 246, 0.15)' : 'transparent',
                      border: isSelected ? '1px solid rgba(139, 92, 246, 0.3)' : '1px solid transparent',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      marginBottom: '0.25rem',
                    }}
                  >
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #8B5CF6, #00D4FF)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#FFFFFF',
                        fontWeight: 800,
                        fontSize: '1rem',
                        flexShrink: 0,
                      }}
                    >
                      {initials}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {conv.participant?.name || 'User'}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', flexShrink: 0 }}>
                          {formatRelativeDate(conv.lastMessageAt)}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                        <span
                          style={{
                            fontSize: '0.8rem',
                            color: conv.unreadCount > 0 ? 'var(--text-primary)' : 'var(--text-secondary)',
                            fontWeight: conv.unreadCount > 0 ? 700 : 400,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {conv.lastMessageText || 'No messages yet'}
                        </span>
                        {conv.unreadCount > 0 && (
                          <span
                            style={{
                              background: '#8B5CF6',
                              color: '#FFFFFF',
                              borderRadius: '10px',
                              padding: '0.1rem 0.45rem',
                              fontSize: '0.7rem',
                              fontWeight: 800,
                              flexShrink: 0,
                            }}
                          >
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: CHAT WINDOW */}
        {selectedConv ? (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-card)' }}>
            {/* Active Header */}
            <div style={{ padding: '1.1rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <button
                  type="button"
                  onClick={() => setShowMobileChat(false)}
                  style={{ display: 'none', background: 'none', border: 'none', color: 'var(--text-primary)', fontSize: '1.2rem', cursor: 'pointer' }}
                >
                  ←
                </button>

                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #8B5CF6, #00D4FF)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFFFFF',
                    fontWeight: 800,
                    fontSize: '1.05rem',
                  }}
                >
                  {getInitials(selectedConv.participant?.name)}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                      {selectedConv.participant?.name}
                    </h4>
                    <span className={`badge ${selectedConv.participant?.role === 'Recruiter' ? 'badge-primary' : 'badge-secondary'}`}>
                      {selectedConv.participant?.role}
                    </span>
                  </div>
                  {selectedConv.participant?.companyName && (
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      🏢 {selectedConv.participant.companyName}
                    </span>
                  )}
                </div>
              </div>

              {typingUser && (
                <span style={{ fontSize: '0.82rem', color: '#8B5CF6', fontWeight: 600, fontStyle: 'italic' }}>
                  ✏️ {typingUser} is typing...
                </span>
              )}
            </div>

            {/* Optional Job Context Banner */}
            {selectedConv.job && (
              <div
                style={{
                  padding: '0.65rem 1.5rem',
                  background: 'rgba(139, 92, 246, 0.08)',
                  borderBottom: '1px solid rgba(139, 92, 246, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.85rem',
                }}
              >
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Opportunity: </span>
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{selectedConv.job.title}</span>
                  {selectedConv.job.company && <span style={{ color: 'var(--text-secondary)' }}> • {selectedConv.job.company}</span>}
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/recruiter/jobs')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#8B5CF6',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                  }}
                >
                  View Job →
                </button>
              </div>
            )}

            {/* Messages Scroll Area */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {hasMore && (
                <div style={{ textContent: 'center', marginBottom: '0.5rem', textAlign: 'center' }}>
                  <button
                    type="button"
                    onClick={() => fetchMessagesList(selectedConv.id, page + 1)}
                    style={{
                      background: 'var(--hover-bg)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)',
                      padding: '0.35rem 0.85rem',
                      borderRadius: '12px',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Load older messages
                  </button>
                </div>
              )}

              {loadingMsgs && page === 1 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>
                  Loading chat history...
                </div>
              ) : messages.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', margin: 'auto' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>💬</div>
                  <p style={{ fontWeight: 700, color: 'var(--text-primary)' }}>No messages yet</p>
                  <p style={{ fontSize: '0.85rem' }}>Start the conversation with {selectedConv.participant?.name}.</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const senderIdStr = (msg.senderId?._id || msg.senderId || '').toString();
                  const isMine = senderIdStr === currentUserId;
                  const isEditingThis = editingMsgId === msg.id;

                  return (
                    <div
                      key={msg.id}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: isMine ? 'flex-end' : 'flex-start',
                      }}
                    >
                      {isEditingThis ? (
                        <div style={{ width: '100%', maxWidth: '70%', background: 'var(--bg-secondary)', padding: '0.85rem', borderRadius: '12px', border: '1px solid #8B5CF6' }}>
                          <input
                            type="text"
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            style={{
                              width: '100%',
                              padding: '0.5rem',
                              borderRadius: '6px',
                              background: 'var(--input-bg)',
                              border: '1px solid var(--border-color)',
                              color: 'var(--text-primary)',
                              marginBottom: '0.5rem',
                            }}
                          />
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                            <button
                              type="button"
                              onClick={() => setEditingMsgId(null)}
                              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.8rem' }}
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSaveEdit(msg.id)}
                              style={{ background: '#8B5CF6', color: '#FFFFFF', border: 'none', padding: '0.35rem 0.75rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700 }}
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div
                          style={{
                            maxWidth: '70%',
                            padding: '0.85rem 1.15rem',
                            borderRadius: isMine ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                            background: isMine
                              ? 'linear-gradient(135deg, #8B5CF6, #6C63FF)'
                              : 'var(--bg-secondary)',
                            color: isMine ? '#FFFFFF' : 'var(--text-primary)',
                            border: isMine ? 'none' : '1px solid var(--border-color)',
                            boxShadow: isMine ? '0 4px 15px rgba(139, 92, 246, 0.25)' : 'none',
                            fontSize: '0.92rem',
                            lineHeight: 1.5,
                            wordBreak: 'break-word',
                            position: 'relative',
                            fontStyle: msg.deleted ? 'italic' : 'normal',
                            opacity: msg.deleted ? 0.7 : 1,
                          }}
                        >
                          {msg.text}
                        </div>
                      )}

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {msg.edited && <span>Edited •</span>}
                        <span>{formatChatTime(msg.createdAt)}</span>
                        {isMine && !msg.deleted && (
                          <span style={{ color: msg.read ? '#10B981' : 'var(--text-muted)' }}>
                            {msg.read ? '✓✓' : '✓'}
                          </span>
                        )}

                        {/* Edit & Delete actions for current user */}
                        {isMine && !msg.deleted && !isEditingThis && (
                          <div style={{ display: 'flex', gap: '0.4rem', marginLeft: '0.4rem' }}>
                            <button
                              type="button"
                              onClick={() => handleStartEdit(msg)}
                              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.72rem' }}
                            >
                              ✏️ Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteMsgId(msg.id)}
                              style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', fontSize: '0.72rem' }}
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Bottom Composer */}
            <form
              onSubmit={handleSendMessage}
              style={{
                padding: '1rem 1.5rem',
                borderTop: '1px solid var(--border-color)',
                display: 'flex',
                gap: '0.75rem',
                alignItems: 'center',
                background: 'var(--bg-secondary)',
              }}
            >
              <input
                type="text"
                value={messageText}
                onChange={handleInputChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder={`Message ${selectedConv.participant?.name || ''}...`}
                maxLength={5000}
                style={{
                  flex: 1,
                  padding: '0.8rem 1.1rem',
                  borderRadius: '24px',
                  background: 'var(--input-bg)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                }}
              />
              {messageText.length > 4000 && (
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {messageText.length}/5000
                </span>
              )}
              <button
                type="submit"
                className="messages-send-btn"
                disabled={!messageText.trim() || sending}
              >
                {sending ? 'Sending...' : 'Send 🚀'}
              </button>
            </form>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>💬</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
              Select a Conversation
            </h3>
            <p style={{ fontSize: '0.9rem', maxWidth: '360px', textAlign: 'center' }}>
              Choose an existing chat from the left sidebar or click "+ New" to discover candidates and recruiters.
            </p>
          </div>
        )}
      </div>

      {/* NEW CONVERSATION MODAL */}
      <AnimatePresence>
        {showNewModal && (
          <div
            style={{
              position: 'fixed',
              top: 0, left: 0, right: 0, bottom: 0,
              zIndex: 99999,
              background: 'rgba(0,0,0,0.65)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem',
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-panel"
              style={{
                padding: '2rem',
                borderRadius: '18px',
                background: 'var(--bg-card)',
                maxWidth: '520px',
                width: '100%',
                maxHeight: '85vh',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  Start a New Conversation
                </h3>
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-primary)', fontSize: '1.2rem', cursor: 'pointer' }}
                >
                  ✕
                </button>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <input
                  type="text"
                  value={userQuery}
                  onChange={(e) => setUserQuery(e.target.value)}
                  placeholder="Search name or email..."
                  style={{
                    flex: 1,
                    padding: '0.7rem 0.9rem',
                    borderRadius: '8px',
                    background: 'var(--input-bg)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem',
                  }}
                />
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  style={{
                    padding: '0.7rem 0.9rem',
                    borderRadius: '8px',
                    background: 'var(--input-bg)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem',
                  }}
                >
                  <option value="">Auto Role</option>
                  <option value="Developer">Developers</option>
                  <option value="Recruiter">Recruiters</option>
                </select>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {searching ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    Searching users...
                  </div>
                ) : searchResults.length === 0 ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No users found matching "{userQuery}"
                  </div>
                ) : (
                  searchResults.map((u) => (
                    <div
                      key={u._id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.85rem 1rem',
                        borderRadius: '12px',
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-color)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div
                          style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #8B5CF6, #00D4FF)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#FFFFFF',
                            fontWeight: 800,
                            fontSize: '0.9rem',
                          }}
                        >
                          {getInitials(u.name)}
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-primary)' }}>{u.name}</span>
                            <span className={`badge ${u.role === 'Recruiter' ? 'badge-primary' : 'badge-secondary'}`}>{u.role}</span>
                          </div>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            {u.companyName ? `🏢 ${u.companyName}` : u.email}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleSelectUserToMessage(u._id)}
                        style={{
                          padding: '0.45rem 0.9rem',
                          borderRadius: '8px',
                          background: 'linear-gradient(135deg, #8B5CF6, #6C63FF)',
                          color: '#FFFFFF',
                          border: 'none',
                          fontWeight: 700,
                          fontSize: '0.82rem',
                          cursor: 'pointer',
                        }}
                      >
                        Message
                      </button>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SOFT DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {deleteMsgId && (
          <div
            style={{
              position: 'fixed',
              top: 0, left: 0, right: 0, bottom: 0,
              zIndex: 99999,
              background: 'rgba(0,0,0,0.65)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem',
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-panel"
              style={{
                padding: '2rem',
                borderRadius: '18px',
                background: 'var(--bg-card)',
                maxWidth: '420px',
                width: '100%',
              }}
            >
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#EF4444', marginTop: 0, marginBottom: '0.85rem' }}>
                Delete Message?
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1.5rem' }}>
                Are you sure you want to delete this message? It will be replaced with "This message was deleted".
              </p>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setDeleteMsgId(null)}
                  style={{
                    padding: '0.6rem 1.1rem',
                    borderRadius: '8px',
                    background: 'var(--hover-bg)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  style={{
                    padding: '0.6rem 1.1rem',
                    borderRadius: '8px',
                    background: '#EF4444',
                    color: '#FFFFFF',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                  }}
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Messages;
