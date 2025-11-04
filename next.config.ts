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
                hostname: 'app.blob.core.windows.net',
                pathname: '/logo/**' // Allows images under /logo
            },
            {
                protocol: 'https',
                hostname: 'app.blob.core.windows.net',
                pathname: '/trackandtracedev/**' // Allows images under /trackandtracedev
            },
            {
                protocol: 'https',
                hostname: 'kusumadata.blob.core.windows.net',
                pathname: '/files/**' // Allows images under /files
            }
        ]
    }
};

export default withPWA(nextConfig);
