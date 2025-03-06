require("./tracer");
import { Tracer } from "./tracer";

const trace = Tracer("[Copy Lyrics]");

const unlockSelection = `
[class^="_lyricsText"]>div>span {
    user-select: text;
    cursor: text;
}

::selection {
    background: rgb(0, 0, 0);
    color: rgb(255, 255, 255);
}
`;

function ApplyCSS(style) {
    const styleElement = document.createElement("style");
    styleElement.type = "text/css";
    if (styleElement.styleSheet) styleElement.styleSheet.cssText = style;
    else styleElement.appendChild(document.createTextNode(style));

    document.head.appendChild(styleElement);
    return styleElement;
}

function SetClipboard(text) {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed"; // Avoid scrolling to bottom
    document.body.appendChild(textarea);
    textarea.select();

    try {
        const success = document.execCommand("copy");
        if (!success) throw new Error("Failed to copy text.");
    } catch (err) {
        trace.msg.err(err);
    } finally {
        document.body.removeChild(textarea);
    }
}

const styleElement = ApplyCSS(unlockSelection);

let isSelecting = false;

const onMouseDown = function () {
    isSelecting = true;
};

const onMouseUp = function (event) {
    if (isSelecting) {
        const selection = window.getSelection();
        if (selection.toString().length > 0) {
            const selectedSpans = [];
            const range = selection.getRangeAt(0);
            let container = range.commonAncestorContainer;
            // If the container is NOT and element and a document, try to adjust it.
            if (
                container.nodeType !== Node.ELEMENT_NODE &&
                container.nodeType !== Node.DOCUMENT_NODE
            ) {
                // Get the parent element if it's a text node
                const parentElement = container.parentElement;
                if (parentElement && parentElement.hasAttribute("data-current") || container.ELEMENT_NODE.hasAttribute("data-current")) {
                    let text_ = selection.toString().trim();
                    SetClipboard(text_);
                    trace.msg.log("Copied to clipboard!");

                    return;
                }
            }

            // Get all the spans inside the container.
            const spans = container.getElementsByTagName("span");
            for (let span of spans) {
                if (selection.containsNode(span, true)) {
                    selectedSpans.push(span);
                }
            }

            // Concat the text of the selected spans.
            let hasCorrectAttribute = false;
            let text = "";
            selectedSpans.forEach((span) => {
                if (span.hasAttribute("data-current")) {
                    hasCorrectAttribute = true;
                    text += span.textContent + "\n";
                    if ([...span.classList].some((className) => className.startsWith("endOfStanza--"))) {
                        text += "\n";
                    }
                }
            });

            if (hasCorrectAttribute) {
                console.log(hasCorrectAttribute);
            }

            text = text.trim();

            if (hasCorrectAttribute === true) {
                SetClipboard(text);
                trace.msg.log("Copied to clipboard!");
                if (window.getSelection) {
                    selection.removeAllRanges();
                }
            }

        }
        isSelecting = false;
    }
};

document.addEventListener("mousedown", onMouseDown);
document.addEventListener("mouseup", onMouseUp);

export function onUnload() {
    if (styleElement && styleElement.parentNode) {
        styleElement.parentNode.removeChild(styleElement);
    }

    document.removeEventListener("mousedown", onMouseDown);
    document.removeEventListener("mouseup", onMouseUp);
}
