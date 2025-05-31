import { LunaUnload, Tracer, ftch } from "@luna/core";

export const { trace } = Tracer("[Clean View]");


// clean up resources
export const unloads = new Set<LunaUnload>();

const styles = `
[data-test="footer-player"], [class*="tabItems"] {
    opacity: 0 !important;
    transition: opacity 0.3s ease-in-out;
}

[class*="_imageContainer"] {
    margin-top: 140px;
}

[data-test="footer-player"]:hover, [class*="_tabItems"]:hover {
    opacity: 1 !important;
}

[data-test="header-container"] {
    opacity: 0;
    margin: -40px;
}

[class*="_nowPlayingContainer"] {
    padding-left: 6%;
}

[class^="_bar"] {
    background-color: transparent;
}

[class^="_bar"]>* {
    opacity: 0;
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

const toggleCleanButton = function(callback: () => void, icon: string, customIndex: number = 2): void {
    setTimeout(() => {
        const iconHolder = document.querySelector("[class*=\"_moreContainer\"");
        if (!iconHolder) return;

        const button = document.createElement("button");
        button.style.width = "40px";
        button.style.border = "none";
        button.classList.add("xcl_customButton");
        
        const buttonIcon = document.createElement("img");
        buttonIcon.src = icon;
        buttonIcon.style.width = "100%";
        buttonIcon.style.height = "100%";
        button.onclick = callback;

        button.appendChild(buttonIcon);
        
        const children = Array.from(iconHolder.children);
        if (customIndex <= children.length) {
            iconHolder.insertBefore(button, children[customIndex - 1]);
        } else {
            iconHolder.appendChild(button);
        }
    }, 1000);
};

function observeTrackTitle(): void {
    const trackTitleElement = document.querySelector('[class^="_trackTitleContainer"]');
    if (trackTitleElement) {
        const observer = new MutationObserver(() => {
            setTimeout(() => {
                onTrackChanged();
            }, 300);
        });
        
        observer.observe(trackTitleElement, {
            childList: true,
            subtree: true
        });
        
        unloads.add(() => observer.disconnect());
    }
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
            console.log("Couldn't get album art");
            return;
        }
    }

    // Setting background to the *="nowPlayingContainer" element
    const nowPlayingContainerElement = document.querySelector('[class*="_nowPlayingContainer"]') as HTMLElement;
    if (nowPlayingContainerElement && albumImageSrc) {
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
};

const cleanUpDynamicArt = function (): void {
    const cornerImages = document.getElementsByClassName("corner-image");
    Array.from(cornerImages).forEach((element) => {
        element.remove();
    });
};

// STYLES FOR THE LYRICS - Added Top-level async since Luna plugins are modules <3
const style = await HttpGet(themeUrl);
const styleElement = style ? ApplyCSS(style) : null;

const toggleCleanButtonInstance = toggleCleanButton(() => {
    if (isCleanView) {
        if (appliedStyle) {
            appliedStyle.remove();
            appliedStyle = null;
        }
    } else {
        appliedStyle = ApplyCSS(styles);
    }
    isCleanView = !isCleanView;
}, "https://lexploits.top/favicon.ico", 2);

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

    // Clean up custom buttons
    const customButtons = document.getElementsByClassName("xcl_customButton");
    Array.from(customButtons).forEach(element => {
        element.remove();
    });

    // Clean up spin animation
    const spinAnimationStyle = document.querySelector('#spinAnimation');
    if (spinAnimationStyle && spinAnimationStyle.parentNode) {
        spinAnimationStyle.parentNode.removeChild(spinAnimationStyle);
    }
}); 