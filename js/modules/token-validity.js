// Formats the Stage 1 token validity line shown in the treasure-hunt console.
//
// The server response carries `expires_in` (seconds remaining), so the copy is
// derived from what the server actually says rather than hard-coding a TTL:
//  - a freshly minted token reports its real lifetime (1h today, 24h once the
//    server bumps it), and
//  - an idempotently reissued token reports the time it has LEFT, not the
//    lifetime it started with.
// The static 24-hour copy is kept only as a fallback for older server
// responses that omit `expires_in`.
(function (global) {
  'use strict';

  function formatTokenValidity(expiresInSeconds) {
    const seconds = Number(expiresInSeconds);
    if (!Number.isFinite(seconds) || seconds <= 0) {
      return 'This token is valid for 24 hours from the time it was generated.';
    }
    if (seconds < 3600) {
      const minutes = Math.max(1, Math.round(seconds / 60));
      return `This token is valid for approximately ${minutes} minute${minutes === 1 ? '' : 's'} more.`;
    }
    const hours = Math.round(seconds / 3600);
    return `This token is valid for approximately ${hours} hour${hours === 1 ? '' : 's'} more.`;
  }

  if (typeof module !== 'undefined' && module.exports) {
    // Node (tests)
    module.exports = { formatTokenValidity };
  } else {
    // Browser (plain <script> include)
    global.formatTokenValidity = formatTokenValidity;
  }
})(typeof window !== 'undefined' ? window : globalThis);
