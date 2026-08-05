// Custom Service Worker script for Web Push Notifications
// Injected into VitePWA Service Worker build

self.addEventListener('push', function (event) {
  if (!event.data) {
    console.log('[Service Worker] Push event received with no payload.');
    return;
  }

  try {
    const data = event.data.json();
    console.log('[Service Worker] Push event received:', data);

    const title = data.title || 'SchoolIQ Notification';
    const options = {
      body: data.body || 'You have a new update in SchoolIQ.',
      icon: data.icon || '/schooliq.jpeg',
      badge: data.badge || '/schooliq.jpeg',
      vibrate: [100, 50, 100],
      data: {
        url: data.data && data.data.url ? data.data.url : '/notifications',
        id: data.data && data.data.id ? data.data.id : null,
      },
      tag: 'schooliq-notification-' + (data.data && data.data.id ? data.data.id : Date.now()),
      renotify: true,
    };

    event.waitUntil(
      self.registration.showNotification(title, options)
    );
  } catch (err) {
    console.error('[Service Worker] Push event processing error:', err);
    // Fallback for non-JSON push payload
    const text = event.data.text();
    event.waitUntil(
      self.registration.showNotification('SchoolIQ Notification', {
        body: text,
        icon: '/schooliq.jpeg',
      })
    );
  }
});

self.addEventListener('notificationclick', function (event) {
  console.log('[Service Worker] Notification click received:', event.notification);
  event.notification.close();

  const targetUrl = (event.notification.data && event.notification.data.url) || '/notifications';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
      // If a tab is already open, focus it and navigate
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if ('focus' in client) {
          if (client.url.includes(self.location.origin)) {
            client.focus();
            if ('navigate' in client && targetUrl) {
              client.navigate(targetUrl);
            }
            return;
          }
        }
      }
      // Otherwise open a new tab/window to the target URL
      if (clients.openWindow) {
        const fullUrl = new URL(targetUrl, self.location.origin).href;
        return clients.openWindow(fullUrl);
      }
    })
  );
});
