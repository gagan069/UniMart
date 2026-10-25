// src/api/chatApi.js
/**
 * UNIMART Chat API (Fake REST API layer)
 * 
 * Interacts with:
 * - conversations(id, listing_id, buyer_id, seller_id, created_at)
 * - messages(id, conversation_id, sender_id, body, created_at)
 * 
 * Enforces rule: Guests cannot chat (requires authenticated Chitkara account).
 */

import { getTable, setTable, delay } from './db.js';
import { listingsApi } from './listingsApi.js';

export const chatApi = {
  /**
   * Get all conversations involving the current user
   */
  async getConversations(userId) {
    await delay(250);
    if (!userId) {
      throw new Error('Please log in with your Chitkara account to access campus chat.');
    }

    const conversations = getTable('conversations') || [];
    const messages = getTable('messages') || [];
    const users = getTable('users') || [];
    const listingsRes = await listingsApi.getListings();
    const allListings = listingsRes.data || [];

    // Filter conversations where user is buyer or seller
    const userConvs = conversations.filter(
      (c) => c.buyer_id === userId || c.seller_id === userId
    );

    const populated = userConvs.map((conv) => {
      const otherUserId = conv.buyer_id === userId ? conv.seller_id : conv.buyer_id;
      const otherUser = users.find((u) => u.id === otherUserId) || {
        name: 'Campus Student',
        email: ''
      };

      const listing = allListings.find((l) => Number(l.id) === Number(conv.listing_id)) || null;
      const convMessages = messages
        .filter((m) => m.conversation_id === conv.id)
        .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

      return {
        id: conv.id,
        listing_id: conv.listing_id,
        buyer_id: conv.buyer_id,
        seller_id: conv.seller_id,
        created_at: conv.created_at,
        participant: {
          id: otherUserId,
          name: otherUser.name,
          email: otherUser.email,
          avatar: otherUser.name.charAt(0).toUpperCase(),
          roleLabel: conv.buyer_id === userId ? 'Seller' : 'Buyer'
        },
        listing,
        messages: convMessages,
        lastMessage: convMessages[convMessages.length - 1] || null
      };
    });

    return { data: populated };
  },

  /**
   * Start a new conversation or retrieve an existing one
   */
  async startOrGetConversation({ listingId, buyerId, sellerId }) {
    await delay(200);
    if (!buyerId) {
      throw new Error('Please log in with your Chitkara account to message sellers.');
    }

    if (buyerId === sellerId) {
      throw new Error('You cannot start a chat on your own listing.');
    }

    const conversations = getTable('conversations') || [];
    let conv = conversations.find(
      (c) =>
        Number(c.listing_id) === Number(listingId) &&
        c.buyer_id === buyerId &&
        c.seller_id === sellerId
    );

    if (!conv) {
      conv = {
        id: `conv_${listingId}_${buyerId}_${Date.now()}`,
        listing_id: Number(listingId),
        buyer_id: buyerId,
        seller_id: sellerId,
        created_at: new Date().toISOString()
      };
      conversations.unshift(conv);
      setTable('conversations', conversations);
    }

    return { data: conv };
  },

  /**
   * Send a message in a conversation
   */
  async sendMessage({ conversationId, senderId, body }) {
    await delay(150);
    if (!senderId) throw new Error('Authentication required.');
    if (!body || !body.trim()) throw new Error('Message body cannot be empty.');

    const messages = getTable('messages') || [];
    const newMessage = {
      id: `msg_${Date.now()}`,
      conversation_id: conversationId,
      sender_id: senderId,
      body: body.trim(),
      created_at: new Date().toISOString()
    };

    messages.push(newMessage);
    setTable('messages', messages);

    return { data: newMessage };
  }
};

export default chatApi;
