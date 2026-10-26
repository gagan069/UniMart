/**
 * Seeded mock accounts for UNIMART
 */

export const SEEDED_USERS = [
  {
    id: 'admin_1',
    email: 'admin@chitkara.edu.in',
    password: 'Unimart@123',
    name: 'Campus Admin',
    studentId: 'ADMIN-001',
    role: 'admin'
  },
  {
    id: 'student_a',
    email: 'satkar0696.becse25@chitkara.edu.in',
    password: 'student123',
    name: 'Satkar Singh',
    studentId: '2110990696',
    department: 'Computer Science & Engineering',
    role: 'student'
  },
  {
    id: 'student_b',
    email: 'priya.k@chitkara.edu.in',
    password: 'student123',
    name: 'Priya K.',
    studentId: '2110990697',
    department: 'Mathematics',
    role: 'student'
  }
];

export function findUserByCredentials(email, password) {
  const normalizedEmail = (email || '').trim().toLowerCase();
  return SEEDED_USERS.find(
    (u) => u.email.toLowerCase() === normalizedEmail && u.password === password
  );
}

/**
 * Look up a user by email only (used by forgot-password flow).
 * Returns the user object or undefined if not found.
 */
export function findUserByEmail(email) {
  const normalizedEmail = (email || '').trim().toLowerCase();
  return SEEDED_USERS.find((u) => u.email.toLowerCase() === normalizedEmail);
}

/**
 * Reset a user's password in the in-memory store.
 * Returns true if the user was found and updated, false otherwise.
 */
export function resetUserPassword(email, newPassword) {
  const normalizedEmail = (email || '').trim().toLowerCase();
  const user = SEEDED_USERS.find((u) => u.email.toLowerCase() === normalizedEmail);
  if (!user) return false;
  user.password = newPassword;
  return true;
}

export function registerNewStudent({ name, email, studentId, password }) {
  const newStudent = {
    id: `student_${Date.now()}`,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    studentId: studentId.trim(),
    password,
    role: 'student' // Registration must default to student; no role selection allowed
  };
  SEEDED_USERS.push(newStudent);
  return newStudent;
}
