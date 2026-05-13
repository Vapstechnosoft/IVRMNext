import type { NextConfig } from 'next';
const withPWA = require('@ducanh2912/next-pwa').default({
    dest: 'public',
    cacheOnFrontendNav: true,
    aggressiveFrontEndNavCaching: true,
    reloadOnline: true,
    swcMinify: true,
    disable: true, // Disable PWA features for now to avoid build issues in production
    workboxOptions: {
        disableDevLogs: true
    }
});

const nextConfig: NextConfig = {
    reactStrictMode: false,
    //Added below line productionBrowserSourceMaps do reduce build space
    productionBrowserSourceMaps: false,
    eslint: {
        ignoreDuringBuilds: true
    },
    typescript: {
        ignoreBuildErrors: true
    },
    experimental: {
        serverActions: {
            bodySizeLimit: '500mb'
        }
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**.blob.core.windows.net', // ✅ wildcard must include subdomains correctly
                pathname: '**' // ✅ allow all paths
            }
        ]
    },
    async rewrites() {
        return [
            {
                source: '/api/admission/:path*',
                destination: 'https://ivrm-dev-admission-api.azurewebsites.net/api/:path*'
            }
            // Add other services if needed
        ];
    }
};

export default nextConfig; // Temporarily removed PWA wrapper for production stability
