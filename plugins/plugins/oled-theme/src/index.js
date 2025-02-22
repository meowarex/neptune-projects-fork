require("./tracer")
import { Tracer } from "./tracer";
import { intercept, store } from "@neptune"

const trace = Tracer("[OLED Theme]");
const themeUrl = "https://raw.githubusercontent.com/ItzzExcel/neptune-projects/refs/heads/main/themes/black-neptune-theme.css";

let style;
let styleElement;

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
    // trace.msg.log("CSS Applied!");
})();

function onTrackChanged([track]) {
    /* How to get the album cover URL 💔💔💔 */
}

intercept("playbackControls/PREFILL_MEDIA_PRODUCT_TRANSITION", onTrackChanged);
intercept("playbackControls/MEDIA_PRODUCT_TRANSITION", onTrackChanged);

export function onUnload() {
    CleanUpCSS();
}