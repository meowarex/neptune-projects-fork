import { LunaUnload, Tracer, ftch } from "@luna/core";

export const { trace } = Tracer("[Clean View]");


// clean up resources
export const unloads = new Set<LunaUnload>();

const styles = `
[class*="tabItems"] {
    opacity: 0 !important;
    transition: opacity 0.3s ease-in-out;
}

[class*="_imageContainer"] {
    margin-top: 40px !important;
}

[class*="_tabItems"]:hover {
    opacity: 1 !important;
}

[data-test="header-container"] {
    opacity: 0;
    margin: -40px;
}

[class*="_nowPlayingContainer"] {
    padding-left: 6%;
    padding-top: 20px !important;
}

/* Move main content areas up */
[class*="_trackTitleContainer"],
[class*="_artistContainer"],
[class*="_albumContainer"] {
    margin-top: -20px !important;
}

/* Move album art and lyrics content up */
[class*="_lyricsContainer"],
[class*="_mediaContainer"] {
    margin-top: -30px !important;
}

/* Move play queue content up to fill button space */
[class*="_playQueueContainer"],
[class*="_queueContainer"],
[data-test="play-queue"],
#playQueueSidebar {
    margin-top: -40px !important;
    padding-top: 10px !important;
}

/* Move play queue list content up - more aggressive */
[class*="_playQueueList"],
[class*="_queueList"],
[class*="_trackList"] {
    margin-top: -60px !important;
    padding-top: 0px !important;
}

/* Target specific play queue elements more aggressively */
#playQueueSidebar > div,
#playQueueSidebar > div > div {
    margin-top: -40px !important;
    padding-top: 0px !important;
}

/* Override any existing padding in queue content area */
[class*="_queueContent"],
[class*="_playQueueContent"] {
    margin-top: -50px !important;
    padding-top: 20px !important;
}

[class^="_bar"] {
    background-color: transparent;
}

[class^="_bar"]>* {
    opacity: 0;
}

/* Hide bottom left controls completely - no hover reveal */
[data-test="add-to-playlist"],
[data-test="remove-from-playlist"], 
[data-test="like-toggle"],
[data-test="dislike-toggle"],
[data-test="favorite-toggle"],
[data-test="heart-button"],
[data-test="playlist-add"],
[class*="_trackActions"],
[class*="_bottomLeftControls"],
[class*="_actionButtons"],
[class*="_favoriteButton"],
[class*="_addToPlaylist"],
[class*="_lowerLeft"],
[class*="_bottomActions"],
[class*="_mediaControls"] > div:first-child,
button[title*="Add to"],
button[title*="Remove from"],
button[title*="Like"],
button[title*="Favorite"],
button[title*="Heart"],
button[aria-label*="Add to"],
button[aria-label*="Remove from"],
button[aria-label*="Like"],
button[aria-label*="Favorite"],
button[aria-label*="Heart"],
/* Target buttons in bottom left area specifically */
[class*="_nowPlayingContainer"] button[class*="_button"]:not(.unhide-ui-button),
[class*="_nowPlayingContainer"] [class*="_iconButton"]:not(.unhide-ui-button),
/* Additional catch-all for bottom left area buttons */
[class*="_nowPlayingContainer"] > div > div:first-child button:not(.unhide-ui-button),
[class*="_nowPlayingContainer"] > div:first-child button:not(.unhide-ui-button) {
    display: none !important;
}

/* Keep the Unhide button always visible with special styling */
.unhide-ui-button {
    opacity: 1 !important;
    display: flex !important;
}
`;

const themeUrl = "https://raw.githubusercontent.com/itzzexcel/neptune-projects/refs/heads/main/plugins/plugins/not-actual-fullscreen/src/separated-lyrics.css";

function ApplyCSS(style: string): HTMLStyleElement {
    const styleElement = document.createElement("style");
    styleElement.type = "text/css";
    styleElement.textContent = style;
    document.head.appendChild(styleElement);
    return styleElement;
}

async function HttpGet(url: string): Promise<string | null> {
    try {
        const content = await ftch.text(url);
        return content;
    } catch (error) {
        trace.msg.err(`Failed to fetch URL: ${error instanceof Error ? error.message : String(error)}`);
        return null;
    }
}

var isCleanView = false;
var appliedStyle: HTMLStyleElement | null = null;
var currentTrackSrc: string | null = null; // Track current album art to prevent unnecessary updates

const updateButtonStates = function(): void {
    const hideButton = document.querySelector('.hide-ui-button') as HTMLElement;
    const unhideButton = document.querySelector('.unhide-ui-button') as HTMLElement;
    
    if (hideButton) {
        hideButton.style.display = isCleanView ? 'none' : 'flex';
    }
    if (unhideButton) {
        unhideButton.style.display = isCleanView ? 'flex' : 'none';
    }
};

const toggleCleanView = function(): void {
    if (isCleanView) {
        if (appliedStyle) {
            appliedStyle.remove();
            appliedStyle = null;
        }
    } else {
        appliedStyle = ApplyCSS(styles);
        // Debug: Log bottom-left buttons to help identify selectors
        //debugBottomLeftButtons();
    }
    isCleanView = !isCleanView;
    updateButtonStates();
};

// const debugBottomLeftButtons = function(): void {
//     setTimeout(() => {
//         const nowPlayingContainer = document.querySelector('[class*="_nowPlayingContainer"]');
//         if (nowPlayingContainer) {
//             const buttons = nowPlayingContainer.querySelectorAll('button');
//             //trace.msg.log(`Found ${buttons.length} buttons in now playing container:`);
//             buttons.forEach((button, index) => {
//                 const classes = button.className;
//                 const dataTest = button.getAttribute('data-test');
//                 const title = button.getAttribute('title');
//                 const ariaLabel = button.getAttribute('aria-label');
//                 //trace.msg.log(`Button ${index}: classes="${classes}", data-test="${dataTest}", title="${title}", aria-label="${ariaLabel}"`);
//             });
//         }
//     }, 1000);
// };

const createHideUIButton = function(): void {
    setTimeout(() => {
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
        
        hideUIButton.onclick = toggleCleanView;

        // Insert after the fullscreen button
        buttonContainer.insertBefore(hideUIButton, fullscreenButton.nextSibling);
        
        //trace.msg.log("Hide UI button added next to fullscreen button");
        updateButtonStates();
    }, 1000);
};

const createUnhideUIButton = function(): void {
    setTimeout(() => {
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
        
        unhideUIButton.onclick = toggleCleanView;

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
        const fullscreenButton = document.querySelector('[data-test="request-fullscreen"]');
        if (fullscreenButton && !document.querySelector('.hide-ui-button')) {
            createHideUIButton();
        }
        
        // Create unhide button if it doesn't exist
        if (!document.querySelector('.unhide-ui-button')) {
            createUnhideUIButton();
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
};

// STYLES FOR THE LYRICS - Added Top-level async since Luna plugins are modules <3
const style = await HttpGet(themeUrl);
const styleElement = style ? ApplyCSS(style) : null;

// Initialize the button creation and observers
observeForButtons();
observeTrackTitle();
onTrackChanged(1);

// Add cleanup to unloads
unloads.add(() => {
    if (styleElement && styleElement.parentNode) {
        styleElement.parentNode.removeChild(styleElement);
    }

    if (appliedStyle && appliedStyle.parentNode) {
        appliedStyle.parentNode.removeChild(appliedStyle);
    }

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

    // Clean up spin animation
    const spinAnimationStyle = document.querySelector('#spinAnimation');
    if (spinAnimationStyle && spinAnimationStyle.parentNode) {
        spinAnimationStyle.parentNode.removeChild(spinAnimationStyle);
    }
}); 