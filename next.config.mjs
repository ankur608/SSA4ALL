/** @type {import('next').NextConfig} */

// Automatically configure subpath when deploying through GitHub Actions
const isGithubActions = process.env.GITHUB_ACTIONS || false;
let repoName = '';
if (isGithubActions && process.env.GITHUB_REPOSITORY) {
  repoName = process.env.GITHUB_REPOSITORY.split('/')[1] || '';
}

const nextConfig = {
  output: 'export',
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || (repoName ? `/${repoName}` : ''),
  assetPrefix: process.env.NEXT_PUBLIC_BASE_PATH ? `${process.env.NEXT_PUBLIC_BASE_PATH}/` : (repoName ? `/${repoName}/` : ''),
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  reactStrictMode: false,
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },
};

export default nextConfig;
