import type { NextConfig } from "next";

const repositoryName = "puerto-4-0-tabletop";
const basePath =
  process.env.NODE_ENV === "production" ? `/${repositoryName}` : "";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath,
  assetPrefix: basePath,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
