// Pure decision logic for the invite pre-check on /invite.
// Loaded by invite/index.html; also importable from Node for tests
// (run: node --test invite/precheck.test.js).
//
// Given the parsed GraphQL response body from the invitePreview query,
// classify what the page should do. The design is fail-open: anything
// that isn't a definitive verdict about THIS token falls through to the
// deep link, because the app re-validates the token when it redeems.
//
// Returns one of:
//   'invalid-token'   — the resolver itself rejected the token (hard-fail)
//   'expired'         — token found, past its expiry (hard-fail with message)
//   'used-or-revoked' — token found, not expired, but not valid (hand off to app)
//   'proceed'         — valid token, or any non-definitive error (fail open)
function classifyInvitePreview(data, now) {
    const preview = data && data.data && data.data.invitePreview;

    // Only a resolver-level error on the invitePreview field is a definitive
    // "this token does not exist" verdict. Live prod behavior (verified
    // 2026-09-01): token errors carry path: ["invitePreview"], while
    // transport/validation errors (schema drift, GRAPHQL_VALIDATION_FAILED,
    // rate limits, 500s) carry no path — those must fail open, not tell the
    // invitee their valid link is broken.
    const tokenErr = Array.isArray(data && data.errors) &&
        data.errors.some(e => Array.isArray(e && e.path) && e.path[0] === 'invitePreview');
    if (tokenErr && !preview) return 'invalid-token';

    if (preview && !preview.isValid) {
        // The InvitePreview schema exposes no status/reason enum (confirmed
        // via introspection 2026-09-01: contact, expiresAt, inviterUsername,
        // isValid, method) — so expired-vs-used is reconstructed from
        // expiresAt against the client clock. A skewed device clock can
        // misclassify, but both branches are recoverable.
        const expired = preview.expiresAt && new Date(preview.expiresAt) < (now || new Date());
        return expired ? 'expired' : 'used-or-revoked';
    }

    return 'proceed';
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { classifyInvitePreview };
}
