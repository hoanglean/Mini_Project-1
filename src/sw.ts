/// <reference lib="webworker" />
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import { CacheFirst, NetworkFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { clientsClaim } from 'workbox-core';

declare const self: ServiceWorkerGlobalScope;

// Force immediate activation
self.skipWaiting();
clientsClaim();

// Cleanup old caches
cleanupOutdatedCaches();

// Precache App Shell assets injected by vite-plugin-pwa
precacheAndRoute(self.__WB_MANIFEST || []);

// 1. Fonts Cache (Cache-First)
registerRoute(
  ({ request }) => request.destination === 'font' || /\.(?:woff2?|ttf|otf|eot)$/i.test(request.url),
  new CacheFirst({
    cacheName: 'vku-fonts-cache',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({
        maxEntries: 20,
        maxAgeSeconds: 180 * 24 * 60 * 60, // 180 days
      }),
    ],
  })
);

// 2. Images Cache (Cache-First)
registerRoute(
  ({ request }) => request.destination === 'image' || /\.(?:png|jpg|jpeg|svg|gif|webp)$/i.test(request.url),
  new CacheFirst({
    cacheName: 'vku-images-cache',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
      }),
    ],
  })
);

// 3. Navigation Route / App Shell Fallback (Network-First with Cache Fallback for offline start < 1s)
const navigationRoute = new NavigationRoute(
  new NetworkFirst({
    cacheName: 'vku-navigation-cache',
    networkTimeoutSeconds: 3,
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
    ],
  }),
  {
    allowlist: [/^\//],
  }
);
registerRoute(navigationRoute);

// Listen to skip waiting message
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
