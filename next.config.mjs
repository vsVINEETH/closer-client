import createNextIntlPlugin from 'next-intl/plugin';
 
const withNextIntl = createNextIntlPlugin();
/** @type {import('next').NextConfig} */
const nextConfig = {
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
  