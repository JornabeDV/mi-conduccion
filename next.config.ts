import type { NextConfig } from "next";
import withPWA from "@ducanh2912/next-pwa";

const nextConfig: NextConfig = {
  /* config options here */
};

const isDev = process.env.NODE_ENV === "development";

const withPWAConfig = withPWA({
  dest: "public",
  register: true,
  disable: isDev,
});

export default isDev ? nextConfig : withPWAConfig(nextConfig);
