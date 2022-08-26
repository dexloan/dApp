/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizeFonts: true,
    modern: true,
  },
  images: {
    domains: [
      "arweave.net",
      "www.arweave.net",
      "chickentribe.s3.us-west-2.amazonaws.com",
    ],
  },
  reactStrictMode: true,
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });

    return config;
  },
};

module.exports = nextConfig;
