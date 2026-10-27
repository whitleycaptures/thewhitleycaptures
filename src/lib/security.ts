// Same-origin framing preserves the embedded Studio's draft preview.
// This deliberately does not restrict scripts: Next, Studio and Session need
// a separately tested nonce-based policy before script-src can be enforced.
export const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  {
    key: 'Content-Security-Policy',
    value: "frame-ancestors 'self'; object-src 'none'; base-uri 'self'",
  },
];
