// Tests for the invite pre-check decision logic.
// Run with: node --test invite/precheck.test.js
const test = require('node:test');
const assert = require('node:assert/strict');
const { classifyInvitePreview } = require('./precheck.js');

const NOW = new Date('2026-09-01T12:00:00Z');
const PAST = '2026-08-01T00:00:00Z';
const FUTURE = '2026-10-01T00:00:00Z';

test('valid token proceeds to deep link', () => {
    const data = { data: { invitePreview: { isValid: true, expiresAt: FUTURE } } };
    assert.equal(classifyInvitePreview(data, NOW), 'proceed');
});

test('resolver-level token error (path: ["invitePreview"]) hard-fails as invalid', () => {
    const data = {
        data: { invitePreview: null },
        errors: [{ message: 'Invite not found', path: ['invitePreview'] }]
    };
    assert.equal(classifyInvitePreview(data, NOW), 'invalid-token');
});

test('validation error with no path fails open (schema drift must not invalidate real links)', () => {
    // The exact incident class the PR fixes: GRAPHQL_VALIDATION_FAILED
    // (e.g. invitePreview renamed/removed) carries no path.
    const data = {
        errors: [{
            message: 'Cannot query field "invitePreview" on type "Query".',
            extensions: { code: 'GRAPHQL_VALIDATION_FAILED' }
        }]
    };
    assert.equal(classifyInvitePreview(data, NOW), 'proceed');
});

test('transient resolver 500 / rate-limit style error without invitePreview path fails open', () => {
    const data = {
        data: null,
        errors: [{ message: 'Internal server error' }]
    };
    assert.equal(classifyInvitePreview(data, NOW), 'proceed');
});

test('error on an unrelated field fails open', () => {
    const data = {
        data: { invitePreview: null },
        errors: [{ message: 'boom', path: ['somethingElse'] }]
    };
    assert.equal(classifyInvitePreview(data, NOW), 'proceed');
});

test('token error alongside a returned preview does not hard-fail', () => {
    const data = {
        data: { invitePreview: { isValid: true, expiresAt: FUTURE } },
        errors: [{ message: 'partial', path: ['invitePreview', 'inviterUsername'] }]
    };
    assert.equal(classifyInvitePreview(data, NOW), 'proceed');
});

test('found but invalid and past expiry classifies as expired', () => {
    const data = { data: { invitePreview: { isValid: false, expiresAt: PAST } } };
    assert.equal(classifyInvitePreview(data, NOW), 'expired');
});

test('found but invalid and not expired classifies as used-or-revoked', () => {
    const data = { data: { invitePreview: { isValid: false, expiresAt: FUTURE } } };
    assert.equal(classifyInvitePreview(data, NOW), 'used-or-revoked');
});

test('invalid with missing expiresAt classifies as used-or-revoked (no false expiry)', () => {
    const data = { data: { invitePreview: { isValid: false, expiresAt: null } } };
    assert.equal(classifyInvitePreview(data, NOW), 'used-or-revoked');
});

test('empty / malformed body fails open', () => {
    assert.equal(classifyInvitePreview({}, NOW), 'proceed');
    assert.equal(classifyInvitePreview(null, NOW), 'proceed');
    assert.equal(classifyInvitePreview({ errors: 'not-an-array' }, NOW), 'proceed');
});
