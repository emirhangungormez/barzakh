/**
 * Barzakh: Star Gardener - Steam Asset Sync
 * Fetches dynamic content from Steam Store API to keep the site updated.
 * Security: Input sanitization and URL validation included.
 */

// Sanitize string to prevent XSS
function sanitizeString(str) {
    if (typeof str !== 'string') return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// Validate Steam CDN URL
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
            console.error('Steam API error:', data);
            return;
        }

        const appDetails = data[APP_ID].data;

        // Update Screenshots Gallery with sanitization
        if (appDetails.screenshots && Array.isArray(appDetails.screenshots)) {
            updateGallery(appDetails.screenshots);
        }

        console.log('Steam screenshots updated successfully!');
    } catch (error) {
        console.error('Failed to fetch Steam assets:', error);
    }
}

function updateGallery(screenshots) {
    const gallery = document.querySelector('.photo-gallery');
    if (!gallery || !screenshots) return;

    // Clear existing content safely
    gallery.textContent = '';

    screenshots.forEach((ss, index) => {
        // Validate URL before using
        if (!isValidSteamUrl(ss.path_full)) {
            console.warn(`Invalid screenshot URL skipped: ${ss.path_full}`);
            return;
        }

        const img = document.createElement('img');
        img.src = ss.path_full;
        img.alt = `Barzakh Ekran Görüntüsü ${index + 1}`;
        img.loading = 'lazy';
        img.dataset.id = sanitizeString(String(ss.id));

        gallery.appendChild(img);
    });

    document.dispatchEvent(new Event('steamAssetsLoaded'));
}

// Run on load
document.addEventListener('DOMContentLoaded', () => {
    updateSteamAssets();
});

