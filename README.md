# Luna Plugins Collection

A collection of Luna plugins for Tidal, ported from Neptune framework.

## Plugins

### 🎨 OLED Theme Luna
**Location:** `plugins/oled-theme-luna/`

A dark OLED-friendly theme plugin that transforms Tidal Luna's appearance.

**Features:**
- Applies a dark, OLED-optimized theme
- Fetches the latest theme CSS from the GitHub repository
- Reduces battery consumption on OLED displays.. i guess <3
- Modern, sleek dark interface

### 🎵 Clean View Luna  
**Location:** `plugins/clean-view-luna/`

Makes your "Play Queue" clean and immersive with dynamic visual effects.

**Features:**
- Dynamic album art backgrounds with blur and rotation effects
- Glowing Animated Lyrics with clean scrolling

### 📋 Copy Lyrics Luna
**Location:** `plugins/copy-lyrics-luna/`

Allows users to copy song lyrics by selecting them directly in the interface.

**Features:**
- Enables text selection on lyrics
- Automatic clipboard copying of selected lyrics
- Smart lyric span detection

## Installation

### Building All Plugins
```bash
# Install dependencies
pnpm install

# Build all plugins
pnpm run watch
```

## Development

This project is made for:
- **TidalLuna** - Modern plugin framework for Tidal | Inrixia

## GitHub Actions

- **Automated builds** on every push
- **Release automation** for distributing plugins
- **Artifact uploads** for easy plugin distribution

## Author

- **itzzexcel** - [GitHub](https://github.com/ItzzExcel)

## Credits

Original Neptune versions by itzzexcel. Ported to Luna framework following the Luna plugin template structure by meowarex with help from Inrixia <3 