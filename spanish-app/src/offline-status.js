import { useEffect, useState } from 'react';
import { activateUpdate, UPDATE_EVENT } from './serviceWorkerRegistration';

export default function OfflineStatus() {
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);
  const [updateRegistration, setUpdateRegistration] = useState(null);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    const handleUpdate = (event) => setUpdateRegistration(event.detail.registration);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener(UPDATE_EVENT, handleUpdate);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener(UPDATE_EVENT, handleUpdate);
    };
  }, []);

  function installUpdate() {
    let isRefreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (isRefreshing) return;
      isRefreshing = true;
      window.location.reload();
    }, { once: true });
    activateUpdate(updateRegistration);
  }

  if (isOnline && !updateRegistration) return null;

  return (
    <div className={`offline-status${isOnline ? ' update-ready' : ''}`} role="status">
      <span>
        {isOnline
          ? 'A new version of Masblo is ready.'
          : 'Offline mode: downloaded lessons and progress are still available.'}
      </span>
      {updateRegistration && (
        <button type="button" onClick={installUpdate}>
          Update
        </button>
      )}
    </div>
  );
}
