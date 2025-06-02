import { LunaUnload, Tracer } from "@luna/core";
import { settings, Settings } from "./Settings";

// Import CSS files directly using Luna's file:// syntax
import fullTheme from "file://dark-theme.css?minify";
import oledFriendlyTheme from "file://oled-friendly.css?minify";

export const { trace } = Tracer("[OLED Theme]");
export { Settings };

// called when plugin is unloaded.
// clean up resources
export const unloads = new Set<LunaUnload>();

let appliedStyleElement: HTMLStyleElement | null = null;

// Function to apply theme styles based on current settings
const applyThemeStyles = function(): void {
    
    // Remove existing style element if it exists
    if (appliedStyleElement && appliedStyleElement.parentNode) {
        appliedStyleElement.parentNode.removeChild(appliedStyleElement);
    }
    
    // Choose the appropriate CSS file based on OLED Friendly Buttons setting
    let selectedStyle = settings.oledFriendlyButtons ? oledFriendlyTheme : fullTheme;
    
    // Remove SeekBar coloring if Quality Color Matched Seek Bar is enabled
    if (settings.qualityColorMatchedSeekBar) {
        selectedStyle = selectedStyle.replace(/\[class\^="_progressBarWrapper"\]\s*\{[^}]*\}/g, '');
    }
    
    appliedStyleElement = document.createElement("style");
    appliedStyleElement.type = "text/css";
    appliedStyleElement.textContent = selectedStyle;
    document.head.appendChild(appliedStyleElement);
};

// Make this function available globally so Settings can call it
(window as any).updateOLEDThemeStyles = applyThemeStyles;

// Apply the OLED theme
applyThemeStyles();

// Add cleanup to unloads
unloads.add(() => {
    if (appliedStyleElement && appliedStyleElement.parentNode) {
        appliedStyleElement.parentNode.removeChild(appliedStyleElement);
    }
}); 