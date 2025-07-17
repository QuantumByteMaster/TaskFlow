/** @type {import('next').NextConfig} */
const nextConfig = {
  rewrites: async () => {
    return [
      {
        source: "/api/:path*",
        destination: "https://task-flow-backend.onrender.com/api/:path*",
      },
    ];
  },
};

export default nextConfig;
