import type { MetadataRoute } from 'next';

const BASE_URL = 'https://zgnal.ai';

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    '',
    '/about',
    '/docs',
    '/pricing',
    '/styles',
    '/contact',
    '/changelog',
    '/privacy',
    '/terms',
    '/chat',
  ];

  return routes.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'weekly' : 'monthly',
    priority: route === '' ? 1 : 0.7,
  }));
}
