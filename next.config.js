/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
}

const config = {
  webpack(config, { isServer, dev }) {
    config.experiments = {
      asyncWebAssembly: true,
      layers: true,
    };

    return config;
  },
};

module.exports = nextConfig
module.exports = config
