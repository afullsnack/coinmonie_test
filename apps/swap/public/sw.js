const CACHE_NAME = "coinmonie-shell-v2";
const SHELL_ASSETS = [
	"/manifest.webmanifest",
	"/favicon.ico",
	"/icons/icon-192.png",
	"/icons/icon-512.png",
];

self.addEventListener("install", (event) => {
	event.waitUntil(
		caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_ASSETS)),
	);
	self.skipWaiting();
});

self.addEventListener("activate", (event) => {
	event.waitUntil(
		caches
			.keys()
			.then((keys) =>
				Promise.all(
					keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)),
				),
			)
			.then(() => self.clients.claim()),
	);
});

// Network-first, falls back to cached shell when offline.
self.addEventListener("fetch", (event) => {
	if (event.request.method !== "GET") return;

	const url = new URL(event.request.url);
	if (url.origin !== self.location.origin) return;

	event.respondWith(
		fetch(event.request)
			.then((response) => {
				const copy = response.clone();
				if (response.ok && SHELL_ASSETS.includes(url.pathname)) {
					caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
				}
				return response;
			})
			.catch(() => caches.match(event.request)),
	);
});
