import React, { createContext, useContext, useState, useEffect } from 'react';

const ChatContext = createContext(null);

const STORAGE_KEY = 'unimart_chat_conversations_v4';

// By default, a new user has not chatted ever (empty array)
const INITIAL_CONVERSATIONS = [];

export function ChatProvider({ children }) {
  const [conversations, setConversations] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to load chat history', e);
    }
    return INITIAL_CONVERSATIONS;
  });

  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState(null);

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
    } catch (e) {
      console.warn('Failed to save chat conversations', e);
    }
  }, [conversations]);

  // Total unread count
  const unreadTotal = conversations.reduce((acc, conv) => acc + (conv.unreadCount || 0), 0);

  // Active conversation object
  const activeConversation = conversations.find((c) => c.id === activeConversationId) || (conversations.length > 0 ? conversations[0] : null);

  // Mark conversation as read
  const markAsRead = (convId) => {
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === convId && c.unreadCount > 0) {
          return { ...c, unreadCount: 0 };
        }
        return c;
      })
    );
  };

  // Open chat directly for a specific item (from card)
  const openChatWithItem = (item) => {
    if (!item) return;

    const existing = conversations.find(
      (c) => c.listing?.id === item.id || (c.sellerId && c.sellerId === item.seller_id)
    );

    if (existing) {
      setActiveConversationId(existing.id);
      markAsRead(existing.id);
      setIsOpen(true);
      setIsMinimized(false);
      return;
    }

    const sellerName = item.seller || 'Campus Seller';
    const newConvId = `conv_item_${item.id}_${Date.now()}`;

    const newConversation = {
      id: newConvId,
      sellerId: item.seller_id || `seller_${item.id}`,
      participant: {
        id: item.seller_id || `seller_${item.id}`,
        name: sellerName,
        displayName: sellerName,
        roleLabel: 'Seller',
        badge: sellerName.charAt(0).toUpperCase() || 'S',
        department: item.categoryTheme === 'theme-academic' ? 'Academic Department' : 'Chitkara Campus Member',
        avatar: sellerName.charAt(0).toUpperCase() || 'S',
        avatarBg: '#70182c',
        online: true,
        verified: true,
        responseTime: '15 mins',
        rating: '4.9 ★ (Verified Student)'
      },
      listing: {
        id: item.id,
        title: item.title,
        price: item.price,
        origPrice: item.origPrice,
        condition: item.condition || 'Verified',
        image: item.image || (item.photos && item.photos[0]) || null,
        category: item.category || 'General',
        meetupSpot: item.notes || item.pickupSpot || item.meetupSpot || 'Library Entrance',
        status: 'Available',
        sublabel: `${item.condition || 'Verified'} • ${item.category || 'Item'}`,
        dateLabel: 'Today'
      },
      unreadCount: 0,
      lastUpdated: Date.now(),
      messages: [] // Starts completely empty as user has not chatted yet
    };

    setConversations((prev) => [newConversation, ...prev]);
    setActiveConversationId(newConvId);
    setIsOpen(true);
    setIsMinimized(false);
  };

  const openConversation = (convId) => {
    setActiveConversationId(convId);
    markAsRead(convId);
    setIsOpen(true);
    setIsMinimized(false);
  };

  const openInbox = () => {
    setIsOpen(true);
    setIsMinimized(false);
  };

  const closeChat = () => {
    setIsOpen(false);
    setIsMinimized(false);
  };

  const toggleChat = () => {
    setIsOpen((prev) => !prev);
    setIsMinimized(false);
  };

  const toggleMinimize = () => {
    setIsMinimized((prev) => !prev);
  };

  // SEND MESSAGE: User sends a message. NO automatic replies.
  const sendMessage = (text) => {
    if (!activeConversationId || !text || !text.trim()) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true }).toLowerCase();
    const userMsg = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      sender: 'user',
      senderName: 'You',
      timestamp: timeStr,
      date: 'Today',
      type: 'text',
      text: text.trim(),
      readReceipt: 'Sent'
    };

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === activeConversationId) {
          return {
            ...c,
            lastUpdated: Date.now(),
            messages: [...c.messages, userMsg]
          };
        }
        return c;
      })
    );
  };

  // Toggle reaction on a message (e.g. ❤️ or 👍)
  const toggleReaction = (messageId, emoji) => {
    if (!activeConversationId) return;

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === activeConversationId) {
          return {
            ...c,
            messages: c.messages.map((m) => {
              if (m.id === messageId) {
                const current = m.reactions || [];
                const hasEmoji = current.includes(emoji);
                const next = hasEmoji ? current.filter((e) => e !== emoji) : [...current, emoji];
                return { ...m, reactions: next };
              }
              return m;
            })
          };
        }
        return c;
      })
    );
  };

  return (
    <ChatContext.Provider
      value={{
        conversations,
        activeConversation,
        activeConversationId,
        isOpen,
        isMinimized,
        unreadTotal,
        openChatWithItem,
        openConversation,
        openInbox,
        closeChat,
        toggleChat,
        toggleMinimize,
        sendMessage,
        toggleReaction
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}

export default ChatContext;
