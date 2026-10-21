// src/api/authApi.js
/**
 * UNIMART Auth API (Fake REST API layer)
 * 
 * Enforces Chitkara University email constraint (@chitkara.edu.in)
 * and provides async methods with ~300ms network delay.
 */

import { getTable, setTable, delay } from './db.js';

const SESSION_KEY = 'unimart_active_session_user_v1';

export const authApi = {
  /**
   * Log in user with Chitkara email and password
   */
  async login({ email, password }) {
    await delay(300);
    const normalizedEmail = (email || '').trim().toLowerCase();

    if (!normalizedEmail.endsWith('@chitkara.edu.in')) {
      throw new Error('Only @chitkara.edu.in email addresses are permitted on UniMart.');
    }

    const users = getTable('users') || [];
    const matchedUser = users.find(
      (u) => u.email.toLowerCase() === normalizedEmail && u.password_hash === password
    );

    if (!matchedUser) {
      throw new Error('Invalid email or password. Please check your Chitkara credentials.');
    }

    // Strip password_hash before returning user to client
    const { password_hash, ...safeUser } = matchedUser;
    authApi.setCurrentUser(safeUser);
    return { data: safeUser, message: 'Login successful' };
  },

  /**
   * Register a new student account
   */
  async register({ name, email, student_id, password }) {
    await delay(300);
    const normalizedEmail = (email || '').trim().toLowerCase();

    if (!normalizedEmail.endsWith('@chitkara.edu.in')) {
      throw new Error('Registration is restricted to active @chitkara.edu.in accounts.');
    }

    const users = getTable('users') || [];
    const emailExists = users.some((u) => u.email.toLowerCase() === normalizedEmail);
    if (emailExists) {
      throw new Error('An account with this Chitkara email address already exists.');
    }

    const trimmedStudentId = (student_id || '').trim();
    if (trimmedStudentId && users.some((u) => u.student_id && u.student_id.toLowerCase() === trimmedStudentId.toLowerCase())) {
      throw new Error('An account with this Student ID already exists.');
    }

    const newUser = {
      id: `student_${Date.now()}`,
      name: name.trim(),
      email: normalizedEmail,
      student_id: trimmedStudentId,
      password_hash: password,
      role: 'student', // All public registrations are student accounts
      created_at: new Date().toISOString()
    };

    users.push(newUser);
    setTable('users', users);

    const { password_hash, ...safeUser } = newUser;
    authApi.setCurrentUser(safeUser);
    return { data: safeUser, message: 'Student registration successful' };
  },

  /**
   * Retrieve currently authenticated session user
   */
  async getCurrentUser() {
    await delay(150);
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (raw) return { data: JSON.parse(raw) };
    } catch (e) {}
    return { data: null };
  },

  setCurrentUser(user) {
    try {
      if (user) {
        localStorage.setItem(SESSION_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(SESSION_KEY);
      }
    } catch (e) {}
  },

  /**
   * End session
   */
  async logout() {
    await delay(200);
    authApi.setCurrentUser(null);
    return { success: true, message: 'Logged out successfully' };
  },

  /**
   * Get all seeded users (for demo account selector)
   */
  async getSeedUsers() {
    await delay(100);
    const users = getTable('users') || [];
    return {
      data: users.map(({ password_hash, ...safeUser }) => safeUser)
    };
  }
};

export default authApi;
