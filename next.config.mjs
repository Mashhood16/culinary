/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Whitelist external domains so Next.js is authorized to render and optimize them
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com', // Securely allows Vercel Blob storage images
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com', // Authorizes loading optimized images from your Cloudinary account
      },
    ],
  },
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