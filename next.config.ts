/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "via.placeholder.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "motef.com.ar",
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "motef.com.ar",
        pathname: "/temp/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "3000",
        pathname: "/uploads/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "3000",
        pathname: "/temp/**",
      },
    ],
    formats: ["image/webp", "image/avif"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: false,
    unoptimized: false,
  },

  async headers() {
    return [
      {
        source: "/uploads/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
          {
            key: "Access-Control-Allow-Origin",
            value: "*",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET",
          },
        ],
      },
      {
        source: "/temp/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=3600", 
          },
          {
            key: "Access-Control-Allow-Origin",
            value: "*",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET",
          },
        ],
      },
      {
        source: "/img/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/(favicon.ico|WhatsApp.svg|manifest.json|apple-icon.png)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400",
          },
        ],
      },
    ];
  },

  async rewrites() {
    return [
       {
        source: "/temp/uploads/:path*",
        destination: "/api/serve-temp/:path*",
      },
    ];
  },

  experimental: {
    optimizePackageImports: ["lucide-react", "@heroicons/react"],
  },

  compress: true,

  logging: {
    fetches: {
      fullUrl: process.env.NODE_ENV === "development", // ✅ Solo en desarrollo
    },
  },

  // ✅ AGREGADO: Configuración adicional para archivos estáticos
  trailingSlash: false,

  // ✅ AGREGADO: Configuración de output para diferentes entornos
  ...(process.env.NODE_ENV === "production" && {
    output: "standalone",
  }),
};

export default nextConfig;
