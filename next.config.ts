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
                hostname: 'trackandtraceapp.blob.core.windows.net',
                pathname: '/logo/**' // Allows images under /logo
            },
            {
                protocol: 'https',
                hostname: 'trackandtraceapp.blob.core.windows.net',
                pathname: '/trackandtracedev/**' // Allows images under /trackandtracedev
            }
        ]
    }
};

export default withPWA(nextConfig);
