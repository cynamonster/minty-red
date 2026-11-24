// Anonymous Client Identity & Session Manager
// Cookie-free, privacy-first user and session identification for DAU / WAU / MAU tracking.

const STORAGE_KEY_UID = 'minty_anon_uid';
const STORAGE_KEY_FIRST_SEEN = 'minty_first_seen';
const STORAGE_KEY_LAST_SEEN = 'minty_last_seen';
const STORAGE_KEY_SESSION_COUNT = 'minty_session_count';
const SESSION_STORAGE_KEY_SID = 'minty_session_id';
const SESSION_STORAGE_KEY_EXPIRY = 'minty_session_expiry';

// 30 minutes of inactivity rolls into a new session
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;

function generateUUID() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Returns a stable, anonymous device UUID stored in localStorage.
 * Does not track any personal identity or cross-site data.
 */
export function getAnonymousUserId() {
  if (typeof window === 'undefined') return 'server_render';

  try {
    let uid = localStorage.getItem(STORAGE_KEY_UID);
    if (!uid) {
      uid = generateUUID();
      localStorage.setItem(STORAGE_KEY_UID, uid);
      localStorage.setItem(STORAGE_KEY_FIRST_SEEN, Date.now().toString());
      localStorage.setItem(STORAGE_KEY_SESSION_COUNT, '1');
    }
    return uid;
  } catch (err) {
    return 'ephemeral_' + generateUUID().slice(0, 8);
  }
}

/**
 * Returns or renews an anonymous session ID based on 30m idle timeout.
 */
export function getSessionId() {
  if (typeof window === 'undefined') return 'server_session';

  try {
    const now = Date.now();
    const storedExpiry = sessionStorage.getItem(SESSION_STORAGE_KEY_EXPIRY);
    let sid = sessionStorage.getItem(SESSION_STORAGE_KEY_SID);

    if (!sid || !storedExpiry || now > parseInt(storedExpiry, 10)) {
      sid = 's_' + generateUUID().slice(0, 12);
      sessionStorage.setItem(SESSION_STORAGE_KEY_SID, sid);

      // Increment persistent session counter
      const prevCount = parseInt(localStorage.getItem(STORAGE_KEY_SESSION_COUNT) || '0', 10);
      localStorage.setItem(STORAGE_KEY_SESSION_COUNT, (prevCount + 1).toString());
    }

    // Refresh sliding window expiry
    sessionStorage.setItem(SESSION_STORAGE_KEY_EXPIRY, (now + SESSION_TIMEOUT_MS).toString());
    localStorage.setItem(STORAGE_KEY_LAST_SEEN, now.toString());

    return sid;
  } catch {
    return 'fallback_session';
  }
}

/**
 * Returns anonymous cohort metadata for segmentation.
 */
export function getAnonymousUserMetadata() {
  if (typeof window === 'undefined') {
    return {
      userId: 'server',
      sessionId: 'server',
      sessionCount: 1,
      isNewUser: false,
      daysSinceFirstSeen: 0,
    };
  }

  try {
    const userId = getAnonymousUserId();
    const sessionId = getSessionId();
    const firstSeen = parseInt(localStorage.getItem(STORAGE_KEY_FIRST_SEEN) || Date.now().toString(), 10);
    const sessionCount = parseInt(localStorage.getItem(STORAGE_KEY_SESSION_COUNT) || '1', 10);
    const daysSinceFirstSeen = Math.floor((Date.now() - firstSeen) / (1000 * 60 * 60 * 24));

    return {
      userId,
      sessionId,
      sessionCount,
      isNewUser: sessionCount <= 1 && daysSinceFirstSeen === 0,
      daysSinceFirstSeen,
    };
  } catch {
    return {
      userId: 'ephemeral',
      sessionId: 'ephemeral',
      sessionCount: 1,
      isNewUser: true,
      daysSinceFirstSeen: 0,
    };
  }
}
