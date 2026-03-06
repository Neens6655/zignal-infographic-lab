import { URL } from 'url';

const PRIVATE_RANGES = [
  /^127\./,                    // 127.0.0.0/8
  /^10\./,                     // 10.0.0.0/8
  /^172\.(1[6-9]|2\d|3[01])\./, // 172.16.0.0/12
  /^192\.168\./,               // 192.168.0.0/16
  /^169\.254\./,               // 169.254.0.0/16 (link-local)
  /^0\./,                      // 0.0.0.0/8
];

const BLOCKED_HOSTS = [
  'localhost',
  '0.0.0.0',
  '[::1]',
  '[::0]',
  '[0000::1]',
];

/**
 * Returns true if the URL points to a private/internal network address.
 * Use before any server-side fetch to user-provided URLs.
 */
export function isPrivateUrl(input: string): boolean {
  try {
    const parsed = new URL(input);
    const hostname = parsed.hostname.toLowerCase();

    // Block known private hostnames
    if (BLOCKED_HOSTS.includes(hostname)) return true;

    // Block IPs in private ranges
    for (const range of PRIVATE_RANGES) {
      if (range.test(hostname)) return true;
    }

    // Block non-http(s) schemes
    if (!['http:', 'https:'].includes(parsed.protocol)) return true;

    return false;
  } catch {
    // Unparseable URL — block it
    return true;
  }
}
