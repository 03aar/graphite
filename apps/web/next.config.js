/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  transpilePackages: ['@leafit/ui', '@leafit/shared'],
  webpack: (config) => {
    // Fix for yjs
    config.externals = [...(config.externals || []), { bufferutil: 'bufferutil', 'utf-8-validate': 'utf-8-validate' }];

    // Fix for pdfjs
    config.resolve.alias = {
      ...config.resolve.alias,
      canvas: false,
    };

    return config;
  },
};

module.exports = nextConfig;
