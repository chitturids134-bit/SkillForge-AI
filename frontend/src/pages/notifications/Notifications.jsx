import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications } from '../../context/NotificationContext';
import '../../styles/auth.css';

const formatRelativeTime = (dateStr) => {
  if (!dateStr) return 'Just now';
  try {
    const now = new Date();
    const past = new Date(dateStr);
    const diffInSeconds = Math.floor((now - past) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) {
      const mins = Math.floor(diffInSeconds / 60);
      return `${mins} ${mins === 1 ? 'min' : 'mins'} ago`;
    }
    if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    }
    const days = Math.floor(diffInSeconds / 86400);
    if (days === 1) return 'Yesterday';
    if (days < 30) return `${days} days ago`;
    return past.toLocaleDateString();
  } catch (e) {
    return 'Recently';
  }
};

const getNotifIconConfig = (type) => {
  switch (type) {
    case 'WELCOME':
      return { icon: '🎉', bg: 'rgba(236, 72, 153, 0.15)', color: '#EC4899' };
    case 'PROFILE_UPDATE':
      return { icon: '👤', bg: 'rgba(108, 99, 255, 0.15)', color: '#6C63FF' };
    case 'RESUME_ANALYSIS':
    case 'ATS_SCORE':
      return { icon: '📄', bg: 'rgba(0, 212, 255, 0.15)', color: '#00D4FF' };
    case 'INTERVIEW':
      return { icon: '🎤', bg: 'rgba(34, 197, 94, 0.15)', color: '#22C55E' };
    case 'ROADMAP':
      return { icon: '🛣️', bg: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B' };
    case 'AI_MENTOR':
      return { icon: '🤖', bg: 'rgba(139, 92, 246, 0.15)', color: '#8B5CF6' };
    case 'SKILL_RECOMMENDATION':
      return { icon: '⚡', bg: 'rgba(234, 179, 8, 0.15)', color: '#EAB308' };
    case 'JOB_MATCH':
      return { icon: '💼', bg: 'rgba(59, 130, 246, 0.15)', color: '#3B82F6' };
    default:
      return { icon: '🔔', bg: 'rgba(108, 99, 255, 0.15)', color: '#6C63FF' };
  }
};

function Notifications() {
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'unread'

  const filteredNotifs = notifications.filter(n => {
    if (activeFilter === 'unread') return !n.isRead;
    return true;
  });

  return (
    <div style={{ width: '100%', padding: '2rem 1.5rem 4rem 1.5rem' }}>
      
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            Notifications
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem', fontSize: '0.95rem' }}>
            Stay updated with your SkillForge AI activity, ATS scores, and career milestones.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={markAllAsRead}
            style={{
              padding: '0.6rem 1.25rem',
              borderRadius: '12px',
              backgroundColor: 'rgba(108, 99, 255, 0.12)',
              border: '1px solid rgba(108, 99, 255, 0.3)',
              color: 'var(--accent-primary)',
              fontWeight: 700,
              fontSize: '0.875rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            ✓ Mark all as read
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
        <button
          type="button"
          onClick={() => setActiveFilter('all')}
          style={{
            padding: '0.5rem 1.25rem',
            borderRadius: '10px',
            border: 'none',
            backgroundColor: activeFilter === 'all' ? 'var(--accent-primary)' : 'transparent',
            color: activeFilter === 'all' ? '#FFFFFF' : 'var(--text-secondary)',
            fontWeight: 700,
            fontSize: '0.875rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          All ({notifications.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter('unread')}
          style={{
            padding: '0.5rem 1.25rem',
            borderRadius: '10px',
            border: 'none',
            backgroundColor: activeFilter === 'unread' ? 'var(--accent-primary)' : 'transparent',
            color: activeFilter === 'unread' ? '#FFFFFF' : 'var(--text-secondary)',
            fontWeight: 700,
            fontSize: '0.875rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* Loading State */}
      {loading && notifications.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[1, 2, 3].map(i => (
            <div
              key={i}
              style={{
                height: '80px',
                borderRadius: '16px',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                opacity: 0.6,
              }}
            />
          ))}
        </div>
      ) : error && notifications.length === 0 ? (
        /* Error State */
        <div className="glass-panel" style={{ padding: '3rem 2rem', textAlign: 'center', borderRadius: '18px' }}>
          <span style={{ fontSize: '2.5rem' }}>⚠️</span>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.75rem' }}>
            Unable to load notifications.
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
            Please check your server connection or try again.
          </p>
          <button
            type="button"
            onClick={() => fetchNotifications()}
            style={{
              padding: '0.6rem 1.5rem',
              borderRadius: '10px',
              backgroundColor: 'var(--accent-primary)',
              color: '#FFFFFF',
              border: 'none',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            🔄 Retry
          </button>
        </div>
      ) : filteredNotifs.length === 0 ? (
        /* Empty State */
        <div className="glass-panel" style={{ padding: '4rem 2rem', textAlign: 'center', borderRadius: '18px' }}>
          <span style={{ fontSize: '3rem' }}>🔔</span>
          <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '1rem' }}>
            You're all caught up!
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.4rem 0 0 0' }}>
            {activeFilter === 'unread' ? "You don't have any unread notifications right now." : "You don't have any notifications right now."}
          </p>
        </div>
      ) : (
        /* Notification List */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <AnimatePresence>
            {filteredNotifs.map((n) => {
              const notifId = n._id || n.id;
              const iconCfg = getNotifIconConfig(n.type);
              const isUnread = !n.isRead;

              return (
                <motion.div
                  key={notifId}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  style={{
                    padding: '1.25rem 1.5rem',
                    borderRadius: '16px',
                    backgroundColor: isUnread ? 'var(--bg-secondary)' : 'var(--bg-tertiary)',
                    border: isUnread ? '1.5px solid var(--accent-primary)' : '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1.25rem',
                    cursor: n.link ? 'pointer' : 'default',
                    boxShadow: isUnread ? '0 4px 18px rgba(108, 99, 255, 0.12)' : 'none',
                    transition: 'all 0.2s ease',
                  }}
                  onClick={() => {
                    if (isUnread) markAsRead(notifId);
                    if (n.link) navigate(n.link);
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.15rem', flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        width: '44px',
                        height: '44px',
                        minWidth: '44px',
                        borderRadius: '12px',
                        backgroundColor: iconCfg.bg,
                        color: iconCfg.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.35rem',
                      }}
                    >
                      {iconCfg.icon}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <h4 style={{ fontSize: '1.025rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                          {n.title}
                        </h4>
                        {isUnread && (
                          <span style={{ fontSize: '0.65rem', fontWeight: 800, padding: '0.15rem 0.5rem', borderRadius: '10px', backgroundColor: 'rgba(236, 72, 153, 0.15)', color: '#EC4899', textTransform: 'uppercase' }}>
                            Unread
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.45 }}>
                        {n.message || n.desc}
                      </p>
                      <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                        {formatRelativeTime(n.createdAt || n.time)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => deleteNotification(notifId)}
                      title="Delete notification"
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-muted)',
                        fontSize: '1.1rem',
                        cursor: 'pointer',
                        padding: '0.4rem',
                        borderRadius: '8px',
                        transition: 'color 0.2s ease',
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

    </div>
  );
}

export default Notifications;
