/** @type {import('next').NextConfig} */
const gatewayUrl = process.env.GATEWAY_URL || 'http://127.0.0.1:8080';

const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/actuator/:path*',
        destination: `${gatewayUrl}/actuator/:path*`,
      },
      {
        source: '/api/v1/:path*',
        destination: `${gatewayUrl}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
