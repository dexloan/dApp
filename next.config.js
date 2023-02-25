const dotenvExpand = require("dotenv-expand");
dotenvExpand.expand({ parsed: { ...process.env } });

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
      "bears-reloaded.web.app",
      "mnde-nft-api.mainnet-beta.marinade.finance",
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
