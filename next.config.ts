import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    domains: [
      'upload.wikimedia.org',
      'images.unsplash.com',
      'firebasestorage.googleapis.com',
      'lh3.googleusercontent.com', // Para imagens de perfil do Google
      'localhost' // Para desenvolvimento local
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.imgur.com',
      },
    ],
  },
};

export default nextConfig;
