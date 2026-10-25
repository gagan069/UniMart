import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../../context/ChatContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import './Chat.css';

export default function ChatModal() {
  const {
    isOpen,
    isMinimized,
    activeConversation,
    conversations,
    closeChat,
    toggleMinimize,
    openConversation,
    sendMessage,
    toggleReaction
  } = useChat();

  const { user } = useAuth() || {};

  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showListingDetails, setShowListingDetails] = useState(false);
  const [isExitingListing, setIsExitingListing] = useState(false);
  const [selectedReactionMessageId, setSelectedReactionMessageId] = useState(null);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const messagesEndRef = useRef(null);

  const toggleListingDetails = () => {
    if (showListingDetails) {
      setIsExitingListing(true);
      setTimeout(() => {
        setShowListingDetails(false);
        setIsExitingListing(false);
      }, 260);
    } else {
      setIsExitingListing(false);
      setShowListingDetails(true);
    }
  };

  const closeListingDetails = () => {
    setIsExitingListing(true);
    setTimeout(() => {
      setShowListingDetails(false);
      setIsExitingListing(false);
    }, 260);
  };

  // Auto scroll to bottom of chat when new message arrives or conversation changes
  useEffect(() => {
    if (activeConversation && isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeConversation?.messages, isOpen, isMinimized, activeConversation?.id]);

  if (!isOpen || isMinimized) {
    return null;
  }

  const handleSend = (e) => {
    e?.preventDefault();
    if (!inputText.trim()) return;
    sendMessage(inputText.trim());
    setInputText('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Filter conversations
  const filteredConversations = conversations.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const nameMatch = c.participant?.name?.toLowerCase().includes(q) || c.participant?.displayName?.toLowerCase().includes(q);
    const titleMatch = c.listing?.title?.toLowerCase().includes(q);
    return nameMatch || titleMatch;
  });

  const conv = activeConversation;
  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'S';
  const hasFloatingCompanion = !isFullScreen && showListingDetails && Boolean(conv?.listing);

  return (
    <div
      className={`unimart-airbnb-chat-backdrop ${isFullScreen ? 'is-fullscreen' : ''}`}
      onClick={isFullScreen ? undefined : closeChat}
      role="dialog"
      aria-modal="true"
      aria-label="Campus Chat"
    >
      {/* Floating Cluster / Stage */}
      <div className={`unimart-chat-floating-cluster ${hasFloatingCompanion ? 'has-companion' : ''} ${isFullScreen ? 'is-fullscreen' : ''}`}>
        {/* Floating or Full Screen Window Card */}
        <div
          className={`unimart-airbnb-chat-window-card ${isFullScreen ? 'fullscreen' : ''} ${hasFloatingCompanion ? 'with-companion' : ''} ${!isFullScreen && isExitingListing ? 'shifting-back' : ''}`}
          onClick={(e) => e.stopPropagation()}
        >
        {/* ================= TOP NAVIGATION BAR (WINDOW HEADER) ================= */}
        <header className="unimart-chat-top-nav">
          {/* Left: UniMart Logo */}
          <div className="unimart-chat-nav-logo" title="UNIMART Campus Marketplace">
            <div className="unimart-chat-logo-icon">
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                local_mall
              </span>
            </div>
            <span className="unimart-chat-logo-text">unimart</span>
          </div>

          {/* Right: Actions */}
          <div className="unimart-chat-nav-right">
            <div className="unimart-chat-user-pill">
              <div className="unimart-chat-user-badge" title={user?.name || 'Student Account'}>
                {userInitial}
              </div>
              <button
                type="button"
                className="unimart-chat-menu-btn"
                onClick={() => setIsFullScreen((prev) => !prev)}
                title={isFullScreen ? "Back to floating window" : "Full screen chatting"}
                aria-label={isFullScreen ? "Exit full screen" : "Full screen"}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                  {isFullScreen ? 'close_fullscreen' : 'open_in_full'}
                </span>
              </button>
              <button
                type="button"
                className="unimart-chat-menu-btn"
                onClick={closeChat}
                title="Close chat"
                aria-label="Close chat"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                  close
                </span>
              </button>
            </div>
          </div>
        </header>

        {/* ================= MAIN SPLIT CONTENT ================= */}
        <div className="unimart-chat-split-body">
          {/* ----------------- LEFT SIDEBAR: PAST CONVERSATIONS ----------------- */}
          <aside className="unimart-chat-sidebar">
            <div className="unimart-chat-sidebar-header">
              <div className="d-flex align-items-center gap-2">
                <button
                  type="button"
                  className="unimart-chat-back-arrow-btn"
                  onClick={closeChat}
                  title="Close chat"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                    arrow_back
                  </span>
                </button>
                <h2 className="unimart-chat-sidebar-title">Past conversations</h2>
              </div>

              {conversations.length > 0 && (
                <button
                  type="button"
                  className="unimart-chat-circle-icon-btn"
                  onClick={() => setShowSearch((prev) => !prev)}
                  title="Search conversations"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '17px' }}>
                    search
                  </span>
                </button>
              )}
            </div>

            {/* Search bar toggle */}
            {showSearch && (
              <div className="unimart-chat-search-container">
                <span className="material-symbols-outlined unimart-chat-search-magnifier">search</span>
                <input
                  type="text"
                  className="unimart-chat-search-field"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                />
                {searchQuery && (
                  <button
                    type="button"
                    className="unimart-chat-clear-search"
                    onClick={() => setSearchQuery('')}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>close</span>
                  </button>
                )}
              </div>
            )}

            {/* Conversations List */}
            <div className="unimart-chat-sidebar-list">
              {filteredConversations.length === 0 ? (
                <div className="unimart-chat-empty-sidebar">
                  <div className="unimart-chat-empty-icon-wrap">
                    <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>
                      forum
                    </span>
                  </div>
                  <h3 className="unimart-chat-empty-title">No conversations yet</h3>
                  <p className="unimart-chat-empty-text">
                    Browse items on the campus marketplace and click <strong>"Chat"</strong> on any card to contact a seller.
                  </p>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-dark rounded-pill mt-2"
                    onClick={closeChat}
                  >
                    Browse Campus Marketplace
                  </button>
                </div>
              ) : (
                filteredConversations.map((item) => {
                  const isActive = conv && conv.id === item.id;
                  const lastMsg = item.messages?.[item.messages.length - 1];

                  const reactedMsg = item.messages?.find((m) => m.reactions && m.reactions.length > 0);
                  let snippet = lastMsg ? lastMsg.text : 'No messages yet';
                  if (reactedMsg && reactedMsg.reactions?.includes('❤️')) {
                    snippet = `Reacted ❤️ to "${reactedMsg.text.replace(/\n/g, ' ').substring(0, 30)}..."`;
                  }

                  return (
                    <div
                      key={item.id}
                      className={`unimart-chat-sidebar-item ${isActive ? 'active' : ''}`}
                      onClick={() => openConversation(item.id)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') openConversation(item.id);
                      }}
                    >
                      {/* Thumbnail / Avatar */}
                      <div className="unimart-chat-item-thumb-wrap">
                        {item.listing?.image ? (
                          <img
                            src={item.listing.image}
                            alt={item.listing.title}
                            className="unimart-chat-item-thumb"
                          />
                        ) : (
                          <div
                            className="unimart-chat-item-fallback-thumb"
                            style={{ backgroundColor: item.participant?.avatarBg || '#70182c' }}
                          >
                            {item.participant?.avatar || 'S'}
                          </div>
                        )}
                      </div>

                      {/* Content: Main = Product Name (bold), Sub = Seller Name (light) */}
                      <div className="unimart-chat-item-details">
                        <div className="unimart-chat-item-row-top">
                          <span className="unimart-chat-item-sublabel">
                            {item.listing?.category || 'Campus Marketplace'}
                          </span>
                          <span className="unimart-chat-item-date">
                            {item.listing?.dateLabel || (lastMsg ? lastMsg.date || lastMsg.timestamp : '')}
                          </span>
                        </div>

                        {/* Product Name as Main Title in Bold */}
                        <h3 className="unimart-chat-item-title" title={item.listing?.title}>
                          {item.listing?.title}
                        </h3>

                        {/* Seller Name in Lighter Text */}
                        <div className="unimart-chat-item-seller-line">
                          <span>👤 {item.participant?.name || item.participant?.displayName}</span>
                        </div>

                        <p className="unimart-chat-item-snippet">
                          {snippet}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </aside>

          {/* ----------------- RIGHT COLUMN: ACTIVE CONVERSATION ----------------- */}
          <main className="unimart-chat-main-panel">
            {conv ? (
              <>
                {/* Conversation Top Header: PRODUCT NAME ON MAIN, SELLER NAME ON LIGHT TEXT */}
                <div className="unimart-chat-panel-header">
                  <div className="unimart-chat-panel-header-left">
                    {/* Thumbnail Avatar with badge */}
                    <div className="unimart-chat-avatar-badge-wrap">
                      {conv.listing?.image ? (
                        <img
                          src={conv.listing.image}
                          alt={conv.listing?.title}
                          className="unimart-chat-header-avatar-img"
                        />
                      ) : (
                        <div
                          className="unimart-chat-header-avatar-circle"
                          style={{ backgroundColor: conv.participant?.avatarBg || '#70182c' }}
                        >
                          {conv.participant?.avatar || 'S'}
                        </div>
                      )}
                      <span className="unimart-chat-header-badge-tag" title={`Seller: ${conv.participant?.name}`}>
                        {conv.participant?.badge || conv.participant?.name?.charAt(0) || 'S'}
                      </span>
                    </div>

                    {/* MAIN: Product Name (in bold) | SUB: Seller Name (in light text) */}
                    <div className="unimart-chat-header-title-box">
                      <div className="d-flex align-items-center gap-2 min-w-0">
                        {/* PRODUCT NAME ON MAIN (BOLD) */}
                        <h1 className="unimart-chat-header-title" title={conv.listing?.title}>
                          {conv.listing?.title}
                        </h1>
                        <button
                          type="button"
                          className="unimart-chat-chevron-btn"
                          onClick={toggleListingDetails}
                          title="View listing details"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                            chevron_right
                          </span>
                        </button>
                      </div>

                      {/* SELLER NAME ON LIGHT TEXT */}
                      <div className="unimart-chat-header-subrow">
                        <span className="unimart-chat-seller-light-name" title={`Seller: ${conv.participant?.name}`}>
                          👤 {conv.participant?.name || conv.participant?.displayName || 'Campus Seller'}
                        </span>
                        <span className="unimart-chat-dot-sep">•</span>
                        <span>{conv.listing?.meetupSpot ? `${conv.listing.meetupSpot} • ` : ''}Verified Listing</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Show / Hide listing button (No clipping!) */}
                  <div className="unimart-chat-panel-header-right">
                    <button
                      type="button"
                      className="unimart-chat-show-reservation-btn"
                      onClick={toggleListingDetails}
                    >
                      {showListingDetails ? 'Hide listing' : 'Show listing'}
                    </button>
                  </div>
                </div>

                {/* Message Stream */}
                <div className="unimart-chat-stream">
                  {(!conv.messages || conv.messages.length === 0) ? (
                    <div className="unimart-chat-start-notice">
                      <span className="material-symbols-outlined mb-2" style={{ fontSize: '28px', color: '#70182c' }}>
                        waving_hand
                      </span>
                      <h4 className="fw-bold mb-1" style={{ fontSize: '0.96rem' }}>
                        Start your conversation about {conv.listing?.title}
                      </h4>
                      <p className="text-muted mb-0" style={{ fontSize: '0.8rem', maxWidth: '400px' }}>
                        Chat directly with <strong>{conv.participant?.name}</strong> (₹{conv.listing?.price?.toLocaleString('en-IN')}). Type a message below to arrange a campus meetup or ask a question!
                      </p>
                    </div>
                  ) : (
                    conv.messages.map((msg, index) => {
                      const isUser = msg.sender === 'user';
                      const showDate =
                        index === 0 || conv.messages[index - 1]?.date !== msg.date;

                      return (
                        <React.Fragment key={msg.id || index}>
                          {/* Centered Date Divider */}
                          {showDate && msg.date && (
                            <div className="unimart-chat-airbnb-date-divider">
                              <span>{msg.date}</span>
                            </div>
                          )}

                          {/* Message Item */}
                          <div className={`unimart-chat-airbnb-msg-wrap ${isUser ? 'user-side' : 'host-side'}`}>
                            {/* Sender & timestamp header above bubble */}
                            <div className="unimart-chat-airbnb-msg-header">
                              {isUser ? `You · ${msg.timestamp}` : `${msg.senderName || conv.participant?.name} ${msg.timestamp}`}
                            </div>

                            {/* Speech Bubble */}
                            <div
                              className={`unimart-chat-airbnb-bubble ${isUser ? 'bubble-user' : 'bubble-host'}`}
                              onClick={() => setSelectedReactionMessageId(selectedReactionMessageId === msg.id ? null : msg.id)}
                              title="Click to add a reaction"
                            >
                              <div className="unimart-chat-bubble-text">{msg.text}</div>

                              {/* Floating Reaction Badges at bottom right of bubble */}
                              {msg.reactions && msg.reactions.length > 0 && (
                                <div className="unimart-chat-reaction-badge-pill">
                                  {msg.reactions.map((emoji, eIdx) => (
                                    <span key={eIdx} className="reaction-emoji">{emoji}</span>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Quick reaction picker toggle */}
                            {selectedReactionMessageId === msg.id && (
                              <div className="unimart-chat-reaction-picker">
                                {['❤️', '👍', '😊', '👏', '🔥'].map((emoji) => (
                                  <button
                                    key={emoji}
                                    type="button"
                                    className="reaction-pick-btn"
                                    onClick={() => {
                                      toggleReaction(msg.id, emoji);
                                      setSelectedReactionMessageId(null);
                                    }}
                                  >
                                    {emoji}
                                  </button>
                                ))}
                              </div>
                            )}

                            {/* Read Receipt underneath */}
                            {msg.readReceipt && (
                              <div className="unimart-chat-read-receipt-line">
                                {msg.readReceipt}
                              </div>
                            )}
                          </div>
                        </React.Fragment>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Response Time Pill Notice */}
                <div className="unimart-chat-response-notice-wrap">
                  <div className="unimart-chat-response-notice-pill">
                    <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>
                      schedule
                    </span>
                    <span>Typical response time: {conv.participant?.responseTime || '15 mins'}</span>
                  </div>
                </div>

                {/* Message Input Box (Airbnb Rounded Container - Clean & Glitch-Free) */}
                <form className="unimart-chat-airbnb-input-box" onSubmit={handleSend}>
                  <textarea
                    className="unimart-chat-airbnb-textarea"
                    placeholder="Write a message..."
                    rows={2}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />

                  <div className="unimart-chat-airbnb-input-toolbar">
                    <div className="unimart-chat-input-hint">
                      Press <kbd>Enter</kbd> to send
                    </div>

                    <button
                      type="submit"
                      className="unimart-chat-airbnb-send-btn"
                      disabled={!inputText.trim()}
                      title="Send message"
                      aria-label="Send message"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                        arrow_upward
                      </span>
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="unimart-chat-no-conversation-panel">
                <div className="unimart-chat-no-conv-icon-box">
                  <span className="material-symbols-outlined" style={{ fontSize: '42px' }}>
                    mark_chat_unread
                  </span>
                </div>
                <h2 className="unimart-chat-no-conv-title">Your Campus Messages</h2>
                <p className="unimart-chat-no-conv-desc">
                  Connect directly with student peers on campus to inquire about textbooks, equipment, and handmade items.
                </p>
                <div className="unimart-chat-no-conv-tip">
                  <span className="material-symbols-outlined" style={{ fontSize: '17px', color: '#70182c' }}>
                    touch_app
                  </span>
                  <span>Select any product card on the marketplace and click <strong>"Chat"</strong> to begin!</span>
                </div>
              </div>
            )}
          </main>

          {/* ----------------- SIDE DRAWER: SHOW LISTING DETAILS (FULLSCREEN MODE ONLY) ----------------- */}
          {isFullScreen && showListingDetails && conv?.listing && (
            <aside className="unimart-chat-listing-drawer">
              <div className="unimart-chat-drawer-header">
                <h3 className="unimart-chat-drawer-title">Listing details</h3>
                <button
                  type="button"
                  className="unimart-chat-circle-icon-btn"
                  onClick={closeListingDetails}
                  title="Close details"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
                </button>
              </div>

              <div className="unimart-chat-drawer-body">
                {conv.listing.image && (
                  <img
                    src={conv.listing.image}
                    alt={conv.listing.title}
                    className="unimart-chat-drawer-img"
                  />
                )}

                <h4 className="fw-bold mt-3 mb-1" style={{ fontSize: '1.05rem' }}>
                  {conv.listing.title}
                </h4>

                <div className="d-flex align-items-baseline gap-2 mb-3">
                  <span className="fw-bold" style={{ fontSize: '1.2rem', color: '#70182c' }}>
                    ₹{conv.listing.price?.toLocaleString('en-IN')}
                  </span>
                  {conv.listing.origPrice && (
                    <span className="text-muted text-decoration-line-through" style={{ fontSize: '0.85rem' }}>
                      ₹{conv.listing.origPrice.toLocaleString('en-IN')}
                    </span>
                  )}
                  <span className="badge bg-light text-dark border ms-auto" style={{ fontSize: '0.72rem' }}>
                    {conv.listing.condition}
                  </span>
                </div>

                <div className="unimart-chat-drawer-info-block">
                  <span className="text-muted d-block mb-1" style={{ fontSize: '0.72rem', fontWeight: 600 }}>
                    CAMPUS MEETUP LOCATION
                  </span>
                  <div className="d-flex align-items-center gap-1.5 fw-semibold" style={{ fontSize: '0.85rem' }}>
                    <span className="material-symbols-outlined text-danger" style={{ fontSize: '17px' }}>
                      location_on
                    </span>
                    <span>{conv.listing.meetupSpot || 'Library Entrance'}</span>
                  </div>
                </div>

                <div className="unimart-chat-drawer-info-block mt-3">
                  <span className="text-muted d-block mb-1" style={{ fontSize: '0.72rem', fontWeight: 600 }}>
                    SELLER INFORMATION
                  </span>
                  <div className="fw-semibold" style={{ fontSize: '0.86rem' }}>
                    {conv.participant?.name}
                  </div>
                  <div className="text-muted" style={{ fontSize: '0.74rem' }}>
                    {conv.participant?.department}
                  </div>
                </div>
              </div>
            </aside>
          )}
        </div>
      </div>

      {/* ================= COMPANION FLOATING LISTING WINDOW (FLOATING MODE ONLY) ================= */}
      {!isFullScreen && showListingDetails && conv?.listing && (
        <aside
          className={`unimart-chat-companion-window ${isExitingListing ? 'companion-exit' : ''}`}
          onClick={(e) => e.stopPropagation()}
          aria-label="Listing details floating window"
        >
          <div className="unimart-chat-companion-header">
            <div className="d-flex align-items-center gap-2">
              <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#70182c' }}>
                storefront
              </span>
              <h3 className="unimart-chat-companion-title">Listing details</h3>
            </div>
            <button
              type="button"
              className="unimart-chat-circle-icon-btn"
              onClick={closeListingDetails}
              title="Close listing window"
              aria-label="Close listing window"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
            </button>
          </div>

          <div className="unimart-chat-companion-body">
            {conv.listing.image && (
              <div className="unimart-companion-img-wrap">
                <img
                  src={conv.listing.image}
                  alt={conv.listing.title}
                  className="unimart-chat-drawer-img"
                />
                {conv.listing.condition && (
                  <span className="unimart-companion-condition-tag">
                    {conv.listing.condition}
                  </span>
                )}
              </div>
            )}

            <h4 className="fw-bold mt-3 mb-1" style={{ fontSize: '1.05rem', lineHeight: '1.35' }}>
              {conv.listing.title}
            </h4>

            <div className="d-flex align-items-baseline gap-2 mb-3">
              <span className="fw-bold" style={{ fontSize: '1.25rem', color: '#70182c' }}>
                ₹{conv.listing.price?.toLocaleString('en-IN')}
              </span>
              {conv.listing.origPrice && (
                <span className="text-muted text-decoration-line-through" style={{ fontSize: '0.85rem' }}>
                  ₹{conv.listing.origPrice.toLocaleString('en-IN')}
                </span>
              )}
              {conv.listing.condition && !conv.listing.image && (
                <span className="badge bg-light text-dark border ms-auto" style={{ fontSize: '0.72rem' }}>
                  {conv.listing.condition}
                </span>
              )}
            </div>

            <div className="unimart-chat-drawer-info-block">
              <span className="text-muted d-block mb-1" style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.04em' }}>
                CAMPUS MEETUP LOCATION
              </span>
              <div className="d-flex align-items-center gap-1.5 fw-semibold" style={{ fontSize: '0.85rem' }}>
                <span className="material-symbols-outlined text-danger" style={{ fontSize: '18px' }}>
                  location_on
                </span>
                <span>{conv.listing.meetupSpot || 'Library Entrance / Student Center'}</span>
              </div>
            </div>

            <div className="unimart-chat-drawer-info-block mt-3">
              <span className="text-muted d-block mb-1" style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.04em' }}>
                STUDENT SELLER
              </span>
              <div className="d-flex align-items-center gap-2">
                <div className="unimart-companion-avatar">
                  {conv.participant?.avatar ? (
                    <span style={{ fontSize: '1rem' }}>{conv.participant.avatar}</span>
                  ) : (
                    <span>{conv.participant?.name?.charAt(0) || 'S'}</span>
                  )}
                </div>
                <div>
                  <div className="fw-semibold" style={{ fontSize: '0.88rem' }}>
                    {conv.participant?.name || conv.participant?.displayName}
                  </div>
                  <div className="text-muted" style={{ fontSize: '0.74rem' }}>
                    {conv.participant?.department || 'Verified Student'}
                  </div>
                </div>
              </div>
            </div>

            <div className="unimart-companion-safety-note mt-3">
              <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#16a34a' }}>
                verified_user
              </span>
              <span>Campus Safe Trade: Always meet in public campus spots and inspect the item before finalizing payment.</span>
            </div>
          </div>
        </aside>
      )}
    </div>
  </div>
);
}
