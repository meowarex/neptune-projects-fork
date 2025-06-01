import { LunaUnload, Tracer, ftch } from "@luna/core";
import { settings, Settings } from "./Settings";

export const { trace } = Tracer("[OLED Theme]");
export { Settings };

const themeUrl = "https://raw.githubusercontent.com/ItzzExcel/neptune-projects/refs/heads/main/themes/black-neptune-theme.css";

// called when plugin is unloaded.
// clean up resources
export const unloads = new Set<LunaUnload>();

let originalStyle: string | null = null;
let appliedStyleElement: HTMLStyleElement | null = null;

// Function to apply theme styles based on current settings
const applyThemeStyles = function(): void {
    if (!originalStyle) return;
    
    // Remove existing style element if it exists
    if (appliedStyleElement && appliedStyleElement.parentNode) {
        appliedStyleElement.parentNode.removeChild(appliedStyleElement);
    }
    
    let modifiedStyle = originalStyle;
    
    // Remove SeekBar coloring if Quality Color Matched Seek Bar is enabled
    if (settings.qualityColorMatchedSeekBar) {
        modifiedStyle = originalStyle.replace(/\[class\^="_progressBarWrapper"\]\s*\{[^}]*\}/g, '');
        trace.msg.log("OLED theme applied with SeekBar coloring removed");
    } else {
        trace.msg.log("OLED theme applied with original SeekBar coloring");
    }
    
    appliedStyleElement = document.createElement("style");
    appliedStyleElement.type = "text/css";
    appliedStyleElement.textContent = modifiedStyle;
    document.head.appendChild(appliedStyleElement);
};

// Make this function available globally so Settings can call it
(window as any).updateOLEDThemeStyles = applyThemeStyles;

// Added Top-level async since Luna plugins are modules <3
originalStyle = await ftch.text(themeUrl).catch((error: Error) => {
    trace.msg.err(`Failed to fetch theme CSS: ${error.message}`);
    return null;
});

// Apply the OLED theme if CSS was fetched successfully
if (originalStyle) {
    applyThemeStyles();
    
    // Add cleanup to unloads
    unloads.add(() => {
        if (appliedStyleElement && appliedStyleElement.parentNode) {
            appliedStyleElement.parentNode.removeChild(appliedStyleElement);
        }
    });
} 