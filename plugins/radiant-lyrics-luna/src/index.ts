import { LunaUnload, Tracer, ftch } from "@luna/core";
import { StyleTag } from "@luna/lib";
import { settings, Settings } from "./Settings";

// Import CSS files directly using Luna's file:// syntax
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
var currentTrackSrc: string | null = null; // Track current album art to prevent unnecessary updates
var currentGlobalTrackSrc: string | null = null; // Track current global background to prevent unnecessary updates

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

// Function to apply spinning background to the entire app
const applyGlobalSpinningBackground = (albumImageSrc: string): void => {
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

    // Add black background
    const blackBg = document.createElement('div');
    blackBg.className = 'global-spinning-black-bg';
    appContainer.appendChild(blackBg);

    // Add one spinning image for performance
    const img = document.createElement('img');
    img.src = albumImageSrc;
    img.className = 'global-spinning-image';
    img.style.animationDelay = '0s';
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
    currentGlobalTrackSrc = null; // Reset current global track source
};

// Function to update global background when settings change
const updateRadiantLyricsGlobalBackground = function(): void {
    if (settings.spinningCoverEverywhere && currentTrackSrc) {
        applyGlobalSpinningBackground(currentTrackSrc);
    } else {
        cleanUpGlobalSpinningBackground();
    }
};

// Make these functions available globally so Settings can call them
(window as any).updateRadiantLyricsStyles = updateRadiantLyricsStyles;
(window as any).updateRadiantLyricsGlobalBackground = updateRadiantLyricsGlobalBackground;

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

function observeTrackTitle(): void {
    // Observe track title changes
    const trackTitleElement = document.querySelector('[class^="_trackTitleContainer"]');
    if (trackTitleElement) {
        const titleObserver = new MutationObserver(() => {
            setTimeout(() => {
                onTrackChanged();
            }, 300);
        });
        
        titleObserver.observe(trackTitleElement, {
            childList: true,
            subtree: true
        });
        
        unloads.add(() => titleObserver.disconnect());
    }

    // Also observe the album image container for changes
    const albumImageContainer = document.querySelector('figure[class*="_albumImage"]');
    if (albumImageContainer) {
        const imageObserver = new MutationObserver(() => {
            setTimeout(() => {
                onTrackChanged();
            }, 100); // Slightly longer delay for image loading
        });
        
        imageObserver.observe(albumImageContainer, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['src', 'poster']
        });
        
        unloads.add(() => imageObserver.disconnect());
    }

    // Set up a periodic check as fallback
    const periodicCheck = setInterval(() => {
        onTrackChanged();
    }, 100); // Check every 100ms
    
    unloads.add(() => clearInterval(periodicCheck));
}

// Also observe for the buttons to appear so we can add our buttons
function observeForButtons(): void {
    const observer = new MutationObserver(() => {
        // Only observe for buttons if Hide UI is enabled
        if (settings.hideUIEnabled) {
            const fullscreenButton = document.querySelector('[data-test="request-fullscreen"]');
            if (fullscreenButton && !document.querySelector('.hide-ui-button')) {
                createHideUIButton();
            }
            
            // Create unhide button if it doesn't exist
            if (!document.querySelector('.unhide-ui-button')) {
                createUnhideUIButton();
            }
        }
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    unloads.add(() => observer.disconnect());
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

const onTrackChanged = function (method: number = 0): void {
    if (method === 1) {
        setTimeout(() => {
            onTrackChanged();
            return;
        }, 2000);
    }

    let albumImageElement = document.querySelector('figure[class*="_albumImage"] > div > div > div > img') as HTMLImageElement;
    let albumImageSrc: string | null = null;

    if (albumImageElement) {
        albumImageSrc = albumImageElement.src;
        // Set res to 1280x1280
        albumImageSrc = albumImageSrc.replace(/\d+x\d+/, '1280x1280');
        albumImageElement.src = albumImageSrc;
    } else {
        const videoElement = document.querySelector('figure[class*="_albumImage"] > div > div > div > video') as HTMLVideoElement;
        if (videoElement) {
            albumImageSrc = videoElement.getAttribute("poster");
            if (albumImageSrc) {
                // Set res to 1280x1280
                albumImageSrc = albumImageSrc.replace(/\d+x\d+/, '1280x1280');
            }
        } else {
            cleanUpDynamicArt();
            //trace.msg.log("Couldn't get album art"); - Broken as fucky
            return;
        }
    }

    // Only update if the image source has actually changed
    if (albumImageSrc && albumImageSrc !== currentTrackSrc) {
        currentTrackSrc = albumImageSrc;
        //trace.msg.log(`Track changed, updating background: ${albumImageSrc}`); - Accidentally left this in Prod... 
        
        // Apply global spinning background if enabled
        if (settings.spinningCoverEverywhere && albumImageSrc !== currentGlobalTrackSrc) {
            currentGlobalTrackSrc = albumImageSrc;
            applyGlobalSpinningBackground(albumImageSrc);
        }
        
        // Setting background to the *="nowPlayingContainer" element
        const nowPlayingContainerElement = document.querySelector('[class*="_nowPlayingContainer"]') as HTMLElement;
        if (nowPlayingContainerElement) {
            // Remove existing corner images if they exist
            const existingImages = nowPlayingContainerElement.querySelectorAll('.corner-image');
            existingImages.forEach(img => img.remove());

            // Create and append center image
            const centerImg = document.createElement('img');
            centerImg.src = albumImageSrc;
            centerImg.className = 'corner-image';
            centerImg.style.position = 'absolute';
            centerImg.style.left = '50%';
            centerImg.style.top = '50%';
            centerImg.style.transform = 'translate(-50%, -50%)';
            centerImg.style.width = '75vw';
            centerImg.style.height = '150vh';
            centerImg.style.objectFit = 'cover';
            centerImg.style.zIndex = '-1';
            centerImg.style.filter = 'blur(100px) brightness(0.4) contrast(1.2) saturate(1)';
            centerImg.style.animation = 'spin 35s linear infinite';
            centerImg.style.animationDelay = '5s';  // Add a 5-second delay
            nowPlayingContainerElement.appendChild(centerImg);

            const centerImg2 = document.createElement('img');
            centerImg2.src = albumImageSrc;
            centerImg2.className = 'corner-image';
            centerImg2.style.position = 'absolute';
            centerImg2.style.left = '50%';
            centerImg2.style.top = '50%';
            centerImg2.style.transform = 'translate(-50%, -50%)';
            centerImg2.style.width = '75vw';
            centerImg2.style.height = '150vh';
            centerImg2.style.objectFit = 'cover';
            centerImg2.style.zIndex = '-1';
            centerImg2.style.filter = 'blur(100px) brightness(0.4) contrast(1.2) saturate(1)';
            centerImg2.style.animation = 'spin 35s linear infinite';
            nowPlayingContainerElement.appendChild(centerImg2);

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
    const cornerImages = document.getElementsByClassName("corner-image");
    Array.from(cornerImages).forEach((element) => {
        element.remove();
    });
    currentTrackSrc = null; // Reset current track source
    
    // Also clean up global spinning backgrounds
    cleanUpGlobalSpinningBackground();
};

// Initialize the button creation and observers
observeForButtons();
observeTrackTitle();
observeLyricsContainer();
onTrackChanged(1);

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