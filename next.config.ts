import type { NextConfig } from 'next';
const withPWA = require('@ducanh2912/next-pwa').default({
    dest: 'public',
    cacheOnFrontendNav: true,
    aggressiveFrontEndNavCaching: true,
    reloadOnline: true,
    swcMinify: true,
    disable: false,
    workboxOptions: {
        disableDevLogs: true
    }
});

const nextConfig: NextConfig = {
    reactStrictMode: false,
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**.blob.core.windows.net', // ✅ wildcard must include subdomains correctly
                pathname: '**' // ✅ allow all paths
            }
        ]
    }
};

export default withPWA(nextConfig);
