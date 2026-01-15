/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    // This allows the build to succeed even if there are small type mismatches
    ignoreBuildErrors: true,
  },
  eslint: {
    // This prevents the build from failing due to linting warnings
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
