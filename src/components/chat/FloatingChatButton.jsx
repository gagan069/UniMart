import React from 'react';
import { useChat } from '../../context/ChatContext.jsx';
import './Chat.css';

export default function FloatingChatButton() {
  const {
    isOpen,
    isMinimized,
    unreadTotal,
    toggleChat,
    toggleMinimize,
    activeConversation
  } = useChat();

  // If minimized, render a sleek docked bar at the bottom left
  if (isOpen && isMinimized) {
    const contactName = activeConversation
      ? activeConversation.participant.shortName || activeConversation.participant.name
      : 'Conversations';

    return (
      <div
        className="unimart-chat-minimized-bar"
        onClick={toggleMinimize}
        role="button"
        tabIndex={0}
        title="Click to expand chat"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') toggleMinimize();
        }}
      >
        <div className="d-flex align-items-center gap-2 min-w-0">
          <span className="material-symbols-outlined text-primary" style={{ fontSize: '20px', color: '#70182c' }}>
            chat
          </span>
          <span className="fw-semibold text-truncate" style={{ fontSize: '0.86rem' }}>
            {activeConversation ? `Chat: ${contactName}` : 'Messages'}
          </span>
        </div>
        <div className="d-flex align-items-center gap-1">
          {unreadTotal > 0 && (
            <span className="badge rounded-pill bg-danger" style={{ fontSize: '0.7rem' }}>
              {unreadTotal}
            </span>
          )}
          <span className="material-symbols-outlined text-muted" style={{ fontSize: '18px' }}>
            open_in_full
          </span>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      className="unimart-chat-floating-btn"
      onClick={toggleChat}
      aria-label={isOpen ? 'Close chat' : 'Open campus marketplace chat'}
      title="Chat with campus sellers (Airbnb style)"
    >
      <div className="chat-btn-icon-wrap">
        <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>
          {isOpen ? 'close' : 'chat'}
        </span>
        {!isOpen && unreadTotal > 0 && (
          <span className="unimart-chat-unread-badge">{unreadTotal}</span>
        )}
      </div>
      <span className="chat-btn-label">
        {isOpen ? 'Close' : 'Messages'}
      </span>
    </button>
  );
}
