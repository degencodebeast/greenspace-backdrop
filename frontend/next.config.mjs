/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "assets-global.website-files.com",
        port: "",
        pathname: "**",
      },
    ],
  },
};

export default nextConfig;
