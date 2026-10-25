/**
 * Google Identity Services & OAuth2 helper for UNIMART
 *
 * Configured with Google Client ID:
 * 30099110138-dtj5si10sbbhon918iq1imohsqhf5mmt.apps.googleusercontent.com
 */

export const GOOGLE_CLIENT_ID =
  '30099110138-dtj5si10sbbhon918iq1imohsqhf5mmt.apps.googleusercontent.com';

/**
 * Ensures the official Google Identity Services script is loaded.
 */
export function loadGoogleIdentityScript() {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return reject(new Error('Window not available'));

    if (window.google?.accounts) {
      return resolve(window.google);
    }

    const SCRIPT_ID = 'unimart-google-gsi-script';
    let script = document.getElementById(SCRIPT_ID);

    if (!script) {
      script = document.createElement('script');
      script.id = SCRIPT_ID;
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }

    const handleLoad = () => {
      if (window.google?.accounts) {
        resolve(window.google);
      } else {
        reject(new Error('Google Identity Services loaded but accounts object missing.'));
      }
    };

    const handleError = () => {
      reject(new Error('Failed to load Google Identity Services script. Check your internet connection.'));
    };

    script.addEventListener('load', handleLoad, { once: true });
    script.addEventListener('error', handleError, { once: true });

    // Fallback timer if script was already attached
    setTimeout(() => {
      if (window.google?.accounts) {
        resolve(window.google);
      }
    }, 500);
  });
}

/**
 * Safely decodes a Google JWT credential (ID Token)
 */
export function decodeJwtToken(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (err) {
    console.error('[UNIMART] Failed to decode Google JWT:', err);
    return null;
  }
}

/**
 * Initiates the Google OAuth2 token popup flow using Google Identity Services.
 * Returns the authenticated user's profile info.
 */
export async function signInWithGoogleOAuth() {
  const google = await loadGoogleIdentityScript();

  return new Promise((resolve, reject) => {
    if (!google?.accounts?.oauth2) {
      return reject(new Error('Google OAuth2 client is unavailable. Please refresh and try again.'));
    }

    try {
      const client = google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: 'openid email profile',
        prompt: 'select_account',
        callback: async (tokenResponse) => {
          if (tokenResponse.error) {
            if (tokenResponse.error === 'access_denied') {
              return reject(new Error('Google Sign-In was cancelled.'));
            }
            return reject(
              new Error(
                tokenResponse.error_description ||
                `Google OAuth Error: ${tokenResponse.error}`
              )
            );
          }

          if (!tokenResponse.access_token) {
            return reject(new Error('No access token received from Google.'));
          }

          try {
            // Fetch user profile from Google UserInfo API
            const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
              headers: {
                Authorization: `Bearer ${tokenResponse.access_token}`,
              },
            });

            if (!response.ok) {
              throw new Error(`Failed to fetch Google profile (status ${response.status})`);
            }

            const profile = await response.json();
            resolve({
              email: profile.email,
              name: profile.name || profile.given_name || profile.email.split('@')[0],
              picture: profile.picture,
              sub: profile.sub,
              emailVerified: profile.email_verified,
            });
          } catch (fetchError) {
            reject(fetchError);
          }
        },
        error_callback: (nonOAuthError) => {
          console.error('[UNIMART] Google OAuth error:', nonOAuthError);
          reject(
            new Error(
              nonOAuthError?.message ||
              'Google Sign-In failed. Please verify that http://localhost:5173 is added to Authorized JavaScript Origins in Google Cloud Console.'
            )
          );
        },
      });

      // Launch the Google account selection popup
      client.requestAccessToken();
    } catch (err) {
      reject(err);
    }
  });
}

let googleIdInitialized = false;

/**
 * Initializes Google One Tap or native Google Sign-In prompt.
 */
export async function initializeGoogleId(onSuccess, onError) {
  if (googleIdInitialized) return;
  try {
    const google = await loadGoogleIdentityScript();
    if (!google?.accounts?.id) return;
    if (googleIdInitialized) return;

    google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      auto_select: false,
      cancel_on_tap_outside: true,
      callback: (credentialResponse) => {
        if (!credentialResponse?.credential) return;
        const decoded = decodeJwtToken(credentialResponse.credential);
        if (decoded && decoded.email) {
          onSuccess({
            email: decoded.email,
            name: decoded.name || decoded.email.split('@')[0],
            picture: decoded.picture,
            sub: decoded.sub,
            emailVerified: decoded.email_verified,
          });
        } else {
          onError && onError(new Error('Invalid Google credential payload'));
        }
      },
    });
    googleIdInitialized = true;
  } catch (e) {
    console.warn('[UNIMART] Google Identity Services init error:', e);
  }
}
