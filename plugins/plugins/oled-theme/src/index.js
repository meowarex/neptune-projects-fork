require("./tracer")
import { Tracer } from "./tracer";
import { intercept, store, utils } from "@neptune"

const trace = Tracer("[OLED Theme]");
const themeUrl = "https://raw.githubusercontent.com/ItzzExcel/neptune-projects/refs/heads/main/themes/black-neptune-theme.css";

let style;
let styleElement;
const titleObserver = new MutationObserver((mutations) => {
    mutations.forEach(() => {
        onTrackChanged();
    });
});

function observeTrackTitle() {
    const trackTitleElement = document.querySelector('span[data-test="now-playing-track-title"]');
    if (trackTitleElement) {
        titleObserver.observe(trackTitleElement, {
            characterData: true,
            childList: true
        });
    }
}

function ApplyCSS(style) {
    const styleElement = document.createElement("style");
    styleElement.type = "text/css";
    if (styleElement.styleSheet) styleElement.styleSheet.cssText = style;
    else styleElement.appendChild(document.createTextNode(style));

    document.head.appendChild(styleElement);
    return styleElement;
}

function CleanUpCSS() {
    if (styleElement && styleElement.parentNode) {
        styleElement.parentNode.removeChild(styleElement);
    }
}

async function HttpGet(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const content = await response.text();
        return content;
    } catch (error) {
        trace.msg.err(`Failed to fetch URL: ${error.message}`);
        return null;
    }
}

// Since HttpGet is async, we need to await its result
(async () => {
    style = await HttpGet(themeUrl);
    styleElement = ApplyCSS(style);
})();

const onTrackChanged = function (method = 0) {
    // Tu amor tan liminal, tu amor tan liminal
    // - Ghouljaboy, 2021

    if (method === 1) {
        setTimeout(() => {
            onTrackChanged();
            return;
        }, 2000);
    }

    let albumImageElement = document.querySelector('figure[class*="albumImage"] > div > div > div > img');
    let albumImageSrc;

    if (albumImageElement) {
        albumImageSrc = albumImageElement.src;

        // Set res to 1280x1280
        albumImageSrc = albumImageSrc.replace(/\d+x\d+/, '1280x1280');
        albumImageElement.src = albumImageSrc;
    }

    // Setting background to the *="nowPlayingContainer" element
    let nowPlayingContainerElement = document.querySelector('[class*="nowPlayingContainer"]');
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
        centerImg.style.filter = 'blur(100px) brightness(0.6) contrast(1.2) saturate(1)';
        centerImg.style.animation = 'spin 35s linear infinite';
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
        centerImg2.style.filter = 'blur(100px) brightness(0.6) contrast(1.2) saturate(1)';
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

const cleanUpDynamicArt = function () {
    [...document.getElementsByClassName("corner-image")].forEach((element) => {
        element.remove();
    });
}

// const onTrackPaused = function ([track]) {
//     [...document.getElementsByClassName("corner-image")].forEach((element) => {
//         element.style.animation = "spin 50s linear infinite";
//     });
// }

// const onTrackResumed = function ([track]) {
//     [...document.getElementsByClassName("corner-image")].forEach((element) => {
//         element.style.animation = "spin 20s linear infinite";
//     });
// }
const PLAYBACK_EVENTS = [
    "playbackControls/PREFILL_MEDIA_PRODUCT_TRANSITION",
    "playbackControls/MEDIA_PRODUCT_TRANSITION",
    "playbackControls/SEEK",
    "playbackControls/SET_PLAYBACK_STATE",
    "playbackControls/TIME_UPDATE",
    // "playbackControls/"
];

const unsubscribeFunctions = PLAYBACK_EVENTS.map(event => 
    intercept(event, onTrackChanged)
);

observeTrackTitle();

export function onUnload() {
    CleanUpCSS();
    unsubscribeFunctions.forEach(unsubscribe => unsubscribe());
    cleanUpDynamicArt();
    titleObserver.disconnect();
}