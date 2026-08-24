import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import StatusBadge from '../../components/common/StatusBadge';
import { getPromptTemplates, getChatSessions, sendMessage, clearSession } from '../../services/mentorService';

function MentorChat() {
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  const [activeTopic, setActiveTopic] = useState('');
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState('');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');

  // Initial Load - Fetch Templates & Chat Sessions from Backend API
  useEffect(() => {
    async function loadMentorData() {
      try {
        const [tplRes, sessRes] = await Promise.all([
          getPromptTemplates(),
          getChatSessions()
        ]);

        if (tplRes.templates) {
          setTemplates(tplRes.templates);
        }

        if (sessRes.sessions && sessRes.sessions.length > 0) {
          setSessions(sessRes.sessions);
          const activeSess = sessRes.sessions[0];
          setCurrentSessionId(activeSess.sessionId);
          setMessages(activeSess.messages || []);
        }
      } catch (err) {
        console.error('Error loading AI Mentor session data:', err);
        setErrorMsg('Failed to connect to AI Mentor service. Please refresh.');
      }
    }
    loadMentorData();
  }, []);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  const handleSendMessageText = async (textToSend) => {
    const query = (textToSend || input).trim();
    if (!query || isThinking) return;

    setErrorMsg('');
    const tempUserMsg = { sender: 'user', text: query, timestamp: new Date() };
    setMessages(prev => [...prev, tempUserMsg]);
    if (!textToSend) setInput('');
    setIsThinking(true);

    try {
      const res = await sendMessage(currentSessionId, query);
      if (res && res.session) {
        setCurrentSessionId(res.session.sessionId);
        setMessages(res.session.messages || []);
      }
    } catch (err) {
      console.error('Send Mentor Message error:', err);
      setErrorMsg('I am having trouble connecting to the AI mentor right now. Please try again.');
    } finally {
      setIsThinking(false);
    }
  };

  const handleClearChat = async () => {
    if (!currentSessionId || isThinking) return;
    try {
      setIsThinking(true);
      const res = await clearSession(currentSessionId);
      if (res && res.session) {
        setMessages(res.session.messages || []);
      }
    } catch (err) {
      console.error('Clear Chat error:', err);
    } finally {
      setIsThinking(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessageText();
    }
  };

  return (
    <div style={{ padding: '2rem', height: 'calc(100vh - 90px)', display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', boxSizing: 'border-box' }}>
      
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.2rem' }}>
            <span style={{ fontSize: '1.5rem' }}>🤖</span>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              SkillForge AI Mentor
            </h2>
          </div>
          <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.9rem' }}>
            Context-aware AI career & technical mentor personalized to your profile and active learning path.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <StatusBadge status="AI Online 24/7" />
          <button
            type="button"
            onClick={handleClearChat}
            disabled={isThinking}
            style={{
              padding: '0.45rem 0.85rem',
              borderRadius: '8px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-secondary)',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: isThinking ? 'not-allowed' : 'pointer'
            }}
          >
            🗑️ Clear Chat
          </button>
        </div>
      </div>

      {/* Templates / Topic Selector Pills */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {templates.map((tpl) => (
          <button
            key={tpl.id}
            type="button"
            onClick={() => handleSendMessageText(tpl.prompt)}
            disabled={isThinking}
            style={{
              padding: '0.45rem 0.85rem',
              borderRadius: '20px',
              backgroundColor: 'rgba(139, 92, 246, 0.1)',
              border: '1px solid rgba(139, 92, 246, 0.25)',
              color: '#A78BFA',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: isThinking ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              transition: 'all 0.2s ease'
            }}
          >
            <span>{tpl.icon}</span> {tpl.title}
          </button>
        ))}
      </div>

      {errorMsg && (
        <div style={{ padding: '0.75rem 1rem', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#F87171', fontSize: '0.88rem' }}>
          ⚠️ {errorMsg}
        </div>
      )}

      {/* Main Chat Window Container */}
      <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
        
        {/* Messages Stream Area */}
        <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {messages.map((m, idx) => {
            const isUser = m.sender === 'user';

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  alignSelf: isUser ? 'flex-end' : 'flex-start',
                  maxWidth: '82%',
                  padding: '1.1rem 1.35rem',
                  borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  backgroundColor: isUser ? 'linear-gradient(135deg, #8B5CF6, #6D28D9)' : 'var(--bg-secondary, rgba(0,0,0,0.3))',
                  background: isUser ? 'linear-gradient(135deg, #8B5CF6, #6D28D9)' : 'var(--bg-secondary, rgba(20, 20, 35, 0.6))',
                  color: isUser ? '#FFFFFF' : 'var(--text-primary)',
                  border: isUser ? 'none' : '1px solid var(--border-color)',
                  boxShadow: isUser ? '0 4px 15px rgba(139, 92, 246, 0.3)' : 'none'
                }}
              >
                <div style={{ fontSize: '0.75rem', color: isUser ? 'rgba(255, 255, 255, 0.9)' : '#A78BFA', marginBottom: '0.4rem', fontWeight: 700 }}>
                  {isUser ? 'You' : '🤖 SkillForge AI Mentor'}
                </div>

                <div style={{ fontSize: '0.925rem', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                  {m.text}
                </div>

                {/* Suggested Action Links */}
                {m.structuredContent?.suggestedActions && (
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                    {m.structuredContent.suggestedActions.map((act, aIdx) => (
                      <button
                        key={aIdx}
                        type="button"
                        onClick={() => navigate(act.action)}
                        style={{
                          padding: '0.35rem 0.75rem',
                          borderRadius: '6px',
                          background: 'rgba(255,255,255,0.08)',
                          border: '1px solid rgba(255,255,255,0.15)',
                          color: '#FFFFFF',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        ⚡ {act.label}
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>
            );
          })}

          {/* Thinking Indicator */}
          {isThinking && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                alignSelf: 'flex-start',
                padding: '0.85rem 1.25rem',
                borderRadius: '16px 16px 16px 4px',
                background: 'rgba(20, 20, 35, 0.6)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-secondary)',
                fontSize: '0.88rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem'
              }}
            >
              <span>🤖 AI Mentor is thinking...</span>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <textarea
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isThinking}
            placeholder="Ask AI Mentor about learning plans, roadmaps, technical concepts, interview prep..."
            style={{
              flex: 1,
              backgroundColor: 'var(--bg-tertiary, rgba(0,0,0,0.2))',
              border: '1px solid var(--border-color)',
              borderRadius: '10px',
              padding: '0.75rem 1rem',
              color: 'var(--text-primary)',
              outline: 'none',
              fontSize: '0.9rem',
              resize: 'none',
              fontFamily: 'inherit'
            }}
          />

          <button
            type="button"
            onClick={() => handleSendMessageText()}
            disabled={isThinking || !input.trim()}
            style={{
              height: '42px',
              padding: '0 1.5rem',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
              border: 'none',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: isThinking || !input.trim() ? 'not-allowed' : 'pointer',
              opacity: isThinking || !input.trim() ? 0.6 : 1,
              whiteSpace: 'nowrap',
              boxShadow: '0 4px 15px rgba(139, 92, 246, 0.35)'
            }}
          >
            {isThinking ? 'Thinking...' : 'Ask Mentor ➔'}
          </button>
        </div>
      </div>

    </div>
  );
}

export default MentorChat;
