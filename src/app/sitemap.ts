import type { MetadataRoute } from 'next';
import styles from '@/data/styles.json';
import layouts from '@/data/layouts.json';

const BASE_URL = 'https://zgnal.ai';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
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

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'weekly' : 'monthly',
    priority: route === '' ? 1 : 0.7,
  }));

  const styleEntries: MetadataRoute.Sitemap = styles.map((style) => ({
    url: `${BASE_URL}/styles/${style.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  const layoutEntries: MetadataRoute.Sitemap = layouts.map((layout) => ({
    url: `${BASE_URL}/layouts/${layout.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  return [...staticEntries, ...styleEntries, ...layoutEntries];
}
