import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext.jsx';
import { useTheme } from './context/ThemeContext.jsx';
import { SEEDED_USERS, findUserByCredentials, registerNewStudent } from './lib/mockUsers.js';
import './LoginPage.css';
import welcomeStudentImg from './assets/welcome_student.jpg';
import campusParkImg from './assets/campus_park.jpg';

export default function LoginPage({ onGoToDashboard }) {
  const auth = useAuth();
  const { theme, toggleTheme } = useTheme();
  // Page 1 = Welcome Screen (Expansive skater artwork)
  // Page 2 = Campus Gateway (Full campus illustration with Login & Register below)
  const [currentPage, setCurrentPage] = useState(1);

  // Popup Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('login'); // 'login' | 'register'

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [alertInfo, setAlertInfo] = useState(null);
  const [guestNotice, setGuestNotice] = useState(false);

  // Keyboard navigation: Left/Right arrows glide between pages, Escape closes modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isModalOpen) {
        if (e.key === 'Escape') setIsModalOpen(false);
        return;
      }
      if (e.key === 'ArrowRight' && currentPage === 1) setCurrentPage(2);
      if (e.key === 'ArrowLeft' && currentPage === 2) setCurrentPage(1);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, isModalOpen]);

  const openAuth = (mode) => {
    setModalMode(mode);
    setAlertInfo(null);
    setIsModalOpen(true);
  };

  const handleDemoFill = (userType = 'student_a') => {
    let target = SEEDED_USERS[1];
    if (userType === 'student_b') target = SEEDED_USERS[2];
    if (userType === 'admin') target = SEEDED_USERS[0];

    setEmail(target.email);
    setPassword(target.password);
    setFieldErrors({});
    setAlertInfo({
      type: 'info',
      message: `Populated ${target.name} (${target.role.toUpperCase()}) credentials. Click "Sign In" below.`
    });
  };

  const validateRegister = () => {
    const errs = {};
    if (!fullName.trim()) errs.fullName = 'Full Name is required.';
    if (!studentId.trim()) errs.studentId = 'Student ID is required.';

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      errs.email = 'College email is required.';
    } else if (!trimmedEmail.endsWith('@chitkara.edu.in')) {
      errs.email = 'Only official university emails ending in @chitkara.edu.in are allowed.';
    }

    if (!password) {
      errs.password = 'Password is required.';
    } else if (password.length < 6) {
      errs.password = 'Password must be at least 6 characters.';
    }

    if (!confirmPassword) {
      errs.confirmPassword = 'Confirm Password is required.';
    } else if (confirmPassword !== password) {
      errs.confirmPassword = 'Passwords do not match.';
    }

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setAlertInfo(null);

    if (modalMode === 'register') {
      const isValid = validateRegister();
      if (!isValid) return;

      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        const newStudent = registerNewStudent({
          name: fullName,
          email,
          studentId,
          password
        });
        if (auth?.login) auth.login(newStudent);

        setAlertInfo({
          type: 'success',
          message: `Registration successful! Welcome, ${newStudent.name}. Redirecting...`
        });
        setTimeout(() => {
          if (onGoToDashboard) onGoToDashboard();
        }, 800);
      }, 700);
      return;
    }

    // Login mode
    if (!email.trim() || !password) {
      setAlertInfo({
        type: 'danger',
        message: 'Please enter both your college email and password.'
      });
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const matched = findUserByCredentials(email, password);
      let sessionUser = matched;

      if (!sessionUser) {
        // Fallback demo for custom student logins with valid chitkara email
        if (email.trim().toLowerCase().endsWith('@chitkara.edu.in')) {
          sessionUser = {
            id: `student_${Date.now()}`,
            name: email.split('@')[0],
            email: email.trim().toLowerCase(),
            studentId: '2110990696',
            role: 'student'
          };
        } else {
          setAlertInfo({
            type: 'danger',
            message: 'Invalid credentials. Please use seeded accounts (Admin / Student A / Student B) or register with @chitkara.edu.in.'
          });
          return;
        }
      }

      if (auth?.login) auth.login(sessionUser);

      setAlertInfo({
        type: 'success',
        message: `Welcome back, ${sessionUser.name} (${sessionUser.role.toUpperCase()})! Redirecting...`
      });
      setTimeout(() => {
        if (onGoToDashboard) onGoToDashboard();
      }, 700);
    }, 600);
  };

  const handleSkip = () => {
    // Guest mode: log out any current user so user === null
    if (auth?.logout) auth.logout();
    if (onGoToDashboard) {
      onGoToDashboard();
    } else {
      setGuestNotice(true);
      setTimeout(() => setGuestNotice(false), 3500);
    }
  };

  return (
    <div className="unimart-app-shell">
      {/* ================= TOP NAVBAR (In normal flow, not overlapping image) ================= */}
      <nav className="unimart-navbar">
        <a 
          href="#home" 
          className="unimart-brand-link"
          onClick={(e) => {
            e.preventDefault();
            setCurrentPage(1);
          }}
        >
          <div className="unimart-brand-icon">
            <span className="material-symbols-outlined">local_mall</span>
          </div>
          <span>UNIMART</span>
        </a>

        <div className="d-flex align-items-center gap-2">
          {/* Theme Toggle Button */}
          <button
            type="button"
            className="unimart-theme-toggle-btn"
            onClick={toggleTheme}
            title={theme === 'dark' ? "Switch to light mode" : "Switch to dark mode"}
            aria-label="Toggle dark/light theme"
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              border: '1px solid var(--unimart-maroon-border, #e3e6ec)',
              background: 'rgba(255, 255, 255, 0.85)',
              color: 'var(--unimart-text-dark, #181b20)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '19px' }}>
              {theme === 'dark' ? 'light_mode' : 'dark_mode'}
            </span>
          </button>

          {onGoToDashboard && (
            <button
              type="button"
              className="btn btn-sm btn-light border rounded-pill px-3 fw-semibold text-muted d-none d-sm-inline-flex align-items-center gap-1"
              onClick={handleSkip}
              title="Continue as Guest (View-only mode)"
            >
              <span>Explore as Guest</span>
              <span className="material-symbols-outlined" style={{ fontSize: '17px' }}>arrow_forward</span>
            </button>
          )}

          <button
            type="button"
            className="unimart-signin-pill"
            onClick={() => openAuth('login')}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>login</span>
            <span>Sign In</span>
          </button>
        </div>
      </nav>

      {/* Screen-Edge Navigation Arrows */}
      <button
        type="button"
        className="unimart-nav-arrow unimart-nav-arrow-left"
        disabled={currentPage === 1}
        onClick={() => setCurrentPage(1)}
        title="Previous Page (Left Arrow Key)"
        aria-label="Previous Page"
      >
        <span className="material-symbols-outlined">chevron_left</span>
      </button>

      <button
        type="button"
        className="unimart-nav-arrow unimart-nav-arrow-right"
        disabled={currentPage === 2}
        onClick={() => setCurrentPage(2)}
        title="Next Page (Right Arrow Key)"
        aria-label="Next Page"
      >
        <span className="material-symbols-outlined">chevron_right</span>
      </button>

      {/* Guest Mode Toast */}
      {guestNotice && (
        <div className="position-fixed top-0 start-50 translate-middle-x mt-4 z-3 shadow rounded-4 p-3 bg-white border" style={{ maxWidth: '460px' }}>
          <div className="d-flex align-items-center gap-2">
            <span className="material-symbols-outlined text-success">check_circle</span>
            <span className="small text-dark fw-semibold">Exploring UNIMART in guest mode. You can log in anytime to buy or list items!</span>
          </div>
        </div>
      )}

      {/* ================= MAIN STAGE ================= */}
      <main className="unimart-main-stage">
        {currentPage === 1 ? (
          /* ---------------- PAGE 1: WELCOME SCREEN ---------------- */
          <div className="unimart-welcome-layout">
            {/* Expansive Responsive Banner Frame matching the reference */}
            <div className="unimart-welcome-artwork-frame">
              <img 
                src={welcomeStudentImg} 
                alt="Student jumping with skateboard" 
              />
            </div>

            <h1 className="unimart-welcome-title">
              Welcome to <span className="maroon-accent">UNIMART</span>
            </h1>

            <p className="unimart-welcome-text">
              Our platform is designed to help students save money by providing an alternative to buying expensive new items, while also allowing them to earn extra cash by selling items they no longer need.
            </p>

            {/* Dots indicator with beside-arrows */}
            <div className="unimart-dots-toolbar">
              <button
                type="button"
                className="unimart-tiny-arrow"
                disabled={true}
                aria-label="Previous"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_back_ios_new</span>
              </button>

              <div className="unimart-dots-cluster">
                <button
                  type="button"
                  className="unimart-page-dot active"
                  onClick={() => setCurrentPage(1)}
                  title="Page 1"
                />
                <button
                  type="button"
                  className="unimart-page-dot"
                  onClick={() => setCurrentPage(2)}
                  title="Page 2"
                />
              </div>

              <button
                type="button"
                className="unimart-tiny-arrow"
                onClick={() => setCurrentPage(2)}
                aria-label="Next"
                title="Next Page"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_forward_ios</span>
              </button>
            </div>

            {/* Continue Button */}
            <button
              type="button"
              className="unimart-btn-continue"
              onClick={() => setCurrentPage(2)}
            >
              <span>Continue to UNIMART</span>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                arrow_forward
              </span>
            </button>
          </div>
        ) : (
          /* ---------------- PAGE 2: CAMPUS GATEWAY (MATCHES REFERENCE PROPORTIONS) ---------------- */
          <div className="unimart-gateway-layout">
            {/* Expansive Artwork Banner with full bench, trees, and path visible */}
            <div className="unimart-gateway-artwork-frame">
              <img 
                src={campusParkImg} 
                alt="Campus street and park scenery" 
              />
            </div>

            {/* Brand Title: Serif Italic */}
            <div className="unimart-brand-title-serif">
              UNIMART
            </div>

            {/* Dots Toolbar with beside-arrows */}
            <div className="unimart-dots-toolbar">
              <button
                type="button"
                className="unimart-tiny-arrow"
                onClick={() => setCurrentPage(1)}
                aria-label="Previous Page"
                title="Previous Page"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_back_ios_new</span>
              </button>

              <div className="unimart-dots-cluster">
                <button
                  type="button"
                  className="unimart-page-dot"
                  onClick={() => setCurrentPage(1)}
                  title="Page 1"
                />
                <button
                  type="button"
                  className="unimart-page-dot active"
                  onClick={() => setCurrentPage(2)}
                  title="Page 2"
                />
              </div>

              <button
                type="button"
                className="unimart-tiny-arrow"
                disabled={true}
                aria-label="Next"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_forward_ios</span>
              </button>
            </div>

            {/* Login & Register Buttons (Pill layout) */}
            <div className="unimart-actions-row">
              <button
                type="button"
                className="unimart-login-pill-btn"
                onClick={() => openAuth('login')}
              >
                <span>Login</span>
              </button>

              <button
                type="button"
                className="unimart-register-pill-btn"
                onClick={() => openAuth('register')}
              >
                <span>Register</span>
              </button>
            </div>

            {/* or Skip */}
            <div>
              <button
                type="button"
                className="unimart-skip-btn"
                onClick={handleSkip}
              >
                or Skip
              </button>
            </div>
          </div>
        )}
      </main>

      {/* ================= CLEAN FOOTER ================= */}
      <footer className="unimart-page-footer">
        <div>
          <span>© {new Date().getFullYear()} UNIMART — Campus E-Commerce Platform.</span>
        </div>
        <div className="d-flex gap-4">
          <button
            type="button"
            className="btn btn-link p-0 text-muted small text-decoration-none"
            onClick={() => setCurrentPage(currentPage === 1 ? 2 : 1)}
          >
            {currentPage === 1 ? 'Go to Campus Gateway →' : '← Back to Welcome'}
          </button>
          <a href="#safety">Safety Guidelines</a>
          <a href="#terms">Terms of Service</a>
        </div>
      </footer>

      {/* ================= CLEAN POPUP MODAL ================= */}
      {isModalOpen && (
        <div
          className="unimart-popup-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsModalOpen(false);
          }}
        >
          <div className="unimart-popup-box">
            {/* Close Button */}
            <button
              type="button"
              className="unimart-close-btn"
              onClick={() => setIsModalOpen(false)}
              aria-label="Close"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
            </button>

            {/* Header */}
            <div className="text-center mb-4">
              <div className="unimart-brand-icon mx-auto mb-2">
                <span className="material-symbols-outlined">local_mall</span>
              </div>
              <h4 className="fw-bold mb-1" style={{ letterSpacing: '-0.02em', color: 'var(--unimart-text-dark)' }}>
                {modalMode === 'login' ? 'Sign In to UNIMART' : 'Create an Account'}
              </h4>
              <p className="text-muted small mb-0">
                {modalMode === 'login'
                  ? 'Access your campus marketplace items and chats.'
                  : 'Join fellow students to buy and sell on campus.'}
              </p>
            </div>

            {/* Tabs */}
            <div className="unimart-tabs-toggle">
              <button
                type="button"
                className={`unimart-tab-btn ${modalMode === 'login' ? 'active' : ''}`}
                onClick={() => {
                  setModalMode('login');
                  setAlertInfo(null);
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>login</span>
                <span>Sign In</span>
              </button>
              <button
                type="button"
                className={`unimart-tab-btn ${modalMode === 'register' ? 'active' : ''}`}
                onClick={() => {
                  setModalMode('register');
                  setAlertInfo(null);
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>person_add</span>
                <span>Register</span>
              </button>
            </div>

            {/* Alert banner */}
            {alertInfo && (
              <div className={`alert ${alertInfo.type === 'success' ? 'alert-success' : 'alert-light border'} py-2 px-3 small rounded-3 mb-3 d-flex align-items-center gap-2`}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                  {alertInfo.type === 'success' ? 'check_circle' : 'info'}
                </span>
                <span>{alertInfo.message}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} noValidate>
              {modalMode === 'register' && (
                <>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-dark mb-1">
                      Full Name <span className="text-danger">*</span>
                    </label>
                    <div className="unimart-input-group">
                      <input
                        type="text"
                        required
                        className={`unimart-form-field ${fieldErrors.fullName ? 'border-danger' : ''}`}
                        placeholder="e.g. Satkar Singh"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                      />
                      <span className="material-symbols-outlined unimart-input-icon">person</span>
                    </div>
                    {fieldErrors.fullName && (
                      <div className="text-danger small mt-1">{fieldErrors.fullName}</div>
                    )}
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-dark mb-1">
                      Student ID <span className="text-danger">*</span>
                    </label>
                    <div className="unimart-input-group">
                      <input
                        type="text"
                        required
                        className={`unimart-form-field ${fieldErrors.studentId ? 'border-danger' : ''}`}
                        placeholder="e.g. 2110990696"
                        value={studentId}
                        onChange={(e) => setStudentId(e.target.value)}
                      />
                      <span className="material-symbols-outlined unimart-input-icon">badge</span>
                    </div>
                    {fieldErrors.studentId && (
                      <div className="text-danger small mt-1">{fieldErrors.studentId}</div>
                    )}
                  </div>
                </>
              )}

              {/* Email */}
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <label className="form-label small fw-semibold text-dark mb-0">
                    College Email <span className="text-danger">*</span>
                  </label>
                  {modalMode === 'login' && (
                    <div className="d-flex gap-1">
                      <button
                        type="button"
                        className="unimart-demo-btn"
                        onClick={() => handleDemoFill('student_a')}
                        title="Fill Student A (Satkar)"
                      >
                        <span>Student A</span>
                      </button>
                      <button
                        type="button"
                        className="unimart-demo-btn"
                        onClick={() => handleDemoFill('student_b')}
                        title="Fill Student B (Priya)"
                      >
                        <span>Student B</span>
                      </button>
                      <button
                        type="button"
                        className="unimart-demo-btn"
                        onClick={() => handleDemoFill('admin')}
                        title="Fill Admin (Campus Admin)"
                      >
                        <span>Admin</span>
                      </button>
                    </div>
                  )}
                </div>
                <div className="unimart-input-group">
                  <input
                    type="email"
                    required
                    className={`unimart-form-field ${fieldErrors.email ? 'border-danger' : ''}`}
                    placeholder="student@chitkara.edu.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <span className="material-symbols-outlined unimart-input-icon">mail</span>
                </div>
                {fieldErrors.email ? (
                  <div className="text-danger small mt-1">{fieldErrors.email}</div>
                ) : modalMode === 'register' ? (
                  <div className="text-muted small mt-1" style={{ fontSize: '0.75rem' }}>
                    Must be your verified Chitkara email (@chitkara.edu.in)
                  </div>
                ) : null}
              </div>

              {/* Password */}
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <label className="form-label small fw-semibold text-dark mb-0">
                    Password <span className="text-danger">*</span>
                  </label>
                  {modalMode === 'login' && (
                    <a
                      href="#forgot"
                      className="small text-decoration-none fw-semibold"
                      style={{ color: 'var(--unimart-maroon)', fontSize: '0.8rem' }}
                      onClick={(e) => {
                        e.preventDefault();
                        setAlertInfo({
                          type: 'info',
                          message: 'Password reset link sent to your student email.'
                        });
                      }}
                    >
                      Forgot?
                    </a>
                  )}
                </div>
                <div className="unimart-input-group">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    className={`unimart-form-field ${fieldErrors.password ? 'border-danger' : ''}`}
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <span className="material-symbols-outlined unimart-input-icon">lock</span>
                  <button
                    type="button"
                    className="unimart-input-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <span className="material-symbols-outlined">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
                {fieldErrors.password && (
                  <div className="text-danger small mt-1">{fieldErrors.password}</div>
                )}
              </div>

              {/* Confirm Password (Registration only) */}
              {modalMode === 'register' && (
                <div className="mb-3">
                  <label className="form-label small fw-semibold text-dark mb-1">
                    Confirm Password <span className="text-danger">*</span>
                  </label>
                  <div className="unimart-input-group">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      className={`unimart-form-field ${fieldErrors.confirmPassword ? 'border-danger' : ''}`}
                      placeholder="Confirm password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <span className="material-symbols-outlined unimart-input-icon">lock_reset</span>
                  </div>
                  {fieldErrors.confirmPassword && (
                    <div className="text-danger small mt-1">{fieldErrors.confirmPassword}</div>
                  )}
                </div>
              )}

              {/* Remember me */}
              <div className="form-check mb-3">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="modalRemember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{ accentColor: 'var(--unimart-maroon)' }}
                />
                <label className="form-check-label small text-muted" htmlFor="modalRemember">
                  Remember this device
                </label>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                className="unimart-register-pill-btn w-100"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm text-white" role="status"></span>
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>{modalMode === 'login' ? 'Sign In to UNIMART' : 'Join Campus Marketplace'}</span>
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_forward</span>
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="text-center my-3 position-relative">
              <hr className="my-2" />
              <span className="bg-white px-2 text-muted small position-absolute top-50 start-50 translate-middle" style={{ fontSize: '0.75rem' }}>
                or
              </span>
            </div>

            {/* Google SSO */}
            <button
              type="button"
              className="unimart-sso-btn"
              onClick={() => {
                setAlertInfo({
                  type: 'info',
                  message: 'Connecting to Campus Google Workspace...'
                });
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with College Google</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
