import { LunaUnload, Tracer } from "@luna/core";
import { TidalApi } from "@luna/lib";

export const { trace } = Tracer("[Genre Display]");

// Clean up resources
export const unloads = new Set<LunaUnload>();

// Cache for genre data
const genreCache = new Map<string, string>();

// Track processing state
let isProcessing = false;

// Function to search MusicBrainz for genre
async function getGenreFromMusicBrainz(title: string, artist: string): Promise<string> {
	const cacheKey = `${title}||${artist}`;
	
	trace.msg.log(`Starting genre search for: "${title}" by "${artist}"`);
	
	// Check cache first
	if (genreCache.has(cacheKey)) {
		const cached = genreCache.get(cacheKey)!;
		trace.msg.log(`Found cached genre: "${cached}"`);
		return cached;
	}
	
	try {
		// Clean artist name for better searching
		const cleanArtist = artist.replace(/[!@#$%^&*()]/g, '').trim();
		
		// Try one search for the track
		trace.msg.log(`Searching for track genre...`);
		const trackQuery = encodeURIComponent(`"${title}" AND artist:"${cleanArtist}"`);
		const trackUrl = `https://musicbrainz.org/ws/2/recording?query=${trackQuery}&fmt=json&limit=5&inc=genres+tags+artist-credits`;
		
		trace.msg.log(`Track search URL: ${trackUrl}`);
		
		const trackResponse = await fetch(trackUrl, {
			headers: {
				'User-Agent': 'TidalLuna-GenreDisplay/1.0.0'
			}
		});

		trace.msg.log(`Track search response: ${trackResponse.status} ${trackResponse.statusText}`);

		if (trackResponse.ok) {
			const trackData = await trackResponse.json();
			trace.msg.log(`Found ${trackData.recordings?.length || 0} track recordings`);
			
			if (trackData.recordings?.length > 0) {
				// Check recordings for genre data
				for (let j = 0; j < trackData.recordings.length; j++) {
					const recording = trackData.recordings[j];
					trace.msg.log(`Checking track recording ${j + 1}: "${recording.title}"`);
					
					// Check for direct genres
					if (recording.genres?.length > 0) {
						const genre = recording.genres[0].name;
						trace.msg.log(`Found track genre: "${genre}"`);
						genreCache.set(cacheKey, genre);
						return genre;
					}
					
					// Check for tags as fallback
					if (recording.tags?.length > 0) {
						const genre = recording.tags[0].name;
						trace.msg.log(`Found track genre from tags: "${genre}"`);
						genreCache.set(cacheKey, genre);
						return genre;
					}
				}
			}
		}
		
		// Fallback: Search for artist genre
		trace.msg.log(`No track genre found, searching for artist genre...`);
		const artistQuery = encodeURIComponent(`artist:"${cleanArtist}"`);
		const artistUrl = `https://musicbrainz.org/ws/2/artist?query=${artistQuery}&fmt=json&limit=3&inc=genres+tags`;
		
		trace.msg.log(`Artist search URL: ${artistUrl}`);
		
		const artistResponse = await fetch(artistUrl, {
			headers: {
				'User-Agent': 'TidalLuna-GenreDisplay/1.0.0'
			}
		});

		trace.msg.log(`Artist search response: ${artistResponse.status} ${artistResponse.statusText}`);

		if (artistResponse.ok) {
			const artistData = await artistResponse.json();
			trace.msg.log(`Found ${artistData.artists?.length || 0} artists`);
			
			if (artistData.artists?.length > 0) {
				// Check artists for genre data
				for (let j = 0; j < artistData.artists.length; j++) {
					const artistInfo = artistData.artists[j];
					trace.msg.log(`Checking artist ${j + 1}: "${artistInfo.name}"`);
					
					// Check for direct genres
					if (artistInfo.genres?.length > 0) {
						const genre = artistInfo.genres[0].name;
						trace.msg.log(`Found artist genre: "${genre}"`);
						genreCache.set(cacheKey, genre);
						return genre;
					}
					
					// Check for tags as fallback
					if (artistInfo.tags?.length > 0) {
						const genre = artistInfo.tags[0].name;
						trace.msg.log(`Found artist genre from tags: "${genre}"`);
						genreCache.set(cacheKey, genre);
						return genre;
					}
				}
			}
		}
		
		trace.msg.log(`No genres found for track or artist`);
	} catch (error) {
		trace.msg.err(`MusicBrainz API error: ${error}`);
	}
	
	// Default fallback
	const fallback = 'Unknown Genre';
	trace.msg.log(`Using fallback genre: "${fallback}"`);
	genreCache.set(cacheKey, fallback);
	return fallback;
}

// Function to update genre display and playing from text
function updateGenreDisplay(genre: string): void {
	trace.msg.log(`updateGenreDisplay called with: "${genre}"`);
	
	// Update the "Playing From" text with genre status
	const playingFromElement = document.querySelector('[data-test="footer-player"] [class*="playingFrom"], [data-test="footer-player"] [class*="source"], [data-test="footer-player"] [class*="_source"], [data-test="footer-player"] [class*="playingContext"], [data-test="footer-player"] [class*="_playingContext"]') as HTMLElement;
	
	trace.msg.log(`Found playingFromElement:`, playingFromElement);
	
	// If we can't find it by class, try to find it by content
	if (!playingFromElement) {
		const allElements = document.querySelectorAll('[data-test="footer-player"] *');
		for (const element of allElements) {
			if (element.textContent?.includes('PLAYING FROM') || element.textContent?.includes('TRACKS') || element.textContent?.includes('ALBUM')) {
				(element as HTMLElement).textContent = genre === 'Detecting Genre...' ? 'DETECTING GENRE...' : 
					(genre === 'Error' || genre === 'No track info' || genre === 'Unknown Genre') ? 'FAILED TO GET GENRE' : 
					`GENRE: ${genre.toUpperCase()}`;
				break;
			}
		}
	}
	
	if (playingFromElement) {
		if (genre === 'Loading...' || genre === 'Detecting Genre...') {
			trace.msg.log(`Setting text to: Detecting Genre...`);
			playingFromElement.textContent = 'Detecting Genre...';
		} else if (genre === 'Error' || genre === 'No track info' || genre === 'Unknown Genre') {
			trace.msg.log(`Setting text to: Genre N/A`);
			playingFromElement.textContent = 'Genre N/A';
		} else {
			const displayText = `Genre: ${genre}`;
			trace.msg.log(`Setting text to: ${displayText}`);
			playingFromElement.textContent = displayText;
		}
	}
	
	// Also create the small genre display as before
	let genreElement = document.querySelector('.genre-display') as HTMLElement;
	
	if (!genreElement) {
		const playerInfo = document.querySelector('[data-test="footer-player"] [class*="_infoWrapper"], [data-test="footer-player"] [class*="_textContainer"]');
		
		if (playerInfo) {
			genreElement = document.createElement('div');
			genreElement.className = 'genre-display';
			genreElement.style.cssText = `
				font-size: 12px;
				opacity: 0.7;
				margin-top: 2px;
				color: inherit;
				font-weight: 400;
			`;
			
			const artistElement = playerInfo.querySelector('[class*="_artist"], [class*="Artist"]');
			if (artistElement?.parentNode) {
				artistElement.parentNode.insertBefore(genreElement, artistElement.nextSibling);
			} else {
				playerInfo.appendChild(genreElement);
			}
		}
	}
	
	if (genreElement) {
		genreElement.textContent = genre;
	}
}

// Function to get current track ID from DOM
function getCurrentTrackId(): string | null {
	// Check URL for track ID
	const urlMatch = window.location.href.match(/\/track\/(\d+)/);
	if (urlMatch) {
		return urlMatch[1];
	}
	
	// Check DOM for track links
	const trackLink = document.querySelector('a[href*="/track/"]');
	if (trackLink) {
		const href = trackLink.getAttribute('href');
		const match = href?.match(/\/track\/(\d+)/);
		if (match) {
			return match[1];
		}
	}
	
	return null;
}

// Function to handle track changes
async function handleTrackChange(trackId: string): Promise<void> {
	if (isProcessing) {
		trace.msg.log(`Already processing, skipping track ID: ${trackId}`);
		return;
	}
	
	isProcessing = true;
	trace.msg.log(`Starting track change for ID: ${trackId}`);
	
	try {
		updateGenreDisplay('Detecting Genre...');
		
		// Get track data from TidalApi
		trace.msg.log(`Calling TidalApi.track(${trackId})...`);
		const trackData = await TidalApi.track(trackId);
		
		trace.msg.log(`TidalApi response:`, JSON.stringify(trackData, null, 2));
		
		if (trackData?.title && trackData?.artist?.name) {
			const title = trackData.title;
			const artist = trackData.artist.name;
			
			trace.msg.log(`Extracted track info - Title: "${title}", Artist: "${artist}"`);
			
			const genre = await getGenreFromMusicBrainz(title, artist);
			trace.msg.log(`getGenreFromMusicBrainz returned: "${genre}"`);
			
			trace.msg.log(`Calling updateGenreDisplay with: "${genre}"`);
			updateGenreDisplay(genre);
			trace.msg.log(`updateGenreDisplay completed`)
		} else {
			trace.msg.warn(`Missing track data - Title: ${trackData?.title}, Artist: ${trackData?.artist?.name}`);
			trace.msg.warn(`Full trackData structure:`, trackData);
			updateGenreDisplay('No track info');
		}
	} catch (error) {
		trace.msg.err(`Error handling track change: ${error}`);
		updateGenreDisplay('Error');
	} finally {
		isProcessing = false;
		trace.msg.log(`Finished processing track ID: ${trackId}`);
	}
}

// Function to observe track changes
function observeTrackChanges(): void {
	let lastTrackId: string | null = null;
	
	const checkForChanges = () => {
		const currentTrackId = getCurrentTrackId();
		
		if (currentTrackId && currentTrackId !== lastTrackId) {
			trace.msg.log(`Track changed: ${lastTrackId} -> ${currentTrackId}`);
			lastTrackId = currentTrackId;
			
			// Small delay to ensure UI is ready
			setTimeout(() => {
				handleTrackChange(currentTrackId);
			}, 200);
		}
	};
	
	// Check every 500ms
	const interval = setInterval(checkForChanges, 500);
	unloads.add(() => clearInterval(interval));
	
	// Initial check
	checkForChanges();
}

// Clean up on unload
unloads.add(() => {
	const genreElement = document.querySelector('.genre-display');
	if (genreElement) {
		genreElement.remove();
	}
	genreCache.clear();
});

// Initialize
observeTrackChanges();
trace.msg.log('Genre Display plugin initialized'); 