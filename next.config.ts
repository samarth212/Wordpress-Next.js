const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: "/app",
  allowedDevOrigins: ["https://seedmoney.org", "http://localhost:3001"],
  outputFileTracingRoot: path.join(__dirname),
};

module.exports = nextConfig;
