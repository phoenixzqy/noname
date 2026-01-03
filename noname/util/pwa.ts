// PWA Service Worker Registration
// This file handles the registration and updates of the PWA service worker

export async function registerPWAServiceWorker(): Promise<ServiceWorkerRegistration | null> {
	if (!('serviceWorker' in navigator)) {
		console.log('[PWA] Service workers are not supported');
		return null;
	}

	try {
		const registration = await navigator.serviceWorker.register('/pwa-sw.js', {
			scope: '/',
			type: 'module'
		});

		console.log('[PWA] Service Worker registered with scope:', registration.scope);

		// Check for updates
		registration.addEventListener('updatefound', () => {
			const newWorker = registration.installing;
			if (newWorker) {
				console.log('[PWA] New Service Worker installing...');
				newWorker.addEventListener('statechange', () => {
					if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
						// New content is available, notify user
						console.log('[PWA] New content available, please refresh');
						showUpdateNotification(registration);
					}
				});
			}
		});

		return registration;
	} catch (error) {
		console.error('[PWA] Service Worker registration failed:', error);
		return null;
	}
}

// Show update notification to user
function showUpdateNotification(registration: ServiceWorkerRegistration): void {
	// Create a simple notification UI
	const notification = document.createElement('div');
	notification.id = 'pwa-update-notification';
	notification.style.cssText = `
		position: fixed;
		bottom: 20px;
		left: 50%;
		transform: translateX(-50%);
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		padding: 16px 24px;
		border-radius: 12px;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
		z-index: 10000;
		display: flex;
		align-items: center;
		gap: 16px;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
		font-size: 14px;
		animation: slideUp 0.3s ease-out;
	`;

	notification.innerHTML = `
		<span>有新版本可用!</span>
		<button id="pwa-update-btn" style="
			background: white;
			color: #667eea;
			border: none;
			padding: 8px 16px;
			border-radius: 6px;
			cursor: pointer;
			font-weight: bold;
			transition: transform 0.2s;
		">立即更新</button>
		<button id="pwa-dismiss-btn" style="
			background: transparent;
			color: white;
			border: 1px solid rgba(255,255,255,0.5);
			padding: 8px 16px;
			border-radius: 6px;
			cursor: pointer;
			transition: background 0.2s;
		">稍后</button>
	`;

	// Add animation keyframes
	const style = document.createElement('style');
	style.textContent = `
		@keyframes slideUp {
			from {
				opacity: 0;
				transform: translateX(-50%) translateY(20px);
			}
			to {
				opacity: 1;
				transform: translateX(-50%) translateY(0);
			}
		}
	`;
	document.head.appendChild(style);
	document.body.appendChild(notification);

	// Update button handler
	const updateBtn = document.getElementById('pwa-update-btn');
	if (updateBtn) {
		updateBtn.addEventListener('click', () => {
			// Tell the new service worker to take over
			if (registration.waiting) {
				registration.waiting.postMessage({ type: 'SKIP_WAITING' });
			}
			// Reload the page
			window.location.reload();
		});
	}

	// Dismiss button handler
	const dismissBtn = document.getElementById('pwa-dismiss-btn');
	if (dismissBtn) {
		dismissBtn.addEventListener('click', () => {
			notification.remove();
			style.remove();
		});
	}
}

// Check if app is running as installed PWA
export function isPWAInstalled(): boolean {
	// Check display-mode
	if (window.matchMedia('(display-mode: standalone)').matches) {
		return true;
	}
	// Check iOS standalone mode
	if ((navigator as any).standalone === true) {
		return true;
	}
	// Check if launched from home screen on Android
	if (document.referrer.includes('android-app://')) {
		return true;
	}
	return false;
}

// Request to clear all caches
export async function clearPWACache(): Promise<void> {
	if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
		navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_CACHE' });
	}
	// Also clear caches directly
	if ('caches' in window) {
		const cacheNames = await caches.keys();
		await Promise.all(cacheNames.map(name => caches.delete(name)));
		console.log('[PWA] All caches cleared');
	}
}

// Show install prompt for browsers that support it
let deferredPrompt: BeforeInstallPromptEvent | null = null;

interface BeforeInstallPromptEvent extends Event {
	prompt(): Promise<void>;
	userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function setupInstallPrompt(): void {
	window.addEventListener('beforeinstallprompt', (e: Event) => {
		// Prevent the mini-infobar from appearing on mobile
		e.preventDefault();
		// Stash the event so it can be triggered later
		deferredPrompt = e as BeforeInstallPromptEvent;
		console.log('[PWA] Install prompt available');
		// Optionally show your own install button
		showInstallButton();
	});

	window.addEventListener('appinstalled', () => {
		console.log('[PWA] App was installed');
		deferredPrompt = null;
		hideInstallButton();
	});
}

function showInstallButton(): void {
	// You can implement a custom install button here
	// This is just a placeholder - integrate with your UI
	console.log('[PWA] Install button can be shown');
}

function hideInstallButton(): void {
	const installBtn = document.getElementById('pwa-install-btn');
	if (installBtn) {
		installBtn.remove();
	}
}

export async function triggerInstallPrompt(): Promise<boolean> {
	if (!deferredPrompt) {
		console.log('[PWA] No install prompt available');
		return false;
	}

	// Show the install prompt
	await deferredPrompt.prompt();
	
	// Wait for the user to respond
	const { outcome } = await deferredPrompt.userChoice;
	console.log('[PWA] User response to install prompt:', outcome);
	
	// Clear the deferred prompt
	deferredPrompt = null;
	
	return outcome === 'accepted';
}
