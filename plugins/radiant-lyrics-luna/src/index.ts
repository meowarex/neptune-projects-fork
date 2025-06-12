import { LunaUnload, Tracer } from "@luna/core";
import { StyleTag, PlayState } from "@luna/lib";
import { settings, Settings } from "./Settings";

// Import CSS files directly using Luna's file:// syntax - Took me a while to figure out <3
import baseStyles from "file://styles.css?minify";
import playerBarHidden from "file://player-bar-hidden.css?minify";
import lyricsGlow from "file://lyrics-glow.css?minify";
import wordByWordCss from "file://word-by-word.css?minify";
import coverEverywhereCss from "file://cover-everywhere.css?minify";

export const { trace } = Tracer("[Radiant Lyrics]");
export { Settings };

// clean up resources
export const unloads = new Set<LunaUnload>();

// StyleTag instances for different CSS modules
const lyricsStyleTag = new StyleTag("RadiantLyrics-lyrics", unloads);
const baseStyleTag = new StyleTag("RadiantLyrics-base", unloads);
const playerBarStyleTag = new StyleTag("RadiantLyrics-player-bar", unloads);
const lyricsGlowStyleTag = new StyleTag("RadiantLyrics-lyrics-glow", unloads);
const wordByWordStyleTag = new StyleTag("RadiantLyrics-word-by-word", unloads);

let globalSpinningBgStyleTag: StyleTag | null = null;

// Performance optimized variables for cover everywhere
let globalBackgroundContainer: HTMLElement | null = null;
let globalBackgroundImage: HTMLImageElement | null = null;
let globalBlackBg: HTMLElement | null = null;
let currentGlobalCoverSrc: string | null = null;
let lastUpdateTime = 0;
const UPDATE_THROTTLE = 500; // Throttle updates to max once per 500ms

// Word-by-word tracking variables
interface EnhancedWord {
    time: number;
    word: string;
    endTime: number;
    isParenthetical: boolean;
    confidence: number;
    syllableCount: number;
}

interface EnhancedLyric {
    time: number;
    text: string;
    words: EnhancedWord[];
    confidence: number;
}

interface EnhancedLyricsResponse {
    enhancedLyrics: EnhancedLyric[];
}

let enhancedLyricsData: EnhancedLyric[] = [];
let currentTrackForLyrics: string | null = null;
let wordTrackingInterval: number | null = null;
let currentTime = 0;
let previousTime = -1;
let lastUpdated = Date.now();

// Apply lyrics glow styles if enabled
if (settings.lyricsGlowEnabled) {
    lyricsGlowStyleTag.css = lyricsGlow;
}

// Function to fetch enhanced lyrics from @vmohammad's Amazing API <3
const fetchEnhancedLyrics = async (tidalId: string): Promise<EnhancedLyric[] | null> => {
    try {
        trace.msg.log(`Fetching enhanced lyrics for track: ${tidalId}`);
        const response = await fetch(`https://api.vmohammad.dev/lyrics?tidal_id=${tidalId}`);
        
        if (!response.ok) {
            trace.msg.warn(`Failed to fetch enhanced lyrics: ${response.status}`);
            return null;
        }
        
        const data: EnhancedLyricsResponse = await response.json();
        trace.msg.log(`Successfully fetched ${data.enhancedLyrics?.length || 0} enhanced lyric lines`);
        return data.enhancedLyrics || null;
    } catch (error) {
        trace.msg.err(`Error fetching enhanced lyrics: ${error}`);
        return null;
    }
};

// Function to get current playback time
const getCurrentPlaybackTime = (): number => {
    // Try to get audio element first
    const audioElement = document.querySelector('audio') as HTMLAudioElement;
    if (audioElement && audioElement.currentTime) {
        currentTime = audioElement.currentTime;
        previousTime = -1;
        return currentTime;
    }
    
    // Fallback to progress bar
    const progressBar = document.querySelector('[data-test="progress-bar"]') as HTMLElement;
    if (progressBar) {
        const ariaValueNow = progressBar.getAttribute('aria-valuenow');
        if (ariaValueNow !== null) {
            const progressTime = Number.parseInt(ariaValueNow);
            const now = Date.now();

            if (progressTime !== previousTime) {
                currentTime = progressTime;
                previousTime = progressTime;
                lastUpdated = now;
            } else if (PlayState.playing) {
                const elapsedSeconds = (now - lastUpdated) / 1000;
                currentTime = progressTime + elapsedSeconds;
            }
            return currentTime;
        } else {
            trace.msg.warn("Progress bar not found or aria-valuenow is null");
            return currentTime; // Totally not that 1 code snippet I copied from the discord (Cheers @vmohammad)
        }
    }
    
    return currentTime;
};

// Function to convert a lyric line into word spans
const createWordSpans = (lyricLine: EnhancedLyric, lineElement: HTMLElement): void => {
    if (!settings.wordByWordGlowEnabled || !lyricLine.words || lyricLine.words.length === 0) {
        return;
    }
    
    // Store original text as backup
    const originalText = lineElement.textContent || '';
    
    // Clear existing content
    lineElement.innerHTML = '';
    
    // Create word spans
    lyricLine.words.forEach((word, index) => {
        const wordSpan = document.createElement('span');
        wordSpan.className = 'word-span';
        wordSpan.textContent = word.word;
        wordSpan.setAttribute('data-word-time', word.time.toString());
        wordSpan.setAttribute('data-word-end', word.endTime.toString());
        wordSpan.setAttribute('data-word-index', index.toString());
        
        lineElement.appendChild(wordSpan);
        
        // Add space between words (except for the last one)
        // HATE THIS SO MUCH BUT IM TIRED AF
        if (index < lyricLine.words.length - 1) {
            lineElement.appendChild(document.createTextNode(' '));
        }
    });
    
    // Store enhanced lyric data on the element for later reference
    (lineElement as any).__enhancedLyric = lyricLine;
    
    // If word creation failed, restore original text
    if (lineElement.children.length === 0) {
        lineElement.textContent = originalText;
    }
};

// Function to process all lyrics in advance
const processAllLyricsInAdvance = (): void => {
    if (!settings.wordByWordGlowEnabled || enhancedLyricsData.length === 0) {
        return;
    }
    
    // Get all lyric line elements
    const lyricsElements = document.querySelectorAll('[class*="_lyricsText"] > div > span');
    
    // Create a used set to prevent duplicate matching
    const usedLyrics = new Set<number>();
    let processedCount = 0;
    
    // Try to match enhanced lyrics with DOM elements by text content
    lyricsElements.forEach((element: Element) => {
        const lineElement = element as HTMLElement;
        const lineText = lineElement.textContent?.trim() || '';
        
        // Skip empty lines
        if (!lineText) return;
        
        // Find matching enhanced lyric by text content
        let bestMatch: { lyric: EnhancedLyric; index: number; score: number } | null = null;
        
        enhancedLyricsData.forEach((lyric, index) => {
            // Skip already used lyrics
            if (usedLyrics.has(index)) return;
            
            // Clean both texts for comparison
            const cleanLineText = lineText.toLowerCase()
                .replace(/[^\w\s'']/g, '') // Keep apostrophes for contractions
                .replace(/\s+/g, ' ')
                .trim();
            const cleanLyricText = lyric.text.toLowerCase()
                .replace(/[^\w\s'']/g, '') // Keep apostrophes for contractions  
                .replace(/\s+/g, ' ')
                .trim();
            
            let score = 0;
            
            // Exact match gets highest score
            if (cleanLineText === cleanLyricText) {
                score = 100;
            }
            // High similarity for lines that start/end the same
            else if (cleanLineText.startsWith(cleanLyricText) || cleanLyricText.startsWith(cleanLineText)) {
                score = 80;
            }
            // Medium similarity for lines that contain each other
            else if (cleanLyricText.includes(cleanLineText) || cleanLineText.includes(cleanLyricText)) {
                // Only accept if the difference isn't too large
                const lengthRatio = Math.min(cleanLineText.length, cleanLyricText.length) / 
                                  Math.max(cleanLineText.length, cleanLyricText.length);
                if (lengthRatio > 0.6) {
                    score = 60;
                }
            }
            // Word-level matching for similar lines
            else {
                const lineWords = cleanLineText.split(' ').filter(w => w.length > 2);
                const lyricWords = cleanLyricText.split(' ').filter(w => w.length > 2);
                
                if (lineWords.length > 0 && lyricWords.length > 0) {
                    const matchingWords = lineWords.filter(word => 
                        lyricWords.some(lyricWord => 
                            word === lyricWord || word.includes(lyricWord) || lyricWord.includes(word)
                        )
                    );
                    
                    const wordMatchRatio = matchingWords.length / Math.max(lineWords.length, lyricWords.length);
                    if (wordMatchRatio > 0.7) {
                        score = Math.floor(wordMatchRatio * 50);
                    }
                }
            }
            
            // Update best match if this is better
            if (score > 0 && (!bestMatch || score > bestMatch.score)) {
                bestMatch = { lyric, index, score };
            }
        });
        
        // Use the best match if it's good enough
        if (bestMatch && bestMatch.score >= 50) {
            usedLyrics.add(bestMatch.index);
            createWordSpans(bestMatch.lyric, lineElement);
            processedCount++;
            
            trace.msg.log(`Processed line: "${lineText}" → "${bestMatch.lyric.text}" (score: ${bestMatch.score}, words: ${bestMatch.lyric.words.length})`);
        } else {
            trace.msg.warn(`No good match for line: "${lineText}"`);
        }
    });
    
    trace.msg.log(`Processed ${processedCount}/${lyricsElements.length} lyric lines in advance`);
};

// Function to update word highlighting based on current time
const updateWordHighlighting = (): void => {
    if (!settings.wordByWordGlowEnabled) {
        return;
    }
    
    // Get current line
    const currentLyricElement = document.querySelector('[class*="_lyricsText"] > div > span[data-current="true"]') as HTMLElement;
    
    if (!currentLyricElement) {
        // Clear all highlights
        const allWordSpans = document.querySelectorAll('.word-span');
        if (allWordSpans.length > 0) {
            allWordSpans.forEach(span => {
                span.className = 'word-span'; // Reset to base class
            });
        }
        return;
    }
    
    // Get word spans for current line only
    const wordSpans = currentLyricElement.querySelectorAll('.word-span');
    if (wordSpans.length === 0) {
        return; // No processed words
    }
    
    // Get enhanced lyric data
    const enhancedLyric = (currentLyricElement as any).__enhancedLyric as EnhancedLyric;
    if (!enhancedLyric?.words?.length) {
        return;
    }
    
    // Get precise current time
    const currentTime = getCurrentPlaybackTime();
    
    // Clear highlights from other lines
    const otherLineSpans = document.querySelectorAll('[class*="_lyricsText"] > div > span:not([data-current="true"]) .word-span');
    if (otherLineSpans.length > 0) {
        otherLineSpans.forEach(span => {
            span.className = 'word-span';
        });
    }
    
    // Process words
    let activeWordFound = false;
    const wordCount = Math.min(wordSpans.length, enhancedLyric.words.length);
    
    for (let i = 0; i < wordCount; i++) {
        const wordElement = wordSpans[i] as HTMLElement;
        const word = enhancedLyric.words[i];
        
        // Convert time units
        const startTime = word.time > 1000 ? word.time / 1000 : word.time;
        const endTime = word.endTime > 1000 ? word.endTime / 1000 : word.endTime;
        
        // Reset classes
        wordElement.className = 'word-span';
        
        // timing logic
        if (!activeWordFound && currentTime >= startTime && currentTime <= endTime) {
            // Active word
            wordElement.classList.add('word-active');
            activeWordFound = true;
        } else if (currentTime < startTime) {
            // Upcoming word
            wordElement.classList.add('word-upcoming');
        } else if (currentTime > endTime) {
            // Past word
            wordElement.classList.add('word-past');
        }
    }
    
    // Fallback: find closest word if none are active
    if (!activeWordFound && wordCount > 0) {
        let closestIndex = 0;
        let minDistance = Infinity;
        
        for (let i = 0; i < wordCount; i++) {
            const word = enhancedLyric.words[i];
            const startTime = word.time > 1000 ? word.time / 1000 : word.time;
            const endTime = word.endTime > 1000 ? word.endTime / 1000 : word.endTime;
            const midTime = (startTime + endTime) / 2;
            const distance = Math.abs(currentTime - midTime);
            
            if (distance < minDistance) {
                minDistance = distance;
                closestIndex = i;
            }
        }
        
        // Only activate closest word if reasonably close (within 0.5 seconds)
        if (minDistance < 0.5) {
            const closestElement = wordSpans[closestIndex] as HTMLElement;
            closestElement.className = 'word-span word-active';
        }
    }
};

// Function to start/stop word tracking
const updateWordByWordTracking = (): void => {
    // Clear existing interval
    if (wordTrackingInterval) {
        clearInterval(wordTrackingInterval);
        wordTrackingInterval = null;
    }
    
    // Update body class for styling
    if (settings.wordByWordGlowEnabled) {
        document.body.classList.add('word-by-word-enabled');
        wordByWordStyleTag.css = wordByWordCss;
        
        // Process existing lyrics if we have enhanced data
        if (enhancedLyricsData.length > 0) {
            setTimeout(() => {
                processAllLyricsInAdvance();
            }, 500);
        }
        
        // Ultra-responsive word tracking with maximum performance
        let lastUpdateTime = 0;
        const targetFPS = 60; // 60 FPS for ultra-smooth, instant updates - No idea if this does anything but Claude said Yes
        const frameInterval = 1000 / targetFPS; // ~16.67ms intervals
        
        const updateLoop = (currentTime: number) => {
            if (!settings.wordByWordGlowEnabled) {
                return; // Stop if disabled
            }
            
            // Update every frame for maximum responsiveness
            if (PlayState.playing) {
                updateWordHighlighting();
            }
            
            // Continue the loop immediately
            wordTrackingInterval = requestAnimationFrame(updateLoop);
        };
        
        // Start the ultra-responsive update loop immediately
        wordTrackingInterval = requestAnimationFrame(updateLoop);
        
        trace.msg.log("Word-by-word tracking enabled with ultra-responsive timing");
    } else {
        document.body.classList.remove('word-by-word-enabled');
        wordByWordStyleTag.remove();
        
        // Restore original lyrics text for all modified lines
        const lyricsElements = document.querySelectorAll('[class*="_lyricsText"] > div > span');
        lyricsElements.forEach(element => {
            const wordSpans = element.querySelectorAll('.word-span');
            if (wordSpans.length > 0) {
                // Restore original text efficiently
                const originalText = Array.from(wordSpans).map(span => span.textContent).join(' ');
                element.innerHTML = '';
                element.textContent = originalText;
                // Remove stored enhanced lyric data
                delete (element as any).__enhancedLyric;
            }
        });
        
        trace.msg.log("Word-by-word tracking disabled");
    }
};

var isHidden = false;
let unhideButtonAutoFadeTimeout: number | null = null;

const updateButtonStates = function(): void {
    const hideButton = document.querySelector('.hide-ui-button') as HTMLElement;
    const unhideButton = document.querySelector('.unhide-ui-button') as HTMLElement;
    
    if (hideButton) {
        if (settings.hideUIEnabled && !isHidden) {
            hideButton.style.display = 'flex';
            // Small delay to ensure display is set first, then fade in
            setTimeout(() => {
                hideButton.style.opacity = '1';
                hideButton.style.visibility = 'visible';
                hideButton.style.pointerEvents = 'auto';
            }, 50);
        } else {
            // Hide UI button immediately when clicked - (couldn't get the fade to work)
            hideButton.style.display = 'none';
            hideButton.style.opacity = '0';
            hideButton.style.visibility = 'hidden';
            hideButton.style.pointerEvents = 'none';
        }
    }
    if (unhideButton) {
        // Clear any existing auto-fade timeout
        if (unhideButtonAutoFadeTimeout) {
            window.clearTimeout(unhideButtonAutoFadeTimeout);
            unhideButtonAutoFadeTimeout = null;
        }
        
        if (settings.hideUIEnabled && isHidden) {
            unhideButton.style.display = 'flex';
            // Remove the hide-immediately class and let it fade in smoothly
            unhideButton.classList.remove('hide-immediately');
            unhideButton.classList.remove('auto-faded');
            // Small delay to ensure display is set first, then fade in - (Works for unhide button.. but not hide button.. because uhh idk)
            setTimeout(() => {
                unhideButton.style.opacity = '1';
                unhideButton.style.visibility = 'visible';
                unhideButton.style.pointerEvents = 'auto';
                
                // Set up auto-fade after 2 seconds
                unhideButtonAutoFadeTimeout = window.setTimeout(() => {
                    if (isHidden && unhideButton && !unhideButton.matches(':hover')) {
                        unhideButton.classList.add('auto-faded');
                    }
                }, 2000);
            }, 50);
        } else {
            // Smooth fade out for Unhide UI button
            unhideButton.style.opacity = '0';
            unhideButton.style.visibility = 'hidden';
            unhideButton.style.pointerEvents = 'none';
            unhideButton.classList.remove('auto-faded');
            // Keep display: flex to maintain transitions, then hide after fade
            setTimeout(() => {
                if (unhideButton.style.opacity === '0') {
                    unhideButton.style.display = 'none';
                }
            }, 500); // Wait for transition to complete
        }
    }
};

// Function to update styles when settings change
const updateRadiantLyricsStyles = function(): void {
    if (isHidden) {
        // Apply only base styles (button hiding), NOT separated lyrics styles
        // to avoid affecting lyrics scrolling behavior
        baseStyleTag.css = baseStyles;
        
        // Apply player bar styles based on setting
        if (!settings.playerBarVisible) {
            playerBarStyleTag.css = playerBarHidden;
        } else {
            playerBarStyleTag.remove();
        }
    }

    // Update lyrics glow based on setting (only if UI is not hidden to avoid interference)
    const lyricsContainer = document.querySelector('[class^="_lyricsContainer"]');
    if (lyricsContainer && !isHidden) {
        if (settings.lyricsGlowEnabled) {
            lyricsContainer.classList.remove('lyrics-glow-disabled');
            lyricsGlowStyleTag.css = lyricsGlow;
        } else {
            lyricsContainer.classList.add('lyrics-glow-disabled');
            lyricsGlowStyleTag.remove();
        }
    }
};

// Function to apply spinning background to the entire app (cover everywhere)
const applyGlobalSpinningBackground = (coverArtImageSrc: string): void => {
    const appContainer = document.querySelector('[data-test="main"]') as HTMLElement;
    
    if (!settings.spinningCoverEverywhere) {
        cleanUpGlobalSpinningBackground();
        return;
    }

    // Throttle updates to prevent excessive DOM manipulation
    const now = Date.now();
    if (now - lastUpdateTime < UPDATE_THROTTLE && currentGlobalCoverSrc === coverArtImageSrc) {
        return;
    }
    lastUpdateTime = now;
    currentGlobalCoverSrc = coverArtImageSrc;

    // Add StyleTag if not present
    if (!globalSpinningBgStyleTag) {
        globalSpinningBgStyleTag = new StyleTag("RadiantLyrics-global-spinning-bg", unloads, coverEverywhereCss);
    }

    if (!appContainer) return;

    // Create container structure if it doesn't exist (REUSE DOM ELEMENTS)
    if (!globalBackgroundContainer) {
        globalBackgroundContainer = document.createElement('div');
        globalBackgroundContainer.className = 'global-background-container';
        globalBackgroundContainer.style.cssText = `
            position: fixed;
            left: 0;
            top: 0;
            width: 100vw;
            height: 100vh;
            z-index: -3;
            pointer-events: none;
            overflow: hidden;
        `;
        appContainer.appendChild(globalBackgroundContainer);

        // Create black background layer
        globalBlackBg = document.createElement('div');
        globalBlackBg.className = 'global-spinning-black-bg';
        globalBackgroundContainer.appendChild(globalBlackBg);

        // Create image element
        globalBackgroundImage = document.createElement('img');
        globalBackgroundImage.className = 'global-spinning-image';
        globalBackgroundImage.style.cssText = `
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            object-fit: cover;
            z-index: -1;
            will-change: transform;
            transform-origin: center center;
        `;
        globalBackgroundContainer.appendChild(globalBackgroundImage);
    }

    // Update image source efficiently
    if (globalBackgroundImage && globalBackgroundImage.src !== coverArtImageSrc) {
        globalBackgroundImage.src = coverArtImageSrc;
    }

    // Apply performance-optimized settings
    if (globalBackgroundImage) {
        // Performance mode optimizations
        if (settings.performanceMode) {
            // Performance mode with spinning enabled
            globalBackgroundImage.style.width = '120vw';
            globalBackgroundImage.style.height = '120vh';
            globalBackgroundImage.style.filter = `blur(${Math.min(settings.backgroundBlur, 20)}px) brightness(${settings.backgroundBrightness / 100}) contrast(${Math.min(settings.backgroundContrast, 150)}%)`;
            if (settings.spinningArtEnabled) {
                globalBackgroundImage.style.animation = `spinGlobal ${settings.spinSpeed}s linear infinite`;
                globalBackgroundImage.style.willChange = 'transform';
            }
            else {
                globalBackgroundImage.style.animation = 'none';
                globalBackgroundImage.style.willChange = 'auto';
            }
            globalBackgroundImage.classList.remove('performance-mode-static');
        } else {
            // Normal mode
            globalBackgroundImage.style.width = '150vw';
            globalBackgroundImage.style.height = '150vh';
            globalBackgroundImage.style.filter = `blur(${settings.backgroundBlur}px) brightness(${settings.backgroundBrightness / 100}) contrast(${settings.backgroundContrast}%)`;
            if (settings.spinningArtEnabled) {
                globalBackgroundImage.style.animation = `spinGlobal ${settings.spinSpeed}s linear infinite`;
                globalBackgroundImage.style.willChange = 'transform';
            }
            else {
                globalBackgroundImage.style.animation = 'none';
                globalBackgroundImage.style.willChange = 'auto';
            }
            globalBackgroundImage.classList.remove('performance-mode-static');
        }
    }
};

// Optimized cleanup function
const cleanUpGlobalSpinningBackground = function(): void {
    if (globalBackgroundContainer && globalBackgroundContainer.parentNode) {
        globalBackgroundContainer.parentNode.removeChild(globalBackgroundContainer);
    }
    globalBackgroundContainer = null;
    globalBackgroundImage = null;
    globalBlackBg = null;
    currentGlobalCoverSrc = null;
    
    if (globalSpinningBgStyleTag) {
        globalSpinningBgStyleTag.remove();
        globalSpinningBgStyleTag = null;
    }
};

// Function to update global background when settings change
const updateRadiantLyricsGlobalBackground = function(): void {
    // Apply performance mode class to document body
    if (settings.performanceMode) {
        document.body.classList.add('performance-mode');
    } else {
        document.body.classList.remove('performance-mode');
    }
    
    if (settings.spinningCoverEverywhere) {
        // Get current cover art and apply global background
        updateCoverArtBackground();
    } else {
        cleanUpGlobalSpinningBackground();
    }
};

// Function to update Now Playing background when settings change - PERFORMANCE OPTIMIZED
const updateRadiantLyricsNowPlayingBackground = function(): void {
    const nowPlayingBackgroundImages = document.querySelectorAll('.now-playing-background-image');
    nowPlayingBackgroundImages.forEach((img: Element) => {
        const imgElement = img as HTMLElement;
        
        // Default values when settings don't affect Now Playing
        const defaultBlur = 80;
        const defaultBrightness = 40;
        const defaultContrast = 120;
        const defaultSpinSpeed = 45;
        
        let blur, brightness, contrast, spinSpeed;
        
        if (settings.settingsAffectNowPlaying) {
            blur = settings.backgroundBlur;
            brightness = settings.backgroundBrightness;
            contrast = settings.backgroundContrast;
            spinSpeed = settings.spinSpeed;
        } else {
            blur = defaultBlur;
            brightness = defaultBrightness;
            contrast = defaultContrast;
            spinSpeed = defaultSpinSpeed;
        }
        
        // Performance mode optimizations
        if (settings.performanceMode) {
            // Reduce blur and effects for better performance, but keep spinning
            blur = Math.min(blur, 20);
            contrast = Math.min(contrast, 150);
            if (settings.spinningArtEnabled) {
            imgElement.style.animation = `spin ${spinSpeed}s linear infinite`;
            imgElement.style.willChange = 'transform';
            }
            else {
                imgElement.style.animation = 'none';
                imgElement.style.willChange = 'auto';
            }
            imgElement.classList.remove('performance-mode-static');
        } else {
            if (settings.spinningArtEnabled) {
            imgElement.style.animation = `spin ${spinSpeed}s linear infinite`;
            imgElement.style.willChange = 'transform';
            }
            else {
                imgElement.style.animation = 'none';
                imgElement.style.willChange = 'auto';
            }
            imgElement.classList.remove('performance-mode-static');
        }
        
        imgElement.style.filter = `blur(${blur}px) brightness(${brightness / 100}) contrast(${contrast}%)`;
    });
};

// Make these functions available globally so Settings can call them
(window as any).updateRadiantLyricsStyles = updateRadiantLyricsStyles;
(window as any).updateRadiantLyricsGlobalBackground = updateRadiantLyricsGlobalBackground;
(window as any).updateRadiantLyricsNowPlayingBackground = updateRadiantLyricsNowPlayingBackground;
(window as any).updateWordByWordTracking = updateWordByWordTracking;

const toggleRadiantLyrics = function(): void {
    const nowPlayingContainer = document.querySelector('[class*="_nowPlayingContainer"]') as HTMLElement;
    
    if (isHidden) {
        // currently hidden, so we're about to show UI
        // Add a class to immediately hide the unhide button with CSS
        const unhideButton = document.querySelector('.unhide-ui-button') as HTMLElement;
        if (unhideButton) {
            unhideButton.classList.add('hide-immediately'); // actually uses fade out but.. still
        }
        
        // Toggle the state
        isHidden = !isHidden;
        
        // Don't remove StyleTags completely, just remove the class to show elements again
        if (nowPlayingContainer) {
            nowPlayingContainer.classList.remove('radiant-lyrics-ui-hidden');
        }
        document.body.classList.remove('radiant-lyrics-ui-hidden');
        // Remove styles after animation completes (I think this is needed.. but not sure)
        setTimeout(() => {
            if (!isHidden) {
                lyricsStyleTag.remove();
                baseStyleTag.remove();
                playerBarStyleTag.remove();
            }
        }, 500); // Wait for fade animation to complete
        
        // Update button states normally
        updateButtonStates();
    } else {
        // We're currently visible, so we're about to hide UI
        // Toggle the state first
        isHidden = !isHidden;
        
        // Update button states immediately to start Hide UI button fade-out
        updateButtonStates();
        
        // Delay adding the CSS class to allow Hide UI button to fade out first - (Had issues with the fade out.. so I removed it)
        setTimeout(() => {
            // Apply clean view styles
            updateRadiantLyricsStyles();
            // Add a class to the container to trigger CSS animations
            if (nowPlayingContainer) {
                nowPlayingContainer.classList.add('radiant-lyrics-ui-hidden');
            }
            document.body.classList.add('radiant-lyrics-ui-hidden');
        }, 50); // Small delay to let Hide UI button start its fade transition - (Had issues with the fade out.. so I removed it)
    }
};

const createHideUIButton = function(): void {
    setTimeout(() => {
        // Only create button if Hide UI is enabled in settings
        if (!settings.hideUIEnabled) return;
        
        // Look for the fullscreen button's parent container
        const fullscreenButton = document.querySelector('[data-test="request-fullscreen"]');
        if (!fullscreenButton || !fullscreenButton.parentElement) {
            // Retry if fullscreen button not found yet
            setTimeout(() => createHideUIButton(), 1000);
            return;
        }

        // Check if our button already exists
        if (document.querySelector('.hide-ui-button')) return;

        const buttonContainer = fullscreenButton.parentElement;
        
        // Create our hide UI button
        const hideUIButton = document.createElement("button");
        hideUIButton.className = 'hide-ui-button';
        hideUIButton.setAttribute('aria-label', 'Hide UI');
        hideUIButton.setAttribute('title', 'Hide UI');
        hideUIButton.textContent = 'Hide UI';
        
        // Style to match Tidal's buttons
        hideUIButton.style.backgroundColor = 'var(--wave-color-solid-accent-fill)';
        hideUIButton.style.color = 'black';
        hideUIButton.style.border = 'none';
        hideUIButton.style.borderRadius = '12px';
        hideUIButton.style.height = '40px';
        hideUIButton.style.padding = '0 12px';
        hideUIButton.style.marginLeft = '8px';
        hideUIButton.style.cursor = 'pointer';
        hideUIButton.style.display = 'flex';
        hideUIButton.style.alignItems = 'center';
        hideUIButton.style.justifyContent = 'center';
        hideUIButton.style.fontSize = '12px';
        hideUIButton.style.fontWeight = '600';
        hideUIButton.style.whiteSpace = 'nowrap';
        hideUIButton.style.transition = 'opacity 0.5s ease-in-out, visibility 0.5s ease-in-out, background-color 0.2s ease-in-out';
        hideUIButton.style.opacity = '0';
        hideUIButton.style.visibility = 'hidden';
        hideUIButton.style.pointerEvents = 'none';
        
        // Add hover effect
        hideUIButton.addEventListener('mouseenter', () => {
            hideUIButton.style.backgroundColor = 'lightgray';
        });
        
        hideUIButton.addEventListener('mouseleave', () => {
            hideUIButton.style.backgroundColor = 'var(--wave-color-solid-accent-fill)';
        });
        
        hideUIButton.onclick = toggleRadiantLyrics;

        // Insert after the fullscreen button
        buttonContainer.insertBefore(hideUIButton, fullscreenButton.nextSibling);
        
        // Fade in the button after a small delay
        setTimeout(() => {
            if (settings.hideUIEnabled && !isHidden) {
                hideUIButton.style.opacity = '1';
                hideUIButton.style.visibility = 'visible';
                hideUIButton.style.pointerEvents = 'auto';
            }
        }, 100); // Small delay to ensure DOM insertion is complete
        
        //trace.msg.log("Hide UI button added next to fullscreen button");
    }, 1000);
};

const createUnhideUIButton = function(): void {
    setTimeout(() => {
        // Only create button if Hide UI is enabled in settings
        if (!settings.hideUIEnabled) return;
        
        // Check if our button already exists
        if (document.querySelector('.unhide-ui-button')) return;

        // Find the Now Playing container to place the button within it
        const nowPlayingContainer = document.querySelector('[class*="_nowPlayingContainer"]') as HTMLElement;
        if (!nowPlayingContainer) {
            // Retry if container not found yet
            setTimeout(() => createUnhideUIButton(), 1000);
            return;
        }

        // Create unhide UI button
        const unhideUIButton = document.createElement("button");
        unhideUIButton.className = 'unhide-ui-button';
        unhideUIButton.setAttribute('aria-label', 'Unhide UI');
        unhideUIButton.setAttribute('title', 'Unhide UI');
        unhideUIButton.textContent = 'Unhide';
        
        // Style for top-right positioning within the Now Playing container (is a pain)
        unhideUIButton.style.cssText = `
            position: absolute;
            top: 10px;
            right: 10px;
            background-color: rgba(255, 255, 255, 0.2);
            color: white;
            border: 1px solid rgba(255, 255, 255, 0.3);
            border-radius: 12px;
            height: 40px;
            padding: 0 12px;
            cursor: pointer;
            display: none;
            align-items: center;
            justify-content: center;
            transition: all 0.5s ease-in-out;
            font-size: 12px;
            font-weight: 600;
            white-space: nowrap;
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            z-index: 1000;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            opacity: 0;
            visibility: hidden;
            pointer-events: none;
        `;
        
        // Add hover effect with auto-fade handling
        unhideUIButton.addEventListener('mouseenter', () => {
            unhideUIButton.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
            unhideUIButton.style.transform = 'scale(1.05)';
            unhideUIButton.classList.remove('auto-faded');
        });
        
        unhideUIButton.addEventListener('mouseleave', () => {
            unhideUIButton.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
            unhideUIButton.style.transform = 'scale(1)';
            // Re-add auto-fade after a short delay if still in hidden mode
            window.setTimeout(() => {
                if (isHidden && !unhideUIButton.matches(':hover')) {
                    unhideUIButton.classList.add('auto-faded');
                }
            }, 2000);
        });
        
        unhideUIButton.onclick = toggleRadiantLyrics;

        // Append to the Now Playing container so it only shows there
        nowPlayingContainer.appendChild(unhideUIButton);
        
        //trace.msg.log("Unhide UI button added to top-right of Now Playing container");
        updateButtonStates();
    }, 1500); // Slight delay after hide button
};

// PERFORMANCE OPTIMIZED track change observer
const observeTrackChanges = (): void => {
    let lastTrackId: string | null = null;
    let checkCount = 0;
    let currentInterval = 500; // Start with slower checks
    
    const checkTrackChange = () => {
        const currentTrackId = PlayState.playbackContext?.actualProductId;
        if (currentTrackId && currentTrackId !== lastTrackId) {
            //trace.msg.log(`Track changed: ${lastTrackId} -> ${currentTrackId}`);
            lastTrackId = currentTrackId;
            // Immediate update for better responsiveness, but throttled by the update function
            updateCoverArtBackground();
            
            // Fetch enhanced lyrics if word-by-word is enabled
            if (settings.wordByWordGlowEnabled && currentTrackId !== currentTrackForLyrics) {
                currentTrackForLyrics = currentTrackId;
                fetchEnhancedLyrics(currentTrackId).then(lyrics => {
                    if (lyrics && lyrics.length > 0) {
                        enhancedLyricsData = lyrics;
                        trace.msg.log(`Loaded ${lyrics.length} enhanced lyric lines for track ${currentTrackId}`);
                        
                        // Wait a bit for lyrics to load in DOM, then process them
                        setTimeout(() => {
                            processAllLyricsInAdvance();
                        }, 1000);
                    } else {
                        enhancedLyricsData = [];
                        trace.msg.warn(`No enhanced lyrics found for track ${currentTrackId}`);
                    }
                }).catch(error => {
                    trace.msg.err(`Failed to fetch enhanced lyrics: ${error}`);
                    enhancedLyricsData = [];
                });
            }
            
            // Reset to faster checking for a short period after a change
            checkCount = 0;
            currentInterval = 250;
        }
        
        // Gradually slow down checking if no changes
        checkCount++;
        if (checkCount > 10 && currentInterval < 1000) {
            currentInterval = Math.min(currentInterval * 1.2, 1000);
        }
    };
    
    // Adaptive interval - faster when changes are happening, slower when stable
    const startAdaptiveInterval = () => {
        const intervalId = setInterval(() => {
            checkTrackChange();
        }, currentInterval);
        
        unloads.add(() => clearInterval(intervalId));
        return intervalId;
    };
    
    startAdaptiveInterval();

    // Initial background application (if a track is already loaded)
    const currentTrackId = PlayState.playbackContext?.actualProductId;
    if (currentTrackId) {
        lastTrackId = currentTrackId;
        // Immediate initial load for better UX
        setTimeout(() => {
            updateCoverArtBackground();
        }, 100);
    }
};

// Button observer using polling (instead of Stupid Bloated MutationObserver)
function observeForButtons(): void {
    const buttonCheckInterval = setInterval(() => {
        // Only observe for buttons if Hide UI is enabled
        if (!settings.hideUIEnabled) return;
        
        const fullscreenButton = document.querySelector('[data-test="request-fullscreen"]');
        if (fullscreenButton && !document.querySelector('.hide-ui-button')) {
            createHideUIButton();
        }
        
        // Create unhide button if it doesn't exist
        if (!document.querySelector('.unhide-ui-button')) {
            createUnhideUIButton();
        }
        
        // Fix unhide button visibility if UI is hidden but button isn't showing
        if (isHidden) {
            const unhideButton = document.querySelector('.unhide-ui-button') as HTMLElement;
            if (unhideButton && (unhideButton.style.display === 'none' || unhideButton.style.opacity === '0')) {
                // Force update button states to fix visibility
                updateButtonStates();
            }
        }
    }, 500); // Check every 500ms (much more efficient than MutationObserver)
    
    unloads.add(() => clearInterval(buttonCheckInterval));
}

// Also observe for lyrics container changes to apply the setting 
function observeLyricsContainer(): void {
    const observer = new MutationObserver((mutations) => {
        let shouldProcessLyrics = false;
        
        // Check for new lyrics content
        mutations.forEach(mutation => {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        const element = node as Element;
                        // Check if lyrics content was added
                        if (element.querySelector && element.querySelector('[class*="_lyricsText"]')) {
                            shouldProcessLyrics = true;
                        }
                    }
                });
            }
        });
        
        const lyricsContainer = document.querySelector('[class^="_lyricsContainer"]');
        if (lyricsContainer) {
            if (settings.lyricsGlowEnabled) {
                lyricsContainer.classList.remove('lyrics-glow-disabled');
            } else {
                lyricsContainer.classList.add('lyrics-glow-disabled');
            }
        }
        
        // Process lyrics if new content was added and word-by-word is enabled
        if (shouldProcessLyrics && settings.wordByWordGlowEnabled && enhancedLyricsData.length > 0) {
            setTimeout(() => {
                processAllLyricsInAdvance();
            }, 500);
        }
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    unloads.add(() => observer.disconnect());
}

// Optimized DOM element caching for Now Playing
let nowPlayingBackgroundContainer: HTMLElement | null = null;
let nowPlayingBackgroundImage: HTMLImageElement | null = null;
let nowPlayingBlackBg: HTMLElement | null = null;
let nowPlayingGradientOverlay: HTMLElement | null = null;
let currentNowPlayingCoverSrc: string | null = null;
let spinAnimationAdded = false;

const updateCoverArtBackground = function (method: number = 0): void {
    if (method === 1) {
        setTimeout(() => {
            updateCoverArtBackground();
            return;
        }, 2000);
    }

    let coverArtImageElement = document.querySelector('figure[class*="_albumImage"] > div > div > div > img') as HTMLImageElement;
    let coverArtImageSrc: string | null = null;

    if (coverArtImageElement) {
        coverArtImageSrc = coverArtImageElement.src;
        // Use higher resolution for better quality, but consider performance mode
        const targetRes = settings.performanceMode ? '640x640' : '1280x1280';
        coverArtImageSrc = coverArtImageSrc.replace(/\d+x\d+/, targetRes);
        if (coverArtImageElement.src !== coverArtImageSrc) {
            coverArtImageElement.src = coverArtImageSrc;
        }
    } else {
        const videoElement = document.querySelector('figure[class*="_albumImage"] > div > div > div > video') as HTMLVideoElement;
        if (videoElement) {
            coverArtImageSrc = videoElement.getAttribute("poster");
            if (coverArtImageSrc) {
                const targetRes = settings.performanceMode ? '640x640' : '1280x1280';
                coverArtImageSrc = coverArtImageSrc.replace(/\d+x\d+/, targetRes);
            }
        } else {
            cleanUpDynamicArt();
            return;
        }
    }

    // Update backgrounds when we have a valid cover art source
    if (coverArtImageSrc) {
        // Apply global spinning background if enabled
        if (settings.spinningCoverEverywhere) {
            applyGlobalSpinningBackground(coverArtImageSrc);
        }
        
        // Apply spinning CoverArt background to the Now Playing container - OPTIMIZED
        const nowPlayingContainerElement = document.querySelector('[class*="_nowPlayingContainer"]') as HTMLElement;
        if (nowPlayingContainerElement) {
            // Create DOM structure if it doesn't exist (REUSE ELEMENTS)
            if (!nowPlayingBackgroundContainer || !nowPlayingContainerElement.contains(nowPlayingBackgroundContainer)) {
                // Clean up any old elements first
                nowPlayingContainerElement.querySelectorAll('.now-playing-background-image, .now-playing-black-bg, .now-playing-gradient-overlay').forEach(el => el.remove());
                
                // Create container
                nowPlayingBackgroundContainer = document.createElement('div');
                nowPlayingBackgroundContainer.className = 'now-playing-background-container';
                nowPlayingBackgroundContainer.style.cssText = `
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 100%;
                    height: 100%;
                    z-index: -3;
                    pointer-events: none;
                    overflow: hidden;
                `;
                nowPlayingContainerElement.appendChild(nowPlayingBackgroundContainer);

                // Create black background layer
                nowPlayingBlackBg = document.createElement('div');
                nowPlayingBlackBg.className = 'now-playing-black-bg';
                nowPlayingBlackBg.style.cssText = `
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 100%;
                    height: 100%;
                    background: #000;
                    z-index: -2;
                    pointer-events: none;
                `;
                nowPlayingBackgroundContainer.appendChild(nowPlayingBlackBg);

                // Create background image
                nowPlayingBackgroundImage = document.createElement('img');
                nowPlayingBackgroundImage.className = 'now-playing-background-image';
                nowPlayingBackgroundImage.style.cssText = `
                    position: absolute;
                    left: 50%;
                    top: 50%;
                    transform: translate(-50%, -50%);
                    object-fit: cover;
                    z-index: -1;
                    transform-origin: center center;
                `;
                nowPlayingBackgroundContainer.appendChild(nowPlayingBackgroundImage);

                // Create gradient overlay
                nowPlayingGradientOverlay = document.createElement('div');
                nowPlayingGradientOverlay.className = 'now-playing-gradient-overlay';
                nowPlayingGradientOverlay.style.cssText = `
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 100%;
                    height: 100%;
                    background: radial-gradient(circle at center, transparent 0%, rgba(0, 0, 0, 0.3) 60%, rgba(0, 0, 0, 0.8) 90%);
                    z-index: -1;
                    pointer-events: none;
                `;
                nowPlayingBackgroundContainer.appendChild(nowPlayingGradientOverlay);
            }

            // Update image source efficiently
            if (nowPlayingBackgroundImage && nowPlayingBackgroundImage.src !== coverArtImageSrc) {
                nowPlayingBackgroundImage.src = coverArtImageSrc;
                currentNowPlayingCoverSrc = coverArtImageSrc;
            }

            // Apply performance-optimized settings
            if (nowPlayingBackgroundImage) {
                if (settings.performanceMode) {
                    // Performance mode with spinning enabled
                    nowPlayingBackgroundImage.style.width = '80vw';
                    nowPlayingBackgroundImage.style.height = '80vh';
                    const blur = Math.min(settings.backgroundBlur, 20);
                    const contrast = Math.min(settings.backgroundContrast, 150);
                    nowPlayingBackgroundImage.style.filter = `blur(${blur}px) brightness(${settings.backgroundBrightness / 100}) contrast(${contrast}%)`;
                    if (settings.spinningArtEnabled) {
                        nowPlayingBackgroundImage.style.animation = `spin ${settings.spinSpeed}s linear infinite`;
                        nowPlayingBackgroundImage.style.willChange = 'transform';
                    } else {
                        nowPlayingBackgroundImage.style.animation = 'none';
                        nowPlayingBackgroundImage.style.willChange = 'auto';
                    }
                    nowPlayingBackgroundImage.classList.remove('performance-mode-static');
                } else {
                    // Normal mode
                    nowPlayingBackgroundImage.style.width = '90vw';
                    nowPlayingBackgroundImage.style.height = '90vh';
                    nowPlayingBackgroundImage.style.filter = `blur(${settings.backgroundBlur}px) brightness(${settings.backgroundBrightness / 100}) contrast(${settings.backgroundContrast}%)`;
                    if (settings.spinningArtEnabled) {
                        nowPlayingBackgroundImage.style.animation = `spin ${settings.spinSpeed}s linear infinite`;
                        nowPlayingBackgroundImage.style.willChange = 'transform';
                    } else {
                        nowPlayingBackgroundImage.style.animation = 'none';
                        nowPlayingBackgroundImage.style.willChange = 'auto';
                    }
                    nowPlayingBackgroundImage.classList.remove('performance-mode-static');
                }
            }

            // Add keyframe animation only once
            if (!spinAnimationAdded) {
                const styleSheet = document.createElement('style');
                styleSheet.id = 'spinAnimation';
                styleSheet.textContent = `
                    @keyframes spin {
                        from { transform: translate(-50%, -50%) rotate(0deg); }
                        to { transform: translate(-50%, -50%) rotate(360deg); }
                    }
                `;
                document.head.appendChild(styleSheet);
                spinAnimationAdded = true;
            }
        }
    }
};

const cleanUpDynamicArt = function (): void {
    // Clean up cached Now Playing elements
    if (nowPlayingBackgroundContainer && nowPlayingBackgroundContainer.parentNode) {
        nowPlayingBackgroundContainer.parentNode.removeChild(nowPlayingBackgroundContainer);
    }
    nowPlayingBackgroundContainer = null;
    nowPlayingBackgroundImage = null;
    nowPlayingBlackBg = null;
    nowPlayingGradientOverlay = null;
    currentNowPlayingCoverSrc = null;
    
    // Clean up any remaining elements (fallback)
    const nowPlayingBackgroundImages = document.getElementsByClassName("now-playing-background-image");
    Array.from(nowPlayingBackgroundImages).forEach((element) => {
        element.remove();
    });
    
    // Also clean up global spinning backgrounds
    cleanUpGlobalSpinningBackground();
};

// Initialize the button creation and observers
observeForButtons();
observeTrackChanges();
observeLyricsContainer();

// Initialize word-by-word tracking if enabled
updateWordByWordTracking();

// Apply initial performance mode class
if (settings.performanceMode) {
    document.body.classList.add('performance-mode');
}

updateCoverArtBackground(1);

// Add cleanup to unloads
unloads.add(() => {
    cleanUpDynamicArt();

    // Clean up word tracking interval
    if (wordTrackingInterval) {
        clearInterval(wordTrackingInterval);
        wordTrackingInterval = null;
    }

    // Clean up auto-fade timeout
    if (unhideButtonAutoFadeTimeout) {
        window.clearTimeout(unhideButtonAutoFadeTimeout);
        unhideButtonAutoFadeTimeout = null;
    }

    // Clean up our custom buttons
    const hideButton = document.querySelector('.hide-ui-button');
    if (hideButton && hideButton.parentNode) {
        hideButton.parentNode.removeChild(hideButton);
    }
    
    const unhideButton = document.querySelector('.unhide-ui-button');
    if (unhideButton && unhideButton.parentNode) {
        unhideButton.parentNode.removeChild(unhideButton);
    }

    // Clean up spin animations
    const spinAnimationStyle = document.querySelector('#spinAnimation');
    if (spinAnimationStyle && spinAnimationStyle.parentNode) {
        spinAnimationStyle.parentNode.removeChild(spinAnimationStyle);
    }
    
    // Clean up global spinning backgrounds
    cleanUpGlobalSpinningBackground();
    
    // Reset enhanced lyrics data
    enhancedLyricsData = [];
    currentTrackForLyrics = null;
}); 