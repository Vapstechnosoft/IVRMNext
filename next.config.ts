import type { NextConfig } from 'next';

// Automatically ensure Groq keys have the gsk_ prefix at runtime
const groqEnv: Record<string, string> = {};
for (const [key, value] of Object.entries(process.env)) {
    if (key.toLowerCase().includes('groq') && typeof value === 'string' && value.trim().length > 0) {
        const trimmed = value.trim().replace(/^["']|["']$/g, '');
        const formatted = trimmed.startsWith('gsk_') ? trimmed : `gsk_${trimmed}`;
        process.env[key] = formatted;
        groqEnv[key] = formatted;
    }
}

const nextConfig: NextConfig = {
    env: groqEnv,
    output: 'standalone',

    reactStrictMode: false,
    productionBrowserSourceMaps: false,

    eslint: {
        ignoreDuringBuilds: true
    },

    typescript: {
        ignoreBuildErrors: true
    },

    experimental: {
        optimizePackageImports: [
            'lucide-react',
            'react-icons',
            'date-fns',
            'recharts',
            'chart.js',
            '@radix-ui/react-icons',
            'framer-motion'
        ],
        serverActions: {
            bodySizeLimit: '500mb'
        }
    },

    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'dcampusstrg.blob.core.windows.net',
                pathname: '/**'
            },
            {
                protocol: 'https',
                hostname: 'vapsclg.blob.core.windows.net',
                pathname: '/**'
            },
            {
                protocol: 'https',
                hostname: '*.blob.core.windows.net',
                pathname: '/**'
            }
        ]
    },

    async rewrites() {
        return [
            {
                source: '/api/admission/:path*',
                destination: 'https://ivrm-dev-admission-api.azurewebsites.net/api/:path*'
            }
        ];
    }
};

export default nextConfig;
