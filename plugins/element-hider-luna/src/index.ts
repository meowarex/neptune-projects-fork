import { LunaUnload, Tracer } from "@luna/core";
import { StyleTag, ContextMenu } from "@luna/lib";

// Import CSS directly using Luna's file:// syntax
import styles from "file://styles.css?minify";

export const { trace } = Tracer("[Element Hider]");

// Clean up resources
export const unloads = new Set<LunaUnload>();

// StyleTag for element hider styling
const styleTag = new StyleTag("Element-Hider", unloads, styles);

// State management
let targetElement: HTMLElement | null = null;
let hiddenElements = new WeakSet<HTMLElement>();
let hiddenElementsArray: HTMLElement[] = []; // Keep array for iteration since WeakSet isn't iterable



// Hide element directly without animation (for restoration)
function hideElementDirectly(element: HTMLElement): void {
    element.classList.add("element-hider-hidden");
    hiddenElements.add(element);
    hiddenElementsArray.push(element);
}

// Hide the target element with animation
function hideTargetElement(): void {
    if (!targetElement) return;
    
    trace.msg.log(`Hiding element: ${targetElement.tagName}${targetElement.className ? '.' + targetElement.className.split(' ').join('.') : ''}`);
    
    // Add hiding animation class
    targetElement.classList.add("element-hider-hiding");
    
    // Store reference to the element
    const elementToHide = targetElement;
    
    // Wait for animation to complete, then hide
    setTimeout(() => {
        elementToHide.classList.add("element-hider-hidden");
        elementToHide.classList.remove("element-hider-hiding", "element-hider-target");
        hiddenElements.add(elementToHide);
        hiddenElementsArray.push(elementToHide);
    }, 300);
    
    // Clear target reference
    targetElement = null;
}

// Show all hidden elements
function showAllElements(): void {
    trace.msg.log(`Showing ${hiddenElementsArray.length} hidden elements`);
    
    // Use array to iterate and show all hidden elements
    hiddenElementsArray.forEach(element => {
        // Check if element is still in DOM
        if (document.body.contains(element)) {
            element.classList.remove("element-hider-hidden", "element-hider-hiding");
        }
    });
    
    // Clear both collections
    hiddenElements = new WeakSet<HTMLElement>();
    hiddenElementsArray = [];
}

// Handle highlighting target element on hover
function highlightElement(element: HTMLElement): void {
    // Remove previous highlights
    document.querySelectorAll('.element-hider-target').forEach(el => {
        el.classList.remove('element-hider-target');
    });
    
    // Highlight current element
    element.classList.add('element-hider-target');
    targetElement = element;
}

// Remove highlight
function removeHighlight(): void {
    if (targetElement) {
        targetElement.classList.remove('element-hider-target');
        targetElement = null;
    }
}

// Context menu state management
let currentContextElement: HTMLElement | null = null;
let customMenu: HTMLElement | null = null;
let contextMenuTimeout: number | null = null;
let waitingForBuiltInMenu = false;

// Listen for right-click events to capture the target
document.addEventListener('contextmenu', (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    
    // Don't interfere with native context menus on inputs, textareas, etc.
    if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
        currentContextElement = null;
        return;
    }
    
    // Don't show menu on our own custom menu
    if (target.closest(".element-hider-custom-menu")) {
        return;
    }
    
    // Close any existing custom menu
    closeCustomMenu();
    
    // Store the right-clicked element and context
    currentContextElement = target;
    highlightElement(target);
    waitingForBuiltInMenu = true;
    
    // Store event coordinates for potential custom menu
    const eventX = event.clientX;
    const eventY = event.clientY;
    
    // Wait to see if the built-in context menu appears
    contextMenuTimeout = window.setTimeout(() => {
        // If we're still waiting and no built-in menu appeared, show our custom menu
        if (waitingForBuiltInMenu && currentContextElement) {
            event.preventDefault();
            showCustomMenu(eventX, eventY);
        }
        waitingForBuiltInMenu = false;
    }, 150); // Wait 150ms for built-in menu
    
    // Don't prevent default initially - let Luna try to handle the context menu
}, true);

// Listen for clicks to remove highlights and close custom menu
document.addEventListener('click', (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    
    // If clicking outside our custom menu, close it
    if (customMenu && !target.closest(".element-hider-custom-menu")) {
        closeCustomMenu();
    }
    
    removeHighlight();
}, true);

// Handle escape key to close custom menu
document.addEventListener('keydown', (event: KeyboardEvent) => {
    if (event.key === "Escape" && customMenu) {
        closeCustomMenu();
        removeHighlight();
    }
});

// Create custom context menu
function createCustomMenu(): HTMLElement {
    const menu = document.createElement("div");
    menu.className = "element-hider-custom-menu";
    
    // Hide Element option
    const hideItem = document.createElement("button");
    hideItem.className = "element-hider-menu-item";
    hideItem.innerHTML = `Hide This Element`;
    hideItem.addEventListener("click", () => {
        if (currentContextElement) {
            targetElement = currentContextElement;
            hideTargetElement();
            closeCustomMenu();
        }
    });
    
    // Show All Elements option
    const showAllItem = document.createElement("button");
    showAllItem.className = "element-hider-menu-item";
    showAllItem.innerHTML = `Show All Hidden Elements (${hiddenElementsArray.length})`;
    showAllItem.addEventListener("click", () => {
        showAllElements();
        closeCustomMenu();
    });
    
    menu.appendChild(hideItem);
    menu.appendChild(showAllItem);
    
    return menu;
}

// Show custom context menu
function showCustomMenu(x: number, y: number): void {
    closeCustomMenu();
    
    customMenu = createCustomMenu();
    document.body.appendChild(customMenu);
    
    // Position the menu
    const rect = customMenu.getBoundingClientRect();
    const finalX = Math.min(x, window.innerWidth - rect.width - 10);
    const finalY = Math.min(y, window.innerHeight - rect.height - 10);
    
    customMenu.style.left = `${finalX}px`;
    customMenu.style.top = `${finalY}px`;
    
    trace.msg.log(`Custom context menu opened for element: ${currentContextElement?.tagName}${currentContextElement?.className ? '.' + currentContextElement.className.split(' ').join('.') : ''}`);
}

// Close custom context menu
function closeCustomMenu(): void {
    if (customMenu) {
        customMenu.remove();
        customMenu = null;
    }
    
    if (contextMenuTimeout) {
        clearTimeout(contextMenuTimeout);
        contextMenuTimeout = null;
    }
}

// Try to hook into the context menu when it appears
const contextMenuObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
                const element = node as HTMLElement;
                
                // Look for Tidal's context menu
                if (element.matches('[data-test="contextmenu"]') || element.querySelector('[data-test="contextmenu"]')) {
                    const contextMenu = element.matches('[data-test="contextmenu"]') ? element : element.querySelector('[data-test="contextmenu"]') as HTMLElement;
                    
                    if (contextMenu && currentContextElement && waitingForBuiltInMenu) {
                        // Built-in menu appeared, cancel custom menu timeout
                        waitingForBuiltInMenu = false;
                        if (contextMenuTimeout) {
                            clearTimeout(contextMenuTimeout);
                            contextMenuTimeout = null;
                        }
                        addElementHiderOptions(contextMenu);
                    }
                }
            }
        });
    });
});

// Add our options to the existing context menu
function addElementHiderOptions(contextMenu: HTMLElement): void {
    // Create hide element button
    const hideButton = document.createElement('button');
    hideButton.className = 'element-hider-menu-item';
    hideButton.style.cssText = `
        display: flex;
        align-items: center;
        padding: 8px 16px;
        cursor: pointer;
        color: var(--wave-color-text, #ffffff);
        background: transparent;
        border: none;
        width: 100%;
        text-align: left;
        transition: background-color 0.15s ease;
        font-family: inherit;
        font-size: 14px;
    `;
    hideButton.innerHTML = `Hide This Element`;
    
    hideButton.addEventListener('click', () => {
        if (currentContextElement) {
            targetElement = currentContextElement;
            hideTargetElement();
        }
    });
    
    // Create show all button
    const showAllButton = document.createElement('button');
    showAllButton.className = 'element-hider-menu-item';
    showAllButton.style.cssText = hideButton.style.cssText;
    showAllButton.innerHTML = `Show All Hidden Elements (${hiddenElementsArray.length})`;
    
    showAllButton.addEventListener('click', showAllElements);
    
    // Add hover effects
    const buttons = [hideButton, showAllButton];
    
    buttons.forEach(button => {
        button.addEventListener('mouseenter', () => {
            button.style.background = 'var(--wave-color-background-hover, #3a3a3a)';
        });
        button.addEventListener('mouseleave', () => {
            button.style.background = 'transparent';
        });
    });
    
    // Add a separator if the menu has other items
    if (contextMenu.children.length > 0) {
        const separator = document.createElement('div');
        separator.style.cssText = `
            height: 1px;
            background: var(--wave-color-border, #444);
            margin: 4px 8px;
        `;
        contextMenu.appendChild(separator);
    }
    
    // Add our buttons
    contextMenu.appendChild(hideButton);
    contextMenu.appendChild(showAllButton);
}

// Start observing for context menus
contextMenuObserver.observe(document.body, {
    childList: true,
    subtree: true
});

// Add cleanup to unloads
unloads.add(() => {
    // Stop observing for context menus
    contextMenuObserver.disconnect();
    
    // Close any open custom menu
    closeCustomMenu();
    
    // Remove highlights
    removeHighlight();
    
    // Show all hidden elements when plugin is unloaded
    showAllElements();
    
    trace.msg.log("Element Hider plugin unloaded");
});

trace.msg.log("Element Hider plugin loaded - Right-click any element to hide it!"); 