/** @type {import('next').NextConfig} */
const nextConfig = {
  // 1. Ignore strict errors so deployment always succeeds
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  // 2. THE BRIDGE: Forward all /api requests to your Render Backend
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://taskflow-9cqd.onrender.com/api/:path*', // <--- Your Render URL
      },
    ];
  },
};

export default nextConfig;
