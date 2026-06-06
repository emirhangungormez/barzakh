const isMobileLike = window.matchMedia('(max-width: 768px)').matches ||
    (navigator.connection && navigator.connection.saveData);

let lenis = null;

function scrollToSection(selector) {
    if (lenis) {
        lenis.scrollTo(selector);
        return;
    }

    document.querySelector(selector)?.scrollIntoView({ behavior: 'smooth' });
}

function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.defer = true;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

async function loadMotionLibraries() {
    if (isMobileLike) return;

    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.11.4/gsap.min.js');
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.11.4/ScrollTrigger.min.js');
    await loadScript('https://cdn.jsdelivr.net/npm/lenis@latest/dist/lenis.min.js');

    gsap.registerPlugin(ScrollTrigger);

    lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smooth: true,
        direction: 'vertical'
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);
}

function setupMotionAnimations() {
    if (!window.gsap || !window.ScrollTrigger) return;

    gsap.from(".about-container h1, .about-container h2", {
        scrollTrigger: {
            trigger: ".about-container",
            start: "top 80%",
        },
        y: 40,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        ease: "power3.out"
    });

    gsap.from(".about-description", {
        scrollTrigger: {
            trigger: ".about-container",
            start: "top 70%",
        },
        y: 30,
        opacity: 0,
        duration: 1,
        ease: "power3.out"
    });

    if (document.querySelector(".footer-col")) {
        gsap.from(".footer-col", {
            scrollTrigger: {
                trigger: ".minimal-footer",
                start: "top 90%",
            },
            y: 20,
            opacity: 0,
            duration: 0.8,
            stagger: 0.1,
            ease: "power2.out"
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const backgroundVideo = document.querySelector('.bg-video[data-src]');
    if (backgroundVideo && !isMobileLike) {
        window.addEventListener('load', () => {
            window.setTimeout(() => {
                backgroundVideo.src = backgroundVideo.dataset.src;
                backgroundVideo.load();
                backgroundVideo.play().catch(() => {});
            }, 5000);
        }, { once: true });
    }

    const steamFrame = document.querySelector('.steam-official-widget iframe[data-src]');
    if (steamFrame && !isMobileLike) {
        window.addEventListener('load', () => {
            window.setTimeout(() => {
                steamFrame.src = steamFrame.dataset.src;
            }, 3500);
        }, { once: true });
    }

    loadMotionLibraries().then(setupMotionAnimations).catch(() => {});

    // Lightbox
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const closeBtn = document.querySelector('.lightbox .close-btn'); // Re-added this
    // Lightbox using event delegation for dynamic images
    const gallery = document.querySelector('.photo-gallery');
    if (gallery) {
        gallery.addEventListener('click', (e) => {
            if (e.target.tagName === 'IMG') {
                const img = e.target;
                lightbox.classList.add('active');
                lightboxImg.src = img.dataset.full || img.src;
                if (lenis) lenis.stop();
            }
        });
    }

    const closeLightbox = () => {
        lightbox.classList.remove('active');
        if (lenis) lenis.start();
    };

    if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
    if (lightbox) {
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) closeLightbox();
        });
    }

    // Auto-scroll gallery logic
    if (gallery) {
        let isHovering = false;
        const scrollSpeed = 0.5;
        let galleryReady = false;

        // Note: With Steam dynamic loading, we need to clone AFTER images are loaded.
        // For now, we'll keep the existing logic but wrap it in an observer if needed.
        // Actually, the steam-assets.js will handle the initial render.

        const setupClones = () => {
            // Removing old clones if any
            const existingImages = Array.from(gallery.querySelectorAll('img:not(.clone)'));
            gallery.innerHTML = '';
            existingImages.forEach(img => gallery.appendChild(img));

            existingImages.forEach(item => {
                const clone = item.cloneNode(true);
                clone.classList.add('clone');
                gallery.appendChild(clone);
            });
        };

        const autoScroll = () => {
            if (galleryReady && !isHovering && gallery.children.length > 0) {
                gallery.scrollLeft += scrollSpeed;
                if (gallery.scrollLeft >= gallery.scrollWidth / 2) {
                    gallery.scrollLeft = 0;
                }
            }
            requestAnimationFrame(autoScroll);
        };

        gallery.addEventListener('mouseenter', () => isHovering = true);
        gallery.addEventListener('mouseleave', () => isHovering = false);

        const prepareGallery = () => {
            if (galleryReady) return;
            galleryReady = true;
            setupClones();
        };

        // Listen for custom event when steam assets are loaded
        document.addEventListener('steamAssetsLoaded', prepareGallery);

        if ('IntersectionObserver' in window) {
            const galleryObserver = new IntersectionObserver((entries) => {
                if (entries.some(entry => entry.isIntersecting)) {
                    prepareGallery();
                    galleryObserver.disconnect();
                }
            }, { rootMargin: '400px 0px' });

            galleryObserver.observe(gallery);
        } else {
            window.addEventListener('load', prepareGallery, { once: true });
        }

        autoScroll();
    }

    // Anchor Link Smooth Scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const target = document.querySelector(targetId);
            if (target) {
                scrollToSection(targetId);
            }
        });
    });

    // Custom Video Controls
    const video = document.querySelector('.main-video');
    const videoSource = video?.querySelector('source[data-src]');
    const playBtn = document.getElementById('playBtn');
    const muteBtn = document.getElementById('muteBtn');
    const iconPlay = document.querySelector('.icon-play');
    const iconPause = document.querySelector('.icon-pause');
    const iconUnmute = document.querySelector('.icon-unmute');
    const iconMute = document.querySelector('.icon-mute');

    const loadMainVideo = () => {
        if (!video || !videoSource || videoSource.src) return;
        videoSource.src = videoSource.dataset.src;
        video.load();
    };

    if (video && videoSource && !isMobileLike) {
        window.addEventListener('load', () => {
            window.setTimeout(() => {
                loadMainVideo();
                video.play().catch(() => {});
            }, 1000);
        }, { once: true });
    }

    if (video && playBtn && muteBtn) {
        playBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevents double toggling if we add listener to container
            loadMainVideo();
            if (video.paused) {
                video.play();
                iconPlay.style.display = 'none';
                iconPause.style.display = 'block';
            } else {
                video.pause();
                iconPlay.style.display = 'block';
                iconPause.style.display = 'none';
            }
        });

        muteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            video.muted = !video.muted;
            if (video.muted) {
                iconUnmute.style.display = 'none';
                iconMute.style.display = 'block';
            } else {
                iconUnmute.style.display = 'block';
                iconMute.style.display = 'none';
            }
        });

        // Initialize icon state
        if (!isMobileLike) {
            iconPlay.style.display = 'none';
            iconPause.style.display = 'block';
        } else {
            iconPlay.style.display = 'block';
            iconPause.style.display = 'none';
        }
        if (video.muted) {
            iconUnmute.style.display = 'none';
            iconMute.style.display = 'block';
        }

        // Video Debugger - Neden açılmadığını kesin olarak bulur
        video.addEventListener('error', function (e) {
            const error = video.error;
            if (!error) return;

            let message = 'Bilinmeyen Hata';
            switch (error.code) {
                case error.MEDIA_ERR_ABORTED: message = 'Yükleme kullanıcı tarafından durduruldu.'; break;
                case error.MEDIA_ERR_NETWORK: message = 'Ağ hatası: Video indirilemedi.'; break;
                case error.MEDIA_ERR_DECODE: message = 'Dosya bozuk veya format desteklenmiyor.'; break;
                case error.MEDIA_ERR_SRC_NOT_SUPPORTED: message = 'Video dosyası bulunamadı veya format yanlış.'; break;
            }
            console.error('VIDEO ERROR DETECTED:', message, error);
        }, true);
    }
});
