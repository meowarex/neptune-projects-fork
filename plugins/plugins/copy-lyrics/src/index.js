/*
TODO: Check for the span to be part of the lyrics div.
*/

require("./tracer")
import { Tracer } from "./tracer";

const trace = Tracer("[Copy Lyrics]");

const unlockSelection = `
[class^="lyricsText"]>div>span {
    user-select: text;
    cursor: text;
    
}

::selection {
    background:rgb(0, 0, 0);
    color:rgb(255, 255, 255);
}
`;

function ApplyCSS(style) {
    const styleElement = document.createElement('style');
    styleElement.type = 'text/css';
    if (styleElement.styleSheet)
        styleElement.styleSheet.cssText = style;
    else
        styleElement.appendChild(document.createTextNode(style));

    document.head.appendChild(styleElement);
}
function SetClipboard(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed'; // Avoid scrolling to the bottom
    document.body.appendChild(textarea);
    textarea.select();

    try {
        const success = document.execCommand('copy');
        if (!success) 
            throw new Error('Failed to copy text.');
        
    } catch (err) {
        trace.msg.err(err);
    } finally {
        document.body.removeChild(textarea);
    }
}

ApplyCSS(unlockSelection);

let isSelecting = false;

document.addEventListener('mousedown', function() {
    isSelecting = true;
});

document.addEventListener('mouseup', function (event) {
    if (isSelecting) {
        const selection = window.getSelection();
        if (selection.toString().length > 0) {
            const selectedSpans = [];
            const ranges = selection.getRangeAt(0);
            const container = ranges.commonAncestorContainer;
            
            // Get all spans within the selection
            const spans = container.getElementsByTagName('span');
            for (let span of spans) {
                if (selection.containsNode(span, true)) {
                    selectedSpans.push(span);
                }
            }

            // Concatenate text from selected spans
            let text = '';
            selectedSpans.forEach(span => {
                text += span.textContent + '\n';
                if ([...span.classList].some(className => className.startsWith('endOfStanza--'))) {
                    text += '\n';
                }
            });
            text = text.trim();

            SetClipboard(text);
            trace.msg.log("Copied to clipboard!");
            if (window.getSelection) {
                selection.removeAllRanges();
            }
        }
        isSelecting = false;
    }
});

export function onUnload() {
    if (styleElement && styleElement.parentNode) {
        styleElement.parentNode.removeChild(styleElement);
    }
    
    document.removeEventListener('mousedown', onMouseDown);
    document.removeEventListener('mouseup', onMouseUp);
}
