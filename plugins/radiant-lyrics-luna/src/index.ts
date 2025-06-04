import { LunaUnload, Tracer, ftch } from "@luna/core";
import { StyleTag, PlayState } from "@luna/lib";
import { settings, Settings } from "./Settings";

// Import CSS files directly using Luna's file:// syntax - Took me a while to figure out <3
import baseStyles from "file://styles.css?minify";
import separatedLyrics from "file://separated-lyrics.css?minify";
import playerBarHidden from "file://player-bar-hidden.css?minify";
import lyricsGlow from "file://lyrics-glow.css?minify";
import coverEverywhereCss from "file://cover-everywhere.css?minify";

export const { trace } = Tracer("[Radiant Lyrics]");
export { Settings };

// clean up resources
export const unloads = new Set<LunaUnload>();

// StyleTag instances for different CSS modules
const lyricsStyleTag = new StyleTag("RadiantLyrics-lyrics", unloads);
const baseStyleTag = new StyleTag("RadiantLyrics-base", unloads);
const playerBarStyleTag = new StyleTag("RadiantLyrics-player-bar", unloads);
const lyricsGlowStyleTag = new StyleTag("RadiantLyrics-lyrics-glow", unloads);

let globalSpinningBgStyleTag: StyleTag | null = null;

// Apply lyrics glow styles if enabled
if (settings.lyricsGlowEnabled) {
    lyricsGlowStyleTag.css = lyricsGlow;
}

var isHidden = false;

const updateButtonStates = function(): void {
    const hideButton = document.querySelector('.hide-ui-button') as HTMLElement;
    const unhideButton = document.querySelector('.unhide-ui-button') as HTMLElement;
    
    if (hideButton) {
        hideButton.style.display = (settings.hideUIEnabled && !isHidden) ? 'flex' : 'none';
    }
    if (unhideButton) {
        unhideButton.style.display = (settings.hideUIEnabled && isHidden) ? 'flex' : 'none';
    }
};

// Function to update styles when settings change
const updateRadiantLyricsStyles = function(): void {
    if (isHidden) {
        // Apply all clean view styles
        lyricsStyleTag.css = separatedLyrics;
        baseStyleTag.css = baseStyles;
        
        // Apply player bar styles based on setting
        if (!settings.playerBarVisible) {
            playerBarStyleTag.css = playerBarHidden;
        } else {
            playerBarStyleTag.remove();
        }
    }

    // Update lyrics glow based on setting
    const lyricsContainer = document.querySelector('[class^="_lyricsContainer"]');
    if (lyricsContainer) {
        if (settings.lyricsGlowEnabled) {
            lyricsContainer.classList.remove('lyrics-glow-disabled');
            lyricsGlowStyleTag.css = lyricsGlow;
        } else {
            lyricsContainer.classList.add('lyrics-glow-disabled');
            lyricsGlowStyleTag.remove();
        }
    }
};

// Function to apply spinning background to the entire app (cover everywhere)
const applyGlobalSpinningBackground = (coverArtImageSrc: string): void => {
    const appContainer = document.querySelector('[data-test="main"]') as HTMLElement;
    if (!settings.spinningCoverEverywhere) {
        // Remove StyleTag and all background elements
        if (globalSpinningBgStyleTag) {
            globalSpinningBgStyleTag.remove();
            globalSpinningBgStyleTag = null;
        }
        if (appContainer) {
            appContainer.querySelectorAll('.global-spinning-image, .global-spinning-black-bg').forEach(el => el.remove());
        }
        return;
    }

    // Add StyleTag if not present
    if (!globalSpinningBgStyleTag) {
        globalSpinningBgStyleTag = new StyleTag("RadiantLyrics-global-spinning-bg", unloads, coverEverywhereCss);
    }

    if (!appContainer) return;

    // Remove any existing background elements
    appContainer.querySelectorAll('.global-spinning-image, .global-spinning-black-bg').forEach(el => el.remove());

    // Add black background (to obscure image edges)
    const blackBg = document.createElement('div');
    blackBg.className = 'global-spinning-black-bg';
    appContainer.appendChild(blackBg);

    // Add one image for background (spinning or static based on performance mode)
    const img = document.createElement('img');
    img.src = coverArtImageSrc;
    img.className = 'global-spinning-image';
    img.style.animationDelay = '0s';
    img.style.filter = `blur(${settings.backgroundBlur}px) brightness(${settings.backgroundBrightness / 100}) contrast(${settings.backgroundContrast}%)`;
    
    // Apply or remove animation based on performance mode
    if (settings.performanceMode) {
        img.style.animation = 'none';
        img.classList.add('performance-mode-static');
    } else {
        img.style.animation = `spinGlobal ${settings.spinSpeed}s linear infinite`;
        img.classList.remove('performance-mode-static');
    }
    
    appContainer.appendChild(img);
};

// Function to clean up global spinning background
const cleanUpGlobalSpinningBackground = function(): void {
    const globalImages = document.getElementsByClassName("global-spinning-image");
    Array.from(globalImages).forEach((element) => {
        element.remove();
    });
    // Also remove the overlay
    const overlay = document.querySelector('.global-spinning-overlay');
    if (overlay && overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
    }
    // Also remove the black bg
    const blackBg = document.querySelector('.global-spinning-black-bg');
    if (blackBg && blackBg.parentNode) {
        blackBg.parentNode.removeChild(blackBg);
    }
};

// Function to update global background when settings change
const updateRadiantLyricsGlobalBackground = function(): void {
    if (settings.spinningCoverEverywhere) {
        // Get current cover art and apply global background
        updateCoverArtBackground();
    } else {
        cleanUpGlobalSpinningBackground();
    }
};

// Function to update Now Playing background when settings change
const updateRadiantLyricsNowPlayingBackground = function(): void {
    const nowPlayingBackgroundImages = document.querySelectorAll('.now-playing-background-image');
    nowPlayingBackgroundImages.forEach((img: Element) => {
        const imgElement = img as HTMLElement;
        
        // Default values when settings don't affect Now Playing
        const defaultBlur = 80;
        const defaultBrightness = 40;
        const defaultContrast = 120;
        const defaultSpinSpeed = 45;
        
        if (settings.settingsAffectNowPlaying) {
            // Use settings values
            if (settings.performanceMode) {
                imgElement.style.animation = 'none';
                imgElement.classList.add('performance-mode-static');
            } else {
                imgElement.style.animation = `spin ${settings.spinSpeed}s linear infinite`;
                imgElement.classList.remove('performance-mode-static');
            }
            imgElement.style.filter = `blur(${settings.backgroundBlur}px) brightness(${settings.backgroundBrightness / 100}) contrast(${settings.backgroundContrast}%)`;
        } else {
            // Reset to default values
            if (settings.performanceMode) {
                imgElement.style.animation = 'none';
                imgElement.classList.add('performance-mode-static');
            } else {
                imgElement.style.animation = `spin ${defaultSpinSpeed}s linear infinite`;
                imgElement.classList.remove('performance-mode-static');
            }
            imgElement.style.filter = `blur(${defaultBlur}px) brightness(${defaultBrightness / 100}) contrast(${defaultContrast}%)`;
        }
    });
};

// Make these functions available globally so Settings can call them
(window as any).updateRadiantLyricsStyles = updateRadiantLyricsStyles;
(window as any).updateRadiantLyricsGlobalBackground = updateRadiantLyricsGlobalBackground;
(window as any).updateRadiantLyricsNowPlayingBackground = updateRadiantLyricsNowPlayingBackground;

const toggleRadiantLyrics = function(): void {
    // Toggle the state first
    isHidden = !isHidden;
    
    if (isHidden) {
        // Apply clean view styles
        updateRadiantLyricsStyles();
    } else {
        // Remove all clean view styles
        lyricsStyleTag.remove();
        baseStyleTag.remove();
        playerBarStyleTag.remove();
    }
    updateButtonStates();
};

const createHideUIButton = function(): void {
    setTimeout(() => {
        // Only create button if Hide UI is enabled in settings
        if (!settings.hideUIEnabled) return;
        
        // Look for the fullscreen button's parent container
        const fullscreenButton = document.querySelector('[data-test="request-fullscreen"]');
        if (!fullscreenButton || !fullscreenButton.parentElement) {
            // Retry if fullscreen button not found yet
            setTimeout(() => createHideUIButton(), 1000);
            return;
        }

        // Check if our button already exists
        if (document.querySelector('.hide-ui-button')) return;

        const buttonContainer = fullscreenButton.parentElement;
        
        // Create our hide UI button
        const hideUIButton = document.createElement("button");
        hideUIButton.className = 'hide-ui-button';
        hideUIButton.setAttribute('aria-label', 'Hide UI');
        hideUIButton.setAttribute('title', 'Hide UI');
        hideUIButton.textContent = 'Hide UI';
        
        // Style to match Tidal's buttons
        hideUIButton.style.cssText = `
            background-color: var(--wave-color-solid-accent-fill);
            color: black;
            border: none;
            border-radius: 12px;
            height: 40px;
            padding: 0 12px;
            margin-left: 8px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background-color 0.2s ease;
            font-size: 12px;
            font-weight: 600;
            white-space: nowrap;
        `;
        
        // Add hover effect
        hideUIButton.addEventListener('mouseenter', () => {
            hideUIButton.style.backgroundColor = 'lightgray';
        });
        
        hideUIButton.addEventListener('mouseleave', () => {
            hideUIButton.style.backgroundColor = 'var(--wave-color-solid-accent-fill)';
        });
        
        hideUIButton.onclick = toggleRadiantLyrics;

        // Insert after the fullscreen button
        buttonContainer.insertBefore(hideUIButton, fullscreenButton.nextSibling);
        
        //trace.msg.log("Hide UI button added next to fullscreen button");
        updateButtonStates();
    }, 1000);
};

const createUnhideUIButton = function(): void {
    setTimeout(() => {
        // Only create button if Hide UI is enabled in settings
        if (!settings.hideUIEnabled) return;
        
        // Check if our button already exists
        if (document.querySelector('.unhide-ui-button')) return;

        // Create our unhide UI button and position it on the left side above player
        const unhideUIButton = document.createElement("button");
        unhideUIButton.className = 'unhide-ui-button';
        unhideUIButton.setAttribute('aria-label', 'Unhide UI');
        unhideUIButton.setAttribute('title', 'Unhide UI');
        unhideUIButton.textContent = 'Unhide';
        
        // Style for bottom-left positioning with blur and transparency
        unhideUIButton.style.cssText = `
            position: fixed;
            bottom: 120px;
            left: 20px;
            background-color: rgba(255, 255, 255, 0.2);
            color: white;
            border: 1px solid rgba(255, 255, 255, 0.3);
            border-radius: 12px;
            height: 50px;
            padding: 0 16px;
            cursor: pointer;
            display: none;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
            font-size: 14px;
            font-weight: 600;
            white-space: nowrap;
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            z-index: 9999;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        `;
        
        // Add hover effect
        unhideUIButton.addEventListener('mouseenter', () => {
            unhideUIButton.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
            unhideUIButton.style.transform = 'scale(1.05)';
        });
        
        unhideUIButton.addEventListener('mouseleave', () => {
            unhideUIButton.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
            unhideUIButton.style.transform = 'scale(1)';
        });
        
        unhideUIButton.onclick = toggleRadiantLyrics;

        // Append to body instead of a specific container
        document.body.appendChild(unhideUIButton);
        
        //trace.msg.log("Unhide UI button added to bottom-left above player bar");
        updateButtonStates();
    }, 1500); // Slight delay after hide button
};

// Function to observe track changes using track ID
const observeTrackChanges = (): void => {
    let lastTrackId: string | null = null;
    const interval = setInterval(() => {
        const currentTrackId = PlayState.playbackContext?.actualProductId;
        if (currentTrackId && currentTrackId !== lastTrackId) {
            trace.msg.log(`Track changed: ${lastTrackId} -> ${currentTrackId}`);
            lastTrackId = currentTrackId;
            // delay for cover art to load (to prevent flickering)
            setTimeout(() => {
                updateCoverArtBackground();
            }, 150);
        }
    }, 150); // Check every 150ms for better responsiveness
    
    unloads.add(() => clearInterval(interval));

    // Initial background application (if a track is already loaded)
    const currentTrackId = PlayState.playbackContext?.actualProductId;
    if (currentTrackId) {
        lastTrackId = currentTrackId;
        // Reduced delay for initial load
        setTimeout(() => {
            updateCoverArtBackground();
        }, 300);
    }
};

// Button observer using polling (instead of Stupid Bloated MutationObserver)
function observeForButtons(): void {
    const buttonCheckInterval = setInterval(() => {
        // Only observe for buttons if Hide UI is enabled
        if (!settings.hideUIEnabled) return;
        
        const fullscreenButton = document.querySelector('[data-test="request-fullscreen"]');
        if (fullscreenButton && !document.querySelector('.hide-ui-button')) {
            createHideUIButton();
        }
        
        // Create unhide button if it doesn't exist
        if (!document.querySelector('.unhide-ui-button')) {
            createUnhideUIButton();
        }
    }, 500); // Check every 500ms (much more efficient than MutationObserver)
    
    unloads.add(() => clearInterval(buttonCheckInterval));
}

// Also observe for lyrics container changes to apply the setting 
function observeLyricsContainer(): void {
    const observer = new MutationObserver(() => {
        const lyricsContainer = document.querySelector('[class^="_lyricsContainer"]');
        if (lyricsContainer) {
            if (settings.lyricsGlowEnabled) {
                lyricsContainer.classList.remove('lyrics-glow-disabled');
            } else {
                lyricsContainer.classList.add('lyrics-glow-disabled');
            }
        }
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    unloads.add(() => observer.disconnect());
}

const updateCoverArtBackground = function (method: number = 0): void {
    if (method === 1) {
        setTimeout(() => {
            updateCoverArtBackground();
            return;
        }, 2000);
    }

    let coverArtImageElement = document.querySelector('figure[class*="_albumImage"] > div > div > div > img') as HTMLImageElement;
    let coverArtImageSrc: string | null = null;

    if (coverArtImageElement) {
        coverArtImageSrc = coverArtImageElement.src;
        // Set res to 1280x1280
        coverArtImageSrc = coverArtImageSrc.replace(/\d+x\d+/, '1280x1280');
        coverArtImageElement.src = coverArtImageSrc;
    } else {
        const videoElement = document.querySelector('figure[class*="_albumImage"] > div > div > div > video') as HTMLVideoElement;
        if (videoElement) {
            coverArtImageSrc = videoElement.getAttribute("poster");
            if (coverArtImageSrc) {
                // Set res to 1280x1280
                coverArtImageSrc = coverArtImageSrc.replace(/\d+x\d+/, '1280x1280');
            }
        } else {
            cleanUpDynamicArt();
            return;
        }
    }

    // Update backgrounds when we have a valid cover art source
    if (coverArtImageSrc) {
        // Apply global spinning background if enabled
        if (settings.spinningCoverEverywhere) {
            applyGlobalSpinningBackground(coverArtImageSrc);
        }
        
        // Apply spinning CoverArt background to the Now Playing container
        const nowPlayingContainerElement = document.querySelector('[class*="_nowPlayingContainer"]') as HTMLElement;
        if (nowPlayingContainerElement) {
            // Remove existing background images if they exist
            const existingBackgroundImages = nowPlayingContainerElement.querySelectorAll('.now-playing-background-image, .now-playing-black-bg');
            existingBackgroundImages.forEach(img => img.remove());

            // Add black background layer (to obscure image edges)
            const blackBg = document.createElement('div');
            blackBg.className = 'now-playing-black-bg';
            blackBg.style.position = 'absolute';
            blackBg.style.left = '0';
            blackBg.style.top = '0';
            blackBg.style.width = '100%';
            blackBg.style.height = '100%';
            blackBg.style.background = '#000';
            blackBg.style.zIndex = '-2';
            blackBg.style.pointerEvents = 'none';
            nowPlayingContainerElement.appendChild(blackBg);

            // Create and append single background layer (the cover art)
            const backgroundImage = document.createElement('img');
            backgroundImage.src = coverArtImageSrc;
            backgroundImage.className = 'now-playing-background-image';
            backgroundImage.style.position = 'absolute';
            backgroundImage.style.left = '50%';
            backgroundImage.style.top = '50%';
            backgroundImage.style.transform = 'translate(-50%, -50%)';
            backgroundImage.style.width = '90vw';
            backgroundImage.style.height = '90vh';
            backgroundImage.style.objectFit = 'cover';
            backgroundImage.style.zIndex = '-1';
            backgroundImage.style.filter = `blur(${settings.backgroundBlur}px) brightness(${settings.backgroundBrightness / 100}) contrast(${settings.backgroundContrast}%)`;
            backgroundImage.style.willChange = 'transform, filter';
            backgroundImage.style.transformOrigin = 'center center';
            
            // Apply animation based on performance mode
            if (settings.performanceMode) {
                backgroundImage.style.animation = 'none';
                backgroundImage.classList.add('performance-mode-static');
            } else {
                backgroundImage.style.animation = `spin ${settings.spinSpeed}s linear infinite`;
                backgroundImage.classList.remove('performance-mode-static');
            }
            nowPlayingContainerElement.appendChild(backgroundImage);

            // Create subtle gradient overlay to hide edges (Hate this approach but it's the only way I could get it to work)
            const gradientOverlay = document.createElement('div');
            gradientOverlay.className = 'now-playing-gradient-overlay';
            gradientOverlay.style.position = 'absolute';
            gradientOverlay.style.left = '0';
            gradientOverlay.style.top = '0';
            gradientOverlay.style.width = '100%';
            gradientOverlay.style.height = '100%';
            gradientOverlay.style.background = 'radial-gradient(circle at center, transparent 0%, rgba(0, 0, 0, 0.3) 60%, rgba(0, 0, 0, 0.8) 90%)';
            gradientOverlay.style.zIndex = '-1';
            gradientOverlay.style.pointerEvents = 'none';
            nowPlayingContainerElement.appendChild(gradientOverlay);

            // Add keyframe animation if it doesn't exist
            if (!document.querySelector('#spinAnimation')) {
                const styleSheet = document.createElement('style');
                styleSheet.id = 'spinAnimation';
                styleSheet.textContent = `
                    @keyframes spin {
                        from { transform: translate(-50%, -50%) rotate(0deg); }
                        to { transform: translate(-50%, -50%) rotate(360deg); }
                    }
                `;
                document.head.appendChild(styleSheet);
            }
        }
    }
};

const cleanUpDynamicArt = function (): void {
    const nowPlayingBackgroundImages = document.getElementsByClassName("now-playing-background-image");
    Array.from(nowPlayingBackgroundImages).forEach((element) => {
        element.remove();
    });
    
    // Also clean up global spinning backgrounds
    cleanUpGlobalSpinningBackground();
};

// Initialize the button creation and observers
observeForButtons();
observeTrackChanges();
observeLyricsContainer();
updateCoverArtBackground(1);

// Add cleanup to unloads
unloads.add(() => {
    cleanUpDynamicArt();

    // Clean up our custom buttons
    const hideButton = document.querySelector('.hide-ui-button');
    if (hideButton && hideButton.parentNode) {
        hideButton.parentNode.removeChild(hideButton);
    }
    
    const unhideButton = document.querySelector('.unhide-ui-button');
    if (unhideButton && unhideButton.parentNode) {
        unhideButton.parentNode.removeChild(unhideButton);
    }

    // Clean up spin animations
    const spinAnimationStyle = document.querySelector('#spinAnimation');
    if (spinAnimationStyle && spinAnimationStyle.parentNode) {
        spinAnimationStyle.parentNode.removeChild(spinAnimationStyle);
    }
    
    // Clean up global spinning backgrounds
    cleanUpGlobalSpinningBackground();
}); 