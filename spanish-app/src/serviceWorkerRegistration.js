const UPDATE_EVENT = 'masblo-service-worker-update';

function notifyUpdate(registration) {
  window.dispatchEvent(new CustomEvent(UPDATE_EVENT, {
    detail: { registration }
  }));
}

async function registerServiceWorker() {
  const serviceWorkerUrl = `${process.env.PUBLIC_URL}/service-worker.js`;
  const registration = await navigator.serviceWorker.register(serviceWorkerUrl);

  if (registration.waiting) {
    notifyUpdate(registration);
  }

  registration.onupdatefound = () => {
    const installingWorker = registration.installing;
    if (!installingWorker) return;

    installingWorker.onstatechange = () => {
      if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
        notifyUpdate(registration);
      }
    };
  };
}

export function register() {
  if (process.env.NODE_ENV !== 'production' || !('serviceWorker' in navigator)) {
    return;
  }

  window.addEventListener('load', () => {
    registerServiceWorker().catch((error) => {
      console.error('Masblo offline support could not be enabled:', error);
    });
  });
}

export function activateUpdate(registration) {
  registration?.waiting?.postMessage({ type: 'SKIP_WAITING' });
}

export { UPDATE_EVENT };
