/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY', // Stops clickjacking
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff', // Stops MIME-sniffing
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin', // Secures outbound referrers
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()', // Restricts device access
          },
        ],
      },
    ];
  },
};

export default nextConfig;