import { LunaUnload, Tracer } from "@luna/core";
import { settings, Settings } from "./Settings";

// Import CSS files directly using Luna's file:// syntax
import darkTheme from "file://dark-theme.css?minify";
import oledFriendlyTheme from "file://oled-friendly.css?minify";
import lightTheme from "file://light-theme.css?minify";

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
    
    // Choose the appropriate CSS file based on settings
    let selectedStyle: string;
    
    if (settings.lightMode) {
        // Light mode always uses the full light theme (OLED friendly doesn't apply to light theme)
        selectedStyle = lightTheme;
    } else {
        // Dark mode - choose between full dark theme or OLED friendly version
        selectedStyle = settings.oledFriendlyButtons ? oledFriendlyTheme : darkTheme;
    }
    
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