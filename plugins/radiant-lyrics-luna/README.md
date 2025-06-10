# Radiant Lyrics Luna Plugin

A plugin for Luna (Tidal Desktop) that adds enhanced lyrics styling, cover art backgrounds, and UI management features.

## Features

### ✨ Lyrics Glow Effect
- Beautiful glowing effect for lyrics with custom font styling
- Can be toggled on/off in settings

### 🎨 Cover Everywhere (Performance Optimized)
- Apply spinning cover art background to the entire app
- **NEW: Ultra-performance mode** with significant optimizations:
  - Reduced blur effects (max 20px in performance mode)
  - Smaller image sizes (640x640 vs 1280x1280)
  - Static backgrounds (no animations)
  - Optimized GPU usage with hardware acceleration
  - DOM element reuse to prevent memory leaks
  - Throttled updates (max once per 500ms)
  - Adaptive polling for track changes

### 🔧 Performance Mode Features
When enabled, Performance Mode provides:
- **Blur Reduction**: Caps blur at 20px instead of up to 200px
- **Image Optimization**: Uses 640x640 resolution instead of 1280x1280
- **Animation Disable**: Removes all CSS animations for static backgrounds  
- **Memory Optimization**: Better DOM element management and cleanup
- **GPU Optimization**: Reduces `will-change` properties and backdrop-filter effects
- **Size Reduction**: Smaller background image dimensions (120vw vs 150vw for global, 80vw vs 90vw for Now Playing)

### 🎛️ UI Management
- Hide/unhide UI functionality with smooth transitions
- Player bar visibility control when UI is hidden
- Customizable background effects (blur, brightness, contrast, spin speed)

## Technical Improvements

### Performance Optimizations (Latest Update)
1. **DOM Element Reuse**: Background elements are created once and reused instead of being recreated on every track change
2. **Update Throttling**: Cover art updates are throttled to prevent excessive DOM manipulation
3. **Adaptive Polling**: Track change detection starts fast and slows down when no changes occur
4. **Hardware Acceleration**: Added GPU acceleration hints for smoother animations
5. **Memory Management**: Proper cleanup of cached DOM elements
6. **CSS Optimizations**: Better use of `transform3d` and `backface-visibility` for GPU rendering

### Normal Mode Performance Enhancements
Even without Performance Mode enabled, the plugin now includes significant optimizations:
- **Optimized Filter Order**: Reordered CSS filters for better GPU performance (`contrast` → `brightness` → `blur`)
- **CSS Custom Properties**: Dynamic filter updates use CSS variables to avoid style recalculation
- **Transform3D**: All transforms use `translate3d()` for better GPU acceleration
- **Image Caching**: LRU cache for cover art images (max 10 images) for instant loading
- **Preloading**: Smart image preloading with cache checking for smoother transitions
- **Enhanced GPU Layers**: Better use of `transform-style: preserve-3d` and `isolation: isolate`
- **Optimized Animations**: Improved keyframe animations with `cubic-bezier` timing
- **Backdrop-Filter Optimization**: More efficient backdrop-filter usage with hardware acceleration
- **Compositing Hints**: Added `contain: layout style paint` for better rendering isolation

### Browser Compatibility
- Respects `prefers-reduced-motion` for accessibility
- Optimized for modern browsers with hardware acceleration support

## Settings

- **Lyrics Glow Effect**: Toggle the enhanced lyrics styling
- **Hide UI Feature**: Enable hide/show UI functionality
- **Player Bar Visibility**: Keep player bar visible when UI is hidden
- **Cover Everywhere**: Apply cover art background to entire app
- **Performance Mode**: Enable ultra-light performance optimizations
- **Background Controls**: Adjust contrast (0-200), blur (0-200), brightness (0-100)
- **Spin Speed**: Control rotation speed (10-120 seconds per rotation)
- **Settings Affect Now Playing**: Apply background settings to Now Playing view

## Performance Recommendations

- Enable **Performance Mode** if you experience lag or high GPU usage
- Reduce **Background Blur** setting for better performance
- Use lower **Background Contrast** values on slower systems
- Consider disabling **Cover Everywhere** on very low-end systems

## Credits

- Heavily inspired by Cover-Theme by @Inrixia
- Thanks to the Luna development team for the plugin framework 