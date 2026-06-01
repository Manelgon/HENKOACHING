import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Activa el MCP server en /_next/mcp (Next.js 16+)
  experimental: {
    mcpServer: true,
  },
  // TipTap/ProseMirror necesita transpilación explícita con Turbopack
  transpilePackages: [
    '@tiptap/core',
    '@tiptap/react',
    '@tiptap/starter-kit',
    '@tiptap/extension-image',
    '@tiptap/extension-link',
    '@tiptap/extension-placeholder',
    '@tiptap/extension-typography',
  ],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'cardgrqwqktjsssodtzp.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
}

export default nextConfig
