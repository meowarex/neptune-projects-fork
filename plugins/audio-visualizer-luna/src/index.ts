import { ftch, LunaUnload, Tracer } from "@luna/core";
import { PlayState, StyleTag } from "@luna/lib";
import { settings, Settings } from "./Settings";

// Import CSS styles for the visualizer
import visualizerStyles from "file://styles.css?minify";

export const { trace } = Tracer("[Audio Visualizer]");

// Helper function for consistent logging
const log = (message: string) => trace.log(message);
const warn = (message: string) => trace.warn(message);
const error = (message: string) => trace.err(message);
export { Settings };

// Basic config with settings
const config = {
    enabled: true,
    position: 'left' as 'left' | 'right',
    width: 200,
    height: 40,
    get barCount() { return settings.barCount; },
    get color() { return settings.barColor; },
    get barRounding() { return settings.barRounding; },
    sensitivity: 1.5,
    smoothing: 0.8,
    visualizerType: 'bars' as 'bars' | 'waveform' | 'circular'
};

// Clean up resources
export const unloads = new Set<LunaUnload>();

// StyleTag for CSS
const styleTag = new StyleTag("AudioVisualizer", unloads, visualizerStyles);

interface SpotifyAudioAnalysis {
    meta: {
        analyzer_version: string;
        platform: string;
        detailed_status: string;
        status_code: number;
        timestamp: number;
        analysis_time: number;
        input_process: string;
    };
    track: {
        num_samples: number;
        duration: number;
        sample_md5: string;
        offset_seconds: number;
        window_seconds: number;
        analysis_sample_rate: number;
        analysis_channels: number;
        end_of_fade_in: number;
        start_of_fade_out: number;
        loudness: number;
        tempo: number;
        tempo_confidence: number;
        time_signature: number;
        time_signature_confidence: number;
        key: number;
        key_confidence: number;
        mode: number;
        mode_confidence: number;
        codestring: string;
        code_version: number;
        echoprintstring: string;
        echoprint_version: number;
        synchstring: string;
        synch_version: number;
        rhythmstring: string;
        rhythm_version: number;
    };
    bars: Array<{
        start: number;
        duration: number;
        confidence: number;
    }>;
    beats: Array<{
        start: number;
        duration: number;
        confidence: number;
    }>;
    sections: Array<{
        [key: string]: number;
    }>;
    segments: Array<{
        start: number;
        duration: number;
        confidence: number;
        loudness_start: number;
        loudness_max_time: number;
        loudness_max: number;
        loudness_end: number;
        pitches: number[];
        timbre: number[];
    }>;
    tatums: Array<{
        start: number;
        duration: number;
        confidence: number;
    }>;
}

let spotifyAudioAnalysis: SpotifyAudioAnalysis | null = null;
let currentTrackId: string | null = null;
let lastSpotifyFetchTime = 0;
const SPOTIFY_FETCH_THROTTLE = 1000;

// Audio context and analyzer
let audioContext: AudioContext | null = null;
let analyser: AnalyserNode | null = null;
let audioSource: MediaElementAudioSourceNode | null = null;
let dataArray: Uint8Array | null = null;
let animationId: number | null = null;
let currentAudioElement: HTMLAudioElement | null = null;
let isSourceConnected: boolean = false;

let smoothedBars: number[] = [];
let previousBars: number[] = [];
const smoothingFactor = 0.15;
// Canvas and container elements
let visualizerContainer: HTMLDivElement | null = null;
let canvas: HTMLCanvasElement | null = null;
let canvasContext: CanvasRenderingContext2D | null = null;

const fetchSpotifyAudioAnalysis = async (): Promise<void> => {
    try {
        const trackId = PlayState.playbackContext?.actualProductId;
        if (!trackId) {
            warn("No track ID available for Spotify API");
            return;
        }
        if (currentTrackId === trackId && spotifyAudioAnalysis) {
            log("Using cached Spotify audio analysis");
            return;
        }

        const now = Date.now();
        if (now - lastSpotifyFetchTime < SPOTIFY_FETCH_THROTTLE) {
            log("Throttling Spotify API call");
            return;
        }
        lastSpotifyFetchTime = now;

        log(`Fetching Spotify audio analysis for track: ${trackId}`);

        const data = await ftch.json<{
            audioAnalysis: SpotifyAudioAnalysis;
        }>(`https://api.vmohammad.dev/lyrics?tidal_id=${trackId}&filter=audioAnalysis`);

        if (!data.audioAnalysis) {
            warn("No audio analysis data in API response");
            return;
        }

        spotifyAudioAnalysis = data.audioAnalysis;
        currentTrackId = trackId;
        log("Successfully fetched Spotify audio analysis");

    } catch (err) {
        error(`Failed to fetch Spotify audio analysis: ${err}`);
        spotifyAudioAnalysis = null;
    }
};

// Find the audio element - this is a bit of a hack but it works
const findAudioElement = (): HTMLAudioElement | null => {
    // Try main selectors first
    const selectors = [
        'audio',
        // 'video',
        'audio[data-test]',
        '[data-test="audio-player"] audio'
    ];

    for (const selector of selectors) {
        const element = document.querySelector(selector) as HTMLAudioElement;
        if (element && (element.tagName === 'AUDIO' || element.tagName === 'VIDEO')) {
            return element;
        }
    }

    // Quick scan for any audio elements
    const audioElements = document.querySelectorAll('audio');
    for (const element of audioElements) {
        const audioEl = element as HTMLAudioElement;
        if (audioEl.src || audioEl.currentSrc) {
            return audioEl;
        }
    }

    return null;
};

// Initialize audio visualization
const initializeAudioVisualizer = async (): Promise<void> => {
    try {
        if (settings.spotifyAPI) {
            await fetchSpotifyAudioAnalysis();
            log("Using Spotify API - skipping audio element connection");
        } else {
            // Find the audio element
            const audioElement = findAudioElement();
            if (!audioElement) {
                return;
            }

            // create audio context
            if (!audioContext) {
                audioContext = new AudioContext();
                log("Created AudioContext");
            }

            // create analyser
            if (!analyser) {
                analyser = audioContext.createAnalyser();
                analyser.fftSize = 512; // Fixed power of 2 that provides enough frequency bins
                analyser.smoothingTimeConstant = config.smoothing;
                const buffer = new ArrayBuffer(analyser.frequencyBinCount);
                dataArray = new Uint8Array(buffer);
                log("Created AnalyserNode");
            }

            // attempt audio connection if not already connected
            if (!isSourceConnected && audioElement !== currentAudioElement) {
                try {
                    // Create audio source - this might fail if already connected elsewhere
                    audioSource = audioContext.createMediaElementSource(audioElement);
                    audioSource.connect(analyser);
                    // CRITICAL: connect back to destination for audio output (otherwise no sound)
                    analyser.connect(audioContext.destination);

                    currentAudioElement = audioElement;
                    isSourceConnected = true;
                    log("Connected to audio stream with output");
                } catch (error) {
                    // Audio is connected elsewhere - that's fine, we just can't visualize
                    if (error instanceof Error && error.message.includes('already connected')) {
                        log("Audio already connected elsewhere - skipping visualization");
                    }
                    return;
                }
            }

            // Resume context only if needed and don't wait for it 
            // (otherwise it will wait for the audio to start playing)
            if (audioContext.state === 'suspended') {
                audioContext.resume().catch(() => { }); // Fire and forget
            }
        }

        // Create UI only if it doesn't exist 
        if (!visualizerContainer) {
            createVisualizerUI();
        }

        // Start animation only if not already running
        if (!animationId) {
            animate();
        }

    } catch (err) {
        // log errors
        console.error(err);
    }
};

// Create the visualizer UI container and canvas
const createVisualizerUI = (): void => {
    // Remove existing visualizer if it exists
    removeVisualizerUI();

    if (!config.enabled) return;

    // Find the search bar
    const searchField = document.querySelector('input[class*="_searchField"]') as HTMLInputElement;
    if (!searchField) {
        warn("Search field not found");
        return;
    }

    const searchContainer = searchField.parentElement;
    if (!searchContainer) {
        warn("Search container not found");
        return;
    }

    // Create visualizer container
    visualizerContainer = document.createElement('div');
    visualizerContainer.id = 'audio-visualizer-container';
    visualizerContainer.style.cssText = `
        display: flex;
        align-items: center;
        justify-content: center;
        margin-${config.position === 'left' ? 'right' : 'left'}: 12px;
        background: rgba(0, 0, 0, 0.2);
        border-radius: 8px;
        padding: 4px;
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
    `;

    // Create canvas
    canvas = document.createElement('canvas');
    canvas.width = config.width;
    canvas.height = config.height;
    canvas.style.cssText = `
        width: ${config.width}px;
        height: ${config.height}px;
        border-radius: 4px;
    `;

    visualizerContainer.appendChild(canvas);
    canvasContext = canvas.getContext('2d');

    // Insert visualizer next to search bar
    if (config.position === 'left') {
        searchContainer.parentElement?.insertBefore(visualizerContainer, searchContainer);
    } else {
        searchContainer.parentElement?.insertBefore(visualizerContainer, searchContainer.nextSibling);
    }
};

// Remove visualizer UI
const removeVisualizerUI = (): void => {
    if (visualizerContainer) {
        visualizerContainer.remove();
        visualizerContainer = null;
        canvas = null;
        canvasContext = null;
    }
};

const lerp = (start: number, end: number, factor: number): number => {
    return start + (end - start) * factor;
};

const initializeSmoothingArrays = (barCount: number): void => {
    if (smoothedBars.length !== barCount) {
        smoothedBars = new Array(barCount).fill(0);
        previousBars = new Array(barCount).fill(0);
    }
};

// Animation loop for rendering visualizer
const animate = (): void => {
    if (!canvasContext || !canvas) {
        animationId = null;
        return;
    }

    // Update canvas color in case it changed
    canvasContext.fillStyle = config.color;
    canvasContext.strokeStyle = config.color;
    canvasContext.clearRect(0, 0, canvas.width, canvas.height);

    if (settings.spotifyAPI && spotifyAudioAnalysis) {
        switch (config.visualizerType) {
            case 'bars':
                drawSpotifyBars();
                break;
            case 'waveform':
                // drawWaveform();
                break;
            case 'circular':
                // drawCircular();
                break;
        }
    } else {
        // Check if we have real audio data - this might not be needed but its a good idea
        let hasRealAudio = false;
        if (analyser && dataArray) {
            analyser.getByteFrequencyData(dataArray as any);
            // Check if there's actual audio signal (not just silence)
            const avgVolume = dataArray.reduce((sum, val) => sum + val, 0) / dataArray.length;
            hasRealAudio = avgVolume > 5; // Threshold for detecting actual audio
        }

        if (hasRealAudio && analyser && dataArray) {
            // Draw real audio visualization
            switch (config.visualizerType) {
                case 'bars': // Is implemented YAYYY (default)
                    drawBars();
                    break;
                case 'waveform': // Not implemented yet
                    // drawWaveform();
                    break;
                case 'circular': // Not implemented yet
                    // drawCircular();
                    break;
            }
        } else {
            // Draw cool scrolling wave effect when no audio
            drawScrollingWave();
        }
    }

    animationId = requestAnimationFrame(animate);
};

// Global wave animation state
let waveTime = 0;

// Helper function to draw rounded rectangles
const drawRoundedRect = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number): void => {
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, radius);
    ctx.fill();
};

// Draw scrolling wave effect when no audio is detected
const drawScrollingWave = (): void => {
    if (!canvasContext || !canvas) return;

    waveTime += 0.05; // Speed of wave animation

    const barCount = config.barCount;
    initializeSmoothingArrays(barCount);

    const barWidth = canvas.width / barCount;
    const maxHeight = canvas.height * 0.6;

    canvasContext.fillStyle = config.color;

    for (let i = 0; i < barCount; i++) {
        // Create a sine wave that scrolls back and forth
        const x = i / barCount;
        const wave1 = Math.sin(x * Math.PI * 2 + waveTime) * 0.3;
        const wave2 = Math.sin(x * Math.PI * 4 + waveTime * 1.3) * 0.2;
        const wave3 = Math.sin(x * Math.PI * 6 + waveTime * 0.7) * 0.1;

        // Combine waves for complex pattern
        const combinedWave = (wave1 + wave2 + wave3 + 1) / 2; // Normalize to 0-1

        // Add a traveling wave effect
        const travelWave = Math.sin(x * Math.PI * 3 - waveTime * 2) * 0.5 + 0.5;

        // Final height calculation
        const targetHeight = maxHeight * combinedWave * travelWave * 0.8 + 2; // Minimum height of 2px

        smoothedBars[i] = lerp(smoothedBars[i], targetHeight, smoothingFactor * 2); // Faster smoothing for wave effect

        const xPos = i * barWidth;
        const yPos = (canvas.height - smoothedBars[i]) / 2;

        // Draw rounded or square bars based on setting
        if (config.barRounding) {
            drawRoundedRect(canvasContext, xPos, yPos, barWidth - 1, smoothedBars[i], 2);
        } else {
            canvasContext.fillRect(xPos, yPos, barWidth - 1, smoothedBars[i]);
        }
    }
};

// Draw frequency bars - default
const drawBars = (): void => {
    if (!canvasContext || !dataArray || !canvas) return;

    const barCount = config.barCount;
    initializeSmoothingArrays(barCount);

    const barWidth = canvas.width / barCount;
    const heightScale = canvas.height / 255;

    canvasContext.fillStyle = config.color;

    for (let i = 0; i < barCount; i++) {
        const dataIndex = Math.floor(i * (dataArray.length / barCount));
        const targetHeight = (dataArray[dataIndex] * config.sensitivity * heightScale);

        smoothedBars[i] = lerp(smoothedBars[i], targetHeight, smoothingFactor);

        const x = i * barWidth;
        const y = canvas.height - smoothedBars[i];

        // Draw rounded or square bars based on setting
        if (config.barRounding) {
            drawRoundedRect(canvasContext, x, y, barWidth - 1, smoothedBars[i], 2);
        } else {
            canvasContext.fillRect(x, y, barWidth - 1, smoothedBars[i]);
        }
    }
};

let currentTime = 0;
let previousTime = 0;
let lastUpdated = 0;
const drawSpotifyBars = (): void => {
    if (!canvasContext || !canvas || !spotifyAudioAnalysis) return;

    const audioElement = findAudioElement();
    if (audioElement && audioElement.currentTime) {
        currentTime = audioElement.currentTime;
        previousTime = -1;
    } else {
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
            } else {
                warn("Progress bar not found or aria-valuenow is null");
                return;
            }
        }
    }

    if (currentTime < 0) return;

    const barCount = config.barCount;
    initializeSmoothingArrays(barCount);

    const barWidth = canvas.width / barCount;
    canvasContext.fillStyle = config.color;

    const segments = spotifyAudioAnalysis.segments;
    const beats = spotifyAudioAnalysis.beats;

    if (!segments || segments.length === 0) {
        warn("No segments data available in Spotify audio analysis");
        return;
    }

    let currentSegmentIndex = segments.findIndex(segment =>
        currentTime >= segment.start && currentTime < (segment.start + segment.duration)
    );

    if (currentSegmentIndex === -1) {
        currentSegmentIndex = segments.reduce((closestIndex, segment, index) => {
            const closestDiff = Math.abs(segments[closestIndex].start - currentTime);
            const segmentDiff = Math.abs(segment.start - currentTime);
            return segmentDiff < closestDiff ? index : closestIndex;
        }, 0);
    }

    const currentSegment = segments[currentSegmentIndex];
    if (!currentSegment) return;

    const nextSegment = segments[currentSegmentIndex + 1];

    const segmentProgress = (currentTime - currentSegment.start) / currentSegment.duration;
    const interpolationFactor = Math.max(0, Math.min(1, segmentProgress));

    const currentBeat = beats?.find(beat =>
        currentTime >= beat.start && currentTime < (beat.start + beat.duration)
    );

    let beatIntensity = 1.0;
    if (currentBeat) {
        const beatProgress = (currentTime - currentBeat.start) / currentBeat.duration;
        beatIntensity = 1.0 + (1.0 - beatProgress) * currentBeat.confidence;
    }

    const getInterpolatedValue = (currentValue: number, nextValue?: number): number => {
        if (!nextValue || !nextSegment) return currentValue;
        return lerp(currentValue, nextValue, interpolationFactor * 0.3); // Gentle interpolation
    };

    const currentLoudness = currentSegment.loudness_max;
    const nextLoudness = nextSegment?.loudness_max ?? currentLoudness;
    const interpolatedLoudness = getInterpolatedValue(currentLoudness, nextLoudness);
    const loudnessMultiplier = Math.max(0.3, Math.min(1.2, (interpolatedLoudness + 80) / 80));

    for (let i = 0; i < barCount; i++) {
        let targetHeight = 0;

        const pitches = currentSegment.pitches;
        const timbre = currentSegment.timbre;
        const nextPitches = nextSegment?.pitches;
        const nextTimbre = nextSegment?.timbre;

        if (i < 12 && pitches.length >= 12) {
            const currentPitch = pitches[i];
            const nextPitch = nextPitches?.[i];
            const interpolatedPitch = getInterpolatedValue(currentPitch, nextPitch);

            targetHeight = Math.pow(interpolatedPitch, 1.2) * canvas.height * config.sensitivity * 0.6;

        } else if (i < 24 && timbre.length >= 12) {
            const timbreIndex = (i - 12) % timbre.length;
            const currentTimbreValue = timbre[timbreIndex];
            const nextTimbreValue = nextTimbre?.[timbreIndex];
            const interpolatedTimbre = getInterpolatedValue(currentTimbreValue, nextTimbreValue);
            const normalizedTimbre = Math.max(0, Math.min(1, (interpolatedTimbre + 200) / 400));
            targetHeight = Math.pow(normalizedTimbre, 1.0) * canvas.height * config.sensitivity * 0.4;

        } else {
            const harmonicIndex = i % 12;
            const harmonicMultiplier = Math.max(0.2, 1.0 - (Math.floor(i / 12) * 0.3));

            const basePitch = pitches[harmonicIndex] || 0;
            const nextBasePitch = nextPitches?.[harmonicIndex];
            const interpolatedPitch = getInterpolatedValue(basePitch, nextBasePitch);

            targetHeight = Math.pow(interpolatedPitch, 1.3) * canvas.height * config.sensitivity * harmonicMultiplier * 0.5;
        }

        targetHeight *= loudnessMultiplier * beatIntensity;

        const frequencyVariance = 1.0 + Math.sin((i / barCount) * Math.PI * 2 + currentTime * 0.5) * 0.05;
        targetHeight *= frequencyVariance;

        if (targetHeight > canvas.height * 0.6) {
            targetHeight = canvas.height * 0.6 + (targetHeight - canvas.height * 0.6) * 0.2;
        }

        targetHeight = Math.max(2, Math.min(targetHeight, canvas.height));

        const changeFactor = Math.abs(targetHeight - (smoothedBars[i] || 0)) / canvas.height;
        const adaptiveSmoothingFactor = smoothingFactor * (1 + changeFactor * 0.5);
        smoothedBars[i] = lerp(smoothedBars[i] || 0, targetHeight, Math.min(adaptiveSmoothingFactor, 0.3));

        const x = i * barWidth;
        const y = canvas.height - smoothedBars[i];

        if (config.barRounding) {
            drawRoundedRect(canvasContext, x, y, barWidth - 1, smoothedBars[i], 2);
        } else {
            canvasContext.fillRect(x, y, barWidth - 1, smoothedBars[i]);
        }
    }
};


// Update visualizer settings
const updateAudioVisualizer = (): void => {
    if (analyser) {
        // use a fixed size that provides enough frequency bins
        analyser.fftSize = 512; // Fixed power of 2 - important
        analyser.smoothingTimeConstant = config.smoothing;
        const buffer = new ArrayBuffer(analyser.frequencyBinCount); // buffer like ahh
        dataArray = new Uint8Array(buffer);
    }

    if (canvas) {
        canvas.width = config.width;
        canvas.height = config.height;
        canvas.style.width = `${config.width}px`;
        canvas.style.height = `${config.height}px`;
    }

    smoothedBars = [];
    previousBars = [];

    if (settings.spotifyAPI) {
        const currentSpotifyTrackId = PlayState.playbackContext?.actualProductId;
        if (currentSpotifyTrackId && currentSpotifyTrackId !== currentTrackId) {
            log("Spotify API enabled, fetching audio analysis");
            fetchSpotifyAudioAnalysis().catch(err => {
                error(`Failed to fetch Spotify data: ${err}`);
            });
        }
    } else {
        spotifyAudioAnalysis = null;
        currentTrackId = null;
        log("Spotify API disabled, cleared audio analysis data");
    }

    // Recreate UI if position changed
    createVisualizerUI();
};

// Make updateAudioVisualizer available globally for settings
(window as any).updateAudioVisualizer = updateAudioVisualizer;

// Clean up function
const cleanupAudioVisualizer = (): void => {
    // stop animation and hide UI - don't touch audio connections (otherwise it will reconnect)
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }

    removeVisualizerUI();

    // i was killing audio connections - But it was reconnecting and being a pain
    // so i just left it alone - it works fine
};

// Initialize when DOM is ready and track is playing
const observePlayState = (): void => {
    let hasTriedInitialization = false;
    let checkCount = 0;
    let lastTrackIdForSpotify: string | null = null;

    const checkAndInitialize = () => {
        checkCount++;
        if (settings.spotifyAPI) {
            const currentSpotifyTrackId = PlayState.playbackContext?.actualProductId;
            if (currentSpotifyTrackId && currentSpotifyTrackId !== lastTrackIdForSpotify) {
                lastTrackIdForSpotify = currentSpotifyTrackId;
                log(`Track changed, fetching Spotify data for: ${currentSpotifyTrackId}`);
                fetchSpotifyAudioAnalysis().catch(err => {
                    error(`Failed to fetch Spotify data: ${err}`);
                });
            }
        }

        // Only try to initialize once when music starts playing
        if ((PlayState.playing || settings.spotifyAPI) && !hasTriedInitialization) {
            hasTriedInitialization = true;
            log("Initializing audio visualizer...");

            // Initialize immediately - no delay (after audio starts playing ofc)
            initializeAudioVisualizer().then(() => {
                if (settings.spotifyAPI || (audioContext && analyser)) {
                    log("Audio visualizer ready!");
                } else {
                    hasTriedInitialization = false; // Allow retry if failed
                }
            });
        } else if (!PlayState.playing && !settings.spotifyAPI && hasTriedInitialization) {
            // Reset try flag when music stops so it can try again next time (otherwise it explode)
            hasTriedInitialization = false;
        }

        // Keep animation running regardless of play state
        if (!animationId) {
            animate();
        }
    };

    // Start with fast checking, then slow down
    const fastInterval = setInterval(() => {
        checkAndInitialize();
        if (checkCount > 10) { // After 10 quick checks, switch to slower
            clearInterval(fastInterval);
            const slowInterval = setInterval(checkAndInitialize, 2000);
            unloads.add(() => clearInterval(slowInterval));
        }
    }, 200); // Check every 200ms initially

    unloads.add(() => clearInterval(fastInterval));

    // Immediate first check
    checkAndInitialize();
};

// Initialize the plugin
const initialize = (): void => {
    log("Audio Visualizer plugin initializing...");

    // Start immediately - DOM should be ready by plugin load
    setTimeout(() => {
        log("Starting visualizer...");
        // Create UI immediately so wave effect shows
        createVisualizerUI();
        // Start animation loop immediately
        animate();
        // Also observe play state for audio detection
        observePlayState();
    }, 100); // Minimal delay to ensure DOM is ready
};

// Complete cleanup function for plugin unload
const completeCleanup = (): void => {
    log("Complete cleanup - plugin unloading");

    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }

    removeVisualizerUI();

    // Fully disconnect and reset everything
    if (audioSource) {
        try {
            audioSource.disconnect();
            log("Disconnected audio source completely");
        } catch (e) {
            log("Audio source already disconnected");
        }
    }

    // Close audio context completely on plugin unload
    if (audioContext && audioContext.state !== 'closed') {
        audioContext.close();
        log("Closed AudioContext");
    }

    // Reset all references
    audioContext = null;
    analyser = null;
    audioSource = null;
    dataArray = null;
    currentAudioElement = null;
    isSourceConnected = false;
    smoothedBars = [];
    previousBars = [];
    spotifyAudioAnalysis = null;
    currentTrackId = null;
    log("Cleaned up Spotify API data");
};

// Register cleanup
unloads.add(completeCleanup);

// Start initialization
initialize();