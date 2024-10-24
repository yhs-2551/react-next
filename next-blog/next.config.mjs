/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,  // Strict Mode 비활성화
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'iceamericano-blog-storage.s3.ap-northeast-2.amazonaws.com',
                port: '',
                pathname: '/final/images/**',
            },
            {
                protocol: 'https',
                hostname: 'iceamericano-blog-storage.s3.ap-northeast-2.amazonaws.com',
                port: '',
                pathname: '/final/files/**',
            },
            {
                protocol: 'https',
                hostname: 'iceamericano-blog-storage.s3.ap-northeast-2.amazonaws.com',
                port: '',
                pathname: '/final/featured/**',
            },
            {
                protocol: 'https',
                hostname: 'iceamericano-blog-storage.s3.ap-northeast-2.amazonaws.com',
                port: '',
                pathname: '/temp/images/**',
            },
            {
                protocol: 'https',
                hostname: 'iceamericano-blog-storage.s3.ap-northeast-2.amazonaws.com',
                port: '',
                pathname: '/temp/files/**',
            },
            {
                protocol: 'https',
                hostname: 'iceamericano-blog-storage.s3.ap-northeast-2.amazonaws.com',
                port: '',
                pathname: '/temp/featured/**',
            },
            {
                protocol: 'https',
                hostname: 'iceamericano-blog-storage.s3.ap-northeast-2.amazonaws.com',
                port: '',
                pathname: '/default/**',
            },
        ],
      },
};

export default nextConfig;
