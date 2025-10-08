/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    WHOP_API_KEY: process.env.WHOP_API_KEY,
    WHOP_CLIENT_ID: process.env.WHOP_CLIENT_ID,
    WHOP_CLIENT_SECRET: process.env.WHOP_CLIENT_SECRET,
    WHOP_REDIRECT_URI: process.env.WHOP_REDIRECT_URI,
    WHOP_WEBHOOK_SECRET: process.env.WHOP_WEBHOOK_SECRET,
  },
}

module.exports = nextConfig