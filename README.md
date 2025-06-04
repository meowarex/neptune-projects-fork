# Luna Plugins Collection

A collection of Luna plugins for Tidal, ported from Neptune framework.

## Plugins

### 🎨 OLED Theme
**Location:** `plugins/oled-theme-luna/`

A dark OLED-friendly theme plugin that transforms Tidal Luna's appearance.

**Features:**
- Applies a dark, OLED-optimized theme
- Fetches the latest theme CSS from the GitHub repository
- Reduces battery consumption on OLED displays.. i guess <3
- Modern, sleek dark interface

### 🎵 Radiant Lyrics
**Location:** `plugins/radiant-lyrics-luna/`

A radiant and beautiful lyrics view for TIDAL with dynamic visual effects.

**Features:**
- Dynamic CoverArt backgrounds with blur and rotation effects
- Glowing Animated Lyrics with clean scrolling

### 📋 Copy Lyrics
**Location:** `plugins/copy-lyrics-luna/`

Allows users to copy song lyrics by selecting them directly in the interface.

**Features:**
- Enables text selection on lyrics
- Automatic clipboard copying of selected lyrics
- Smart lyric span detection

## Installation

### Installing from URL
1. Open TidalLuna after Building & Serving
2. Navigate to Luna Settings (Top right of Tidal)
3. Click "Plugin Store" Tab
4. Paste in the "Install from URL" Bar `https://github.com/meowarex/tidalluna-plugins/releases/download/latest/store.json`

## Installation from Source

### Building All Plugins
```bash
# Git Clone the Repo
git clone https://github.com/meowarex/tidalluna-plugins

# Change Folder to the Repo
cd neptune-projects-fork

# Install dependencies
pnpm install

# Build & Serve all plugins
pnpm run watch
```

### Installing Plugins in TidalLuna
1. Open TidalLuna after Building & Serving
2. Navigate to Luna Settings (Top right of Tidal)
3. Click "Plugin Store" Tab
4. Click Install on the Plugins at the top Labeled with "[Dev]"
5. Enjoy <3

## Development

This project is made for:
- **TidalLuna** - Modern plugin framework for Tidal | Inrixia

## GitHub Actions

- **Automated builds** on every push (to main)
- **Release automation** for distributing plugins
- **Artifact uploads** for easy plugin distribution

## Based On <3

- **itzzexcel** - [GitHub](https://github.com/ItzzExcel)

## Credits

Original Neptune versions by itzzexcel. Ported to Luna framework following the Luna plugin template structure by meowarex with help from Inrixia <3 
