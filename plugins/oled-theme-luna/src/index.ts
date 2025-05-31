import { LunaUnload, Tracer, ftch } from "@luna/core";

export const { trace } = Tracer("[OLED Theme]");

const themeUrl = "https://raw.githubusercontent.com/ItzzExcel/neptune-projects/refs/heads/main/themes/black-neptune-theme.css";

// called when plugin is unloaded.
// clean up resources
export const unloads = new Set<LunaUnload>();

// Added Top-level async since Luna plugins are modules <3
const style = await ftch.text(themeUrl).catch((error: Error) => {
    trace.msg.err(`Failed to fetch theme CSS: ${error.message}`);
    return null;
});

// Apply the OLED theme if CSS was fetched successfully
if (style) {
    const styleElement = document.createElement("style");
    styleElement.type = "text/css";
    styleElement.textContent = style;
    document.head.appendChild(styleElement);
    
    // Add cleanup to unloads
    unloads.add(() => {
        if (styleElement.parentNode) {
            styleElement.parentNode.removeChild(styleElement);
        }
    });
} 