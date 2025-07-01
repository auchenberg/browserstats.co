import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    // Exclude server-side packages from client bundle
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        path: false,
        os: false,
        stream: false,
        http: false,
        https: false,
        url: false,
        child_process: false,
      };
      
      // Exclude playwright and stagehand from client bundle
      config.externals = [
        ...(config.externals || []),
        '@browserbasehq/stagehand',
        'playwright',
        'playwright-core'
      ];
    }
    
    return config;
  },
  // Experimental features for better performance
  experimental: {
    optimizePackageImports: ['@browserbasehq/stagehand']
  }
};

export default nextConfig;
