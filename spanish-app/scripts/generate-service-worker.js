const { generateSW } = require('workbox-build');

async function generateServiceWorker() {
  const { count, size, warnings } = await generateSW({
    globDirectory: 'build',
    globPatterns: ['**/*'],
    globIgnores: [
      '**/*.map',
      'service-worker.js',
      'workbox-*.js'
    ],
    swDest: 'build/service-worker.js',
    clientsClaim: true,
    cleanupOutdatedCaches: true,
    skipWaiting: false,
    navigateFallback: '/index.html',
    maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/fonts\.googleapis\.com\//,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'masblo-google-font-styles'
        }
      },
      {
        urlPattern: /^https:\/\/fonts\.gstatic\.com\//,
        handler: 'CacheFirst',
        options: {
          cacheName: 'masblo-google-font-files',
          expiration: {
            maxEntries: 20,
            maxAgeSeconds: 60 * 60 * 24 * 365
          },
          cacheableResponse: {
            statuses: [0, 200]
          }
        }
      }
    ]
  });

  warnings.forEach((warning) => console.warn(warning));
  console.log(`Generated offline service worker with ${count} files (${size} bytes).`);
}

generateServiceWorker().catch((error) => {
  console.error('Unable to generate the offline service worker:', error);
  process.exit(1);
});
