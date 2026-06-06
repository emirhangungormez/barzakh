/**
 * Barzakh: Star Gardener - Steam Asset Sync
 * Fetches dynamic screenshot thumbnails from Steam and keeps full-size images for the lightbox.
 */

function sanitizeString(str) {
    if (typeof str !== 'string') return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function isValidSteamUrl(url) {
    if (typeof url !== 'string') return false;
    try {
        const parsed = new URL(url);
        return parsed.hostname.endsWith('.steamstatic.com') ||
            parsed.hostname.endsWith('.steampowered.com');
    } catch {
        return false;
    }
}

async function updateSteamAssets() {
    const isMobileLike = window.matchMedia('(max-width: 768px)').matches ||
        (navigator.connection && navigator.connection.saveData);

    if (isMobileLike) return;

    const APP_ID = '3849950';
    const PROXY_URL = 'fetch_steam.php';

    try {
        const response = await fetch(PROXY_URL, {
            method: 'GET',
            credentials: 'same-origin'
        });

        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }

        const data = await response.json();

        if (!data[APP_ID] || !data[APP_ID].success) {
            return;
        }

        const appDetails = data[APP_ID].data;

        if (appDetails.screenshots && Array.isArray(appDetails.screenshots)) {
            updateGallery(appDetails.screenshots);
        }
    } catch {
        // Static hosts do not execute fetch_steam.php; keep the hardcoded gallery fallback.
    }
}

function updateGallery(screenshots) {
    const gallery = document.querySelector('.photo-gallery');
    if (!gallery || !screenshots) return;

    gallery.textContent = '';

    screenshots.forEach((ss, index) => {
        const fullImage = ss.path_full;
        const thumbnailImage = ss.path_thumbnail || ss.path_full;

        if (!isValidSteamUrl(fullImage) || !isValidSteamUrl(thumbnailImage)) {
            return;
        }

        const img = document.createElement('img');
        img.src = thumbnailImage;
        img.dataset.full = fullImage;
        img.alt = `Barzakh Screenshot ${index + 1}`;
        img.width = 600;
        img.height = 338;
        img.loading = 'lazy';
        img.decoding = 'async';
        img.dataset.id = sanitizeString(String(ss.id));

        gallery.appendChild(img);
    });

    document.dispatchEvent(new Event('steamAssetsLoaded'));
}

document.addEventListener('DOMContentLoaded', () => {
    updateSteamAssets();
});
