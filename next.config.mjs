import createNextIntlPlugin from 'next-intl/plugin';
 
const withNextIntl = createNextIntlPlugin();
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // Enable static export
  trailingSlash: true, // Ensures correct routing
  images: {
    unoptimized: true, // Fix issues with Next.js images in static export
  },
    async rewrites() {
      return [
        {
          source: '/api/auth/:path*',  // Exclude NextAuth routes from rewrite
          destination: '/api/auth/:path*',
        },
        {
          source: '/api/:path*',
          destination: 'http://localhost:5000/api/:path*' // Backend port
        },

      ];
    },
    eslint: {
      ignoreDuringBuilds: true,
    },
  };
  
  export default withNextIntl(nextConfig);
  