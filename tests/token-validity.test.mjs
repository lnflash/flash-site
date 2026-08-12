// Run with: node --test tests/token-validity.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { formatTokenValidity } = require('../js/modules/token-validity.js');

test('1-hour token (prod today) is not described as 24 hours', () => {
  const msg = formatTokenValidity(3600);
  assert.equal(msg, 'This token is valid for approximately 1 hour more.');
  assert.ok(!msg.includes('24 hours'));
});

test('24-hour token (after kotc-server#19) reports 24 hours', () => {
  assert.equal(
    formatTokenValidity(86400),
    'This token is valid for approximately 24 hours more.'
  );
});

test('idempotently reissued token reports remaining time, not full lifetime', () => {
  // e.g. R2 reissue path returns an existing token with ~4h left
  assert.equal(
    formatTokenValidity(4 * 3600),
    'This token is valid for approximately 4 hours more.'
  );
});

test('sub-hour remainder is reported in minutes', () => {
  assert.equal(
    formatTokenValidity(1800),
    'This token is valid for approximately 30 minutes more.'
  );
  assert.equal(
    formatTokenValidity(30),
    'This token is valid for approximately 1 minute more.'
  );
});

test('numeric strings from PHP JSON are handled', () => {
  assert.equal(
    formatTokenValidity('3600'),
    'This token is valid for approximately 1 hour more.'
  );
});

test('missing or invalid expires_in falls back to the static 24-hour copy', () => {
  const fallback = 'This token is valid for 24 hours from the time it was generated.';
  assert.equal(formatTokenValidity(undefined), fallback);
  assert.equal(formatTokenValidity(null), fallback);
  assert.equal(formatTokenValidity('soon'), fallback);
  assert.equal(formatTokenValidity(NaN), fallback);
  assert.equal(formatTokenValidity(0), fallback);
  assert.equal(formatTokenValidity(-10), fallback);
});
