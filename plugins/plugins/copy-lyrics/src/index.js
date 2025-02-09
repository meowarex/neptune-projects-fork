import toast, { Toaster } from 'react-hot-toast';

const unlockSelection = `
[class^="lyricsText"]>div>span {
    user-select: text;
    cursor: text;
}`;

function ApplyCSS(style) {
	const styleElement = document.createElement('style');
	styleElement.type = 'text/css';
	if (styleElement.styleSheet)
		styleElement.styleSheet.cssText = style;
	else
		styleElement.appendChild(document.createTextNode(style));

	document.head.appendChild(styleElement);
}
function SetClipboar(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed'; // Avoid scrolling to the bottom
    document.body.appendChild(textarea);
    textarea.select();

    try {
        const success = document.execCommand('copy');
        if (success) {
            console.log('Text copied to clipboard:', text);
            toast.success('Copied to clipboard!');
        } else {
            throw new Error('Failed to copy text.');
        }
    } catch (err) {
        console.error('Failed to copy text:', err);
        toast.error('Failed to copy to clipboard!');
    } finally {
        document.body.removeChild(textarea);
    }
}

ApplyCSS(unlockSelection);

let isSelecting = false;

document.addEventListener('mousedown', function() {
    isSelecting = true;
});

document.addEventListener('mouseup', function() {
    if (isSelecting) {
        const selection = window.getSelection();
        if (selection.toString().length > 0) {
            let text = selection.toString();
			SetClipboar(text);
			toast.success("Copied to clipboard!");
			if (window.getSelection) {
				const selection = window.getSelection();
				selection.removeAllRanges();
			}
        } else {
            
        }
        isSelecting = false;
    }
});

export function onUnload() {
	console.log("Goodbye world!");
}
