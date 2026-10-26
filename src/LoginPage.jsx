import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from './context/AuthContext.jsx';
import { useTheme } from './context/ThemeContext.jsx';
import { SEEDED_USERS, findUserByCredentials, findUserByEmail, resetUserPassword, registerNewStudent } from './lib/mockUsers.js';
import { generateOTP, sendOTPEmail } from './lib/emailService.js';
import { signInWithGoogleOAuth, initializeGoogleId } from './lib/googleAuth.js';
import './LoginPage.css';
import welcomeStudentImg from './assets/welcome_student.jpg';
import welcomeStudentDarkImg from './assets/welcome_student_dark.jpg';
import campusParkImg from './assets/campus_park.jpg';
import campusParkDarkImg from './assets/campus_park_dark.jpg';

export default function LoginPage({
  onGoToDashboard,
  initialMode = 'login',
  initialPage = 1,
  autoOpenModal = false
}) {
  const auth = useAuth();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const currentWelcomeImg = isDark ? welcomeStudentDarkImg : welcomeStudentImg;
  const currentCampusImg = isDark ? campusParkDarkImg : campusParkImg;

  // Page 1 = Welcome Screen (Expansive skater artwork)
  // Page 2 = Campus Gateway (Full campus illustration with Login & Register below)
  const [currentPage, setCurrentPage] = useState(initialPage);

  // Popup Modal states
  const [isModalOpen, setIsModalOpen] = useState(autoOpenModal || initialMode === 'register');
  const [modalMode, setModalMode] = useState(initialMode); // 'login' | 'register'

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
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [alertInfo, setAlertInfo] = useState(null);
  const [guestNotice, setGuestNotice] = useState(false);

  // ── Forgot Password flow state ──────────────────────────────────────────────
  // Steps: 'email' → 'otp' → 'reset' → (done, closes modal)
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotStep, setForgotStep] = useState('email'); // 'email' | 'otp' | 'reset'
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('')           // generated OTP
  const [otpInputs, setOtpInputs] = useState(['', '', '', '', '', '']); // 6 boxes
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [simulatedOtp, setSimulatedOtp] = useState('');  // shown on screen in demo mode
  const [otpExpiry, setOtpExpiry] = useState(null);     // Date when OTP expires
  const otpInputRefs = useRef([]);
  // ─────────────────────────────────────────────────────────────────────────────

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

  // ── Forgot Password handlers ────────────────────────────────────────────────
  const openForgotPassword = () => {
    setIsModalOpen(false);
    setForgotOpen(true);
    setForgotStep('email');
    setForgotEmail('');
    setForgotOtp('');
    setOtpInputs(['', '', '', '', '', '']);
    setNewPassword('');
    setConfirmNewPassword('');
    setForgotError('');
    setForgotSuccess('');
    setSimulatedOtp('');
    setOtpExpiry(null);
  };

  const closeForgotPassword = () => {
    setForgotOpen(false);
    setForgotStep('email');
    setForgotError('');
    setForgotSuccess('');
    setSimulatedOtp('');
  };

  // Step 1: Verify email is registered and send OTP
  const handleForgotEmailSubmit = async (e) => {
    e.preventDefault();
    setForgotError('');
    const trimEmail = forgotEmail.trim().toLowerCase();
    if (!trimEmail) { setForgotError('Please enter your registered email.'); return; }
    const user = findUserByEmail(trimEmail);
    if (!user) {
      setForgotError('No account found with this email. Please check and try again.');
      return;
    }
    setForgotLoading(true);
    try {
      const otp = generateOTP();
      const result = await sendOTPEmail(trimEmail, user.name, otp);
      setForgotOtp(otp);
      setOtpExpiry(new Date(Date.now() + 10 * 60 * 1000)); // 10-min expiry
      if (result.simulated) {
        setSimulatedOtp(otp); // show on-screen in demo mode
      }
      setForgotStep('otp');
    } catch (err) {
      setForgotError(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setForgotLoading(false);
    }
  };

  // OTP box input handler (auto-focus next box)
  const handleOtpInput = (index, value) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const next = [...otpInputs];
    next[index] = digit;
    setOtpInputs(next);
    if (digit && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpInputs[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const next = [...otpInputs];
    paste.split('').forEach((d, i) => { next[i] = d; });
    setOtpInputs(next);
    const nextFocus = Math.min(paste.length, 5);
    otpInputRefs.current[nextFocus]?.focus();
  };

  // Step 2: Verify OTP
  const handleOtpSubmit = (e) => {
    e.preventDefault();
    setForgotError('');
    const entered = otpInputs.join('');
    if (entered.length < 6) { setForgotError('Please enter the complete 6-digit OTP.'); return; }
    if (otpExpiry && new Date() > otpExpiry) {
      setForgotError('OTP has expired. Please go back and request a new one.');
      return;
    }
    if (entered !== forgotOtp) {
      setForgotError('Incorrect OTP. Please check and try again.');
      return;
    }
    setForgotStep('reset');
  };

  // Step 3: Set new password
  const handleResetPasswordSubmit = (e) => {
    e.preventDefault();
    setForgotError('');
    if (!newPassword) { setForgotError('Please enter a new password.'); return; }
    if (newPassword.length < 6) { setForgotError('Password must be at least 6 characters.'); return; }
    if (newPassword !== confirmNewPassword) { setForgotError('Passwords do not match.'); return; }
    setForgotLoading(true);
    setTimeout(() => {
      resetUserPassword(forgotEmail.trim().toLowerCase(), newPassword);
      setForgotLoading(false);
      setForgotSuccess('Password reset successful! You can now sign in with your new password.');
      setTimeout(() => {
        closeForgotPassword();
        openAuth('login');
      }, 2000);
    }, 600);
  };
  // ─────────────────────────────────────────────────────────────────────────────

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

  const handleGoogleSuccess = (profile) => {
    const normEmail = (profile.email || '').toLowerCase().trim();
    const existing = findUserByEmail(normEmail);
    let sessionUser;

    if (existing) {
      sessionUser = {
        ...existing,
        avatar: profile.picture || existing.avatar,
        name: existing.name || profile.name,
      };
    } else {
      sessionUser = {
        id: `google_${profile.sub || Date.now()}`,
        name: profile.name || normEmail.split('@')[0],
        email: normEmail,
        studentId: normEmail.split('@')[0].toUpperCase(),
        role: normEmail.includes('admin') ? 'admin' : 'student',
        avatar: profile.picture,
        picture: profile.picture,
        isGoogleUser: true,
      };
      SEEDED_USERS.push(sessionUser);
    }

    if (auth?.login) {
      auth.login(sessionUser);
    }

    setIsGoogleLoading(false);
    setAlertInfo({
      type: 'success',
      message: `Welcome, ${sessionUser.name}! Signed in via Google (${sessionUser.role.toUpperCase()}). Redirecting...`,
    });

    setTimeout(() => {
      if (onGoToDashboard) onGoToDashboard();
    }, 700);
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setAlertInfo({
      type: 'info',
      message: 'Opening Google Sign-In account picker...',
    });

    try {
      const profile = await signInWithGoogleOAuth();
      handleGoogleSuccess(profile);
    } catch (err) {
      console.error('[UNIMART] Google sign-in failed:', err);
      setIsGoogleLoading(false);
      const msg = err?.message || 'Google sign-in was cancelled.';
      setAlertInfo({
        type: msg.includes('cancel') ? 'info' : 'danger',
        message: msg,
      });
    }
  };

  useEffect(() => {
    // Initialize Google One Tap / Identity Services in the background
    initializeGoogleId(
      (profile) => {
        handleGoogleSuccess(profile);
      },
      (err) => {
        console.warn('[UNIMART] Google One Tap info:', err);
      }
    );
  }, []);

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
              className="btn btn-sm btn-light border rounded-pill px-3 fw-semibold text-muted d-none d-sm-inline-flex align-items-center gap-1 unimart-guest-btn"
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
        <div className="position-fixed top-0 start-50 translate-middle-x mt-4 z-3 shadow rounded-4 p-3 border unimart-guest-toast" style={{ maxWidth: '460px' }}>
          <div className="d-flex align-items-center gap-2">
            <span className="material-symbols-outlined text-success">check_circle</span>
            <span className="small fw-semibold unimart-guest-toast-text">Exploring UNIMART in guest mode. You can log in anytime to buy or list items!</span>
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
                src={currentWelcomeImg} 
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
                src={currentCampusImg} 
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
                    <button
                      type="button"
                      className="unimart-forgot-link"
                      onClick={openForgotPassword}
                    >
                      Forgot password?
                    </button>
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
              <span className="unimart-divider-badge px-2 text-muted small position-absolute top-50 start-50 translate-middle" style={{ fontSize: '0.75rem' }}>
                or
              </span>
            </div>

            {/* Google SSO */}
            <button
              type="button"
              className="unimart-sso-btn"
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading || isLoading}
            >
              {isGoogleLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm text-primary" role="status" aria-hidden="true"></span>
                  <span>Connecting with Google...</span>
                </>
              ) : (
                <>
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
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ================= FORGOT PASSWORD MODAL ================= */}
      {forgotOpen && (
        <div
          className="unimart-popup-overlay"
          onClick={(e) => { if (e.target === e.currentTarget) closeForgotPassword(); }}
        >
          <div className="unimart-popup-box unimart-forgot-box">
            {/* Close */}
            <button
              type="button"
              className="unimart-close-btn"
              onClick={closeForgotPassword}
              aria-label="Close"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
            </button>

            {/* Step indicator */}
            <div className="unimart-forgot-steps">
              {['email', 'otp', 'reset'].map((s, i) => (
                <div key={s} className={`unimart-forgot-step-dot ${forgotStep === s ? 'active' : (['otp','reset'].includes(forgotStep) && i === 0) || (forgotStep === 'reset' && i === 1) ? 'done' : ''}`}>
                  <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                    {((['otp','reset'].includes(forgotStep) && i === 0) || (forgotStep === 'reset' && i === 1)) ? 'check' : i === 0 ? 'mail' : i === 1 ? 'pin' : 'lock_reset'}
                  </span>
                </div>
              ))}
            </div>

            {/* Header */}
            <div className="text-center mb-3">
              <div className={`unimart-forgot-icon-circle mb-2 ${ forgotStep === 'otp' ? 'otp' : forgotStep === 'reset' ? 'reset' : '' }`}>
                <span className="material-symbols-outlined" style={{ fontSize: '26px' }}>
                  {forgotStep === 'email' ? 'lock_person' : forgotStep === 'otp' ? 'mark_email_read' : 'lock_reset'}
                </span>
              </div>
              <h5 className="fw-bold mb-1" style={{ letterSpacing: '-0.02em', color: 'var(--unimart-text-dark)' }}>
                {forgotStep === 'email' && 'Forgot Password?'}
                {forgotStep === 'otp' && 'Enter OTP'}
                {forgotStep === 'reset' && 'Set New Password'}
              </h5>
              <p className="text-muted small mb-0" style={{ fontSize: '0.82rem' }}>
                {forgotStep === 'email' && "Enter your registered college email and we'll send you a 6-digit OTP."}
                {forgotStep === 'otp' && (
                  <>
                    OTP sent to <strong>{forgotEmail}</strong>.<br />
                    Valid for <strong>10 minutes</strong>.
                  </>
                )}
                {forgotStep === 'reset' && 'Choose a strong new password for your account.'}
              </p>
            </div>

            {/* Error / Success banners */}
            {forgotError && (
              <div className="unimart-forgot-alert error">
                <span className="material-symbols-outlined" style={{ fontSize: '17px' }}>error</span>
                <span>{forgotError}</span>
              </div>
            )}
            {forgotSuccess && (
              <div className="unimart-forgot-alert success">
                <span className="material-symbols-outlined" style={{ fontSize: '17px' }}>check_circle</span>
                <span>{forgotSuccess}</span>
              </div>
            )}

            {/* Demo mode OTP banner */}
            {simulatedOtp && forgotStep === 'otp' && (
              <div className="unimart-forgot-alert demo">
                <span className="material-symbols-outlined" style={{ fontSize: '17px' }}>science</span>
                <span>
                  <strong>Demo mode:</strong> Your OTP is{' '}
                  <span className="unimart-otp-demo-code">{simulatedOtp}</span>
                  <br />
                  <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>Configure EmailJS in src/lib/emailService.js to send real emails.</span>
                </span>
              </div>
            )}

            {/* ── STEP 1: Email ── */}
            {forgotStep === 'email' && !forgotSuccess && (
              <form onSubmit={handleForgotEmailSubmit} noValidate>
                <div className="mb-3">
                  <label className="form-label small fw-semibold text-dark mb-1">
                    Registered College Email <span className="text-danger">*</span>
                  </label>
                  <div className="unimart-input-group">
                    <input
                      type="email"
                      required
                      autoFocus
                      className="unimart-form-field"
                      placeholder="student@chitkara.edu.in"
                      value={forgotEmail}
                      onChange={(e) => { setForgotEmail(e.target.value); setForgotError(''); }}
                    />
                    <span className="material-symbols-outlined unimart-input-icon">mail</span>
                  </div>
                </div>
                <button
                  type="submit"
                  className="unimart-register-pill-btn w-100"
                  disabled={forgotLoading}
                >
                  {forgotLoading ? (
                    <><span className="spinner-border spinner-border-sm text-white" role="status"></span><span>Sending OTP...</span></>
                  ) : (
                    <><span>Send OTP to Email</span><span className="material-symbols-outlined" style={{ fontSize: '18px' }}>send</span></>
                  )}
                </button>
                <button
                  type="button"
                  className="unimart-forgot-back-btn mt-2"
                  onClick={() => { closeForgotPassword(); openAuth('login'); }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_back</span>
                  Back to Sign In
                </button>
              </form>
            )}

            {/* ── STEP 2: OTP ── */}
            {forgotStep === 'otp' && !forgotSuccess && (
              <form onSubmit={handleOtpSubmit} noValidate>
                <div className="mb-3">
                  <label className="form-label small fw-semibold text-dark mb-2 d-block text-center">
                    Enter the 6-digit OTP
                  </label>
                  <div className="unimart-otp-boxes" onPaste={handleOtpPaste}>
                    {otpInputs.map((val, i) => (
                      <input
                        key={i}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        className={`unimart-otp-box ${val ? 'filled' : ''}`}
                        value={val}
                        ref={(el) => { otpInputRefs.current[i] = el; }}
                        onChange={(e) => handleOtpInput(i, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                        autoFocus={i === 0}
                      />
                    ))}
                  </div>
                </div>
                <button
                  type="submit"
                  className="unimart-register-pill-btn w-100"
                >
                  <span>Verify OTP</span>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>verified</span>
                </button>
                <button
                  type="button"
                  className="unimart-forgot-back-btn mt-2"
                  onClick={() => { setForgotStep('email'); setForgotError(''); setOtpInputs(['','','','','','']); }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_back</span>
                  Resend OTP
                </button>
              </form>
            )}

            {/* ── STEP 3: New Password ── */}
            {forgotStep === 'reset' && !forgotSuccess && (
              <form onSubmit={handleResetPasswordSubmit} noValidate>
                <div className="mb-3">
                  <label className="form-label small fw-semibold text-dark mb-1">
                    New Password <span className="text-danger">*</span>
                  </label>
                  <div className="unimart-input-group">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      autoFocus
                      className="unimart-form-field"
                      placeholder="At least 6 characters"
                      value={newPassword}
                      onChange={(e) => { setNewPassword(e.target.value); setForgotError(''); }}
                    />
                    <span className="material-symbols-outlined unimart-input-icon">lock</span>
                    <button
                      type="button"
                      className="unimart-input-toggle"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      title={showNewPassword ? 'Hide' : 'Show'}
                    >
                      <span className="material-symbols-outlined">{showNewPassword ? 'visibility_off' : 'visibility'}</span>
                    </button>
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-semibold text-dark mb-1">
                    Confirm New Password <span className="text-danger">*</span>
                  </label>
                  <div className="unimart-input-group">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      className="unimart-form-field"
                      placeholder="Repeat new password"
                      value={confirmNewPassword}
                      onChange={(e) => { setConfirmNewPassword(e.target.value); setForgotError(''); }}
                    />
                    <span className="material-symbols-outlined unimart-input-icon">lock_reset</span>
                  </div>
                </div>
                <button
                  type="submit"
                  className="unimart-register-pill-btn w-100"
                  disabled={forgotLoading}
                >
                  {forgotLoading ? (
                    <><span className="spinner-border spinner-border-sm text-white" role="status"></span><span>Resetting...</span></>
                  ) : (
                    <><span>Reset Password</span><span className="material-symbols-outlined" style={{ fontSize: '18px' }}>check_circle</span></>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
