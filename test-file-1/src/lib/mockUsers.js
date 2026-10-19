/**
 * Seeded mock accounts and local user registry for UNIMART
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
    role: 'student'
  },
  {
    id: 'student_b',
    email: 'priya.k@chitkara.edu.in',
    password: 'student123',
    name: 'Priya K.',
    studentId: '2110990697',
    role: 'student'
  }
];

export function getCustomUsers() {
  try {
    const raw = localStorage.getItem('unimart_users');
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load unimart_users from localStorage', e);
    return [];
  }
}

export function getAllUsers() {
  const custom = getCustomUsers();
  // Merge seeded and custom without duplicate IDs
  const map = new Map();
  SEEDED_USERS.forEach((u) => map.set(u.id, u));
  custom.forEach((u) => map.set(u.id, u));
  return Array.from(map.values());
}

export function findUserByCredentials(email, password) {
  const normalizedEmail = (email || '').trim().toLowerCase();
  const all = getAllUsers();
  return all.find(
    (u) => u.email.toLowerCase() === normalizedEmail && u.password === password
  );
}

export function findUserById(id) {
  if (!id) return null;
  const all = getAllUsers();
  return all.find((u) => u.id === id) || null;
}

export function deriveStudentId(email) {
  const digits = (email || '').match(/\d+/g);
  if (digits && digits.length > 0) {
    return digits.join('').slice(0, 10);
  }
  return `STU-${Math.floor(100000 + Math.random() * 900000)}`;
}

export function registerNewStudent({ name, email, studentId, password }) {
  const normalizedEmail = email.trim().toLowerCase();
  const localPart = normalizedEmail.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_');
  const stableId = `student_${localPart}`;

  const resolvedStudentId =
    studentId && studentId.trim() ? studentId.trim() : deriveStudentId(normalizedEmail);

  const newStudent = {
    id: stableId,
    name: name.trim(),
    email: normalizedEmail,
    studentId: resolvedStudentId,
    password,
    role: 'student' // Registration must default to student; no role selection allowed
  };

  try {
    const existing = getCustomUsers();
    const updated = existing.filter((u) => u.id !== stableId && u.email !== normalizedEmail);
    updated.push(newStudent);
    localStorage.setItem('unimart_users', JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to persist new student in unimart_users', e);
  }

  return newStudent;
}
