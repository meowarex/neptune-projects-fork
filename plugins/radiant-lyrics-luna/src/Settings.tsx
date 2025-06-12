import { ReactiveStore } from "@luna/core";
import { LunaSettings, LunaSwitchSetting, LunaNumberSetting } from "@luna/ui";
import React from "react";

export const settings = await ReactiveStore.getPluginStorage("RadiantLyrics", {
	hideUIEnabled: true,
	playerBarVisible: true,
	lyricsGlowEnabled: true,
	wordByWordGlowEnabled: false,
	spinningCoverEverywhere: false,
	performanceMode: false,
	spinningArtEnabled: true,
	backgroundContrast: 120,
	backgroundBlur: 80,
	backgroundBrightness: 40,
	spinSpeed: 45,
	settingsAffectNowPlaying: true,
});

export const Settings = () => {
	const [hideUIEnabled, setHideUIEnabled] = React.useState(settings.hideUIEnabled);
	const [playerBarVisible, setPlayerBarVisible] = React.useState(settings.playerBarVisible);
	const [lyricsGlowEnabled, setLyricsGlowEnabled] = React.useState(settings.lyricsGlowEnabled);
	const [wordByWordGlowEnabled, setWordByWordGlowEnabled] = React.useState(settings.wordByWordGlowEnabled);
	const [spinningCoverEverywhere, setSpinningCoverEverywhere] = React.useState(settings.spinningCoverEverywhere);
	const [performanceMode, setPerformanceMode] = React.useState(settings.performanceMode);
	const [spinningArtEnabled, setSpinningArtEnabled] = React.useState(settings.spinningArtEnabled);
	const [backgroundContrast, setBackgroundContrast] = React.useState(settings.backgroundContrast);
	const [backgroundBlur, setBackgroundBlur] = React.useState(settings.backgroundBlur);
	const [backgroundBrightness, setBackgroundBrightness] = React.useState(settings.backgroundBrightness);
	const [spinSpeed, setSpinSpeed] = React.useState(settings.spinSpeed);
	const [settingsAffectNowPlaying, setSettingsAffectNowPlaying] = React.useState(settings.settingsAffectNowPlaying);
	
	return (
		<LunaSettings>
			<LunaSwitchSetting
				title="Lyrics Glow Effect"
				desc="Enable glowing effect for lyrics & Font Stytling Changes"
				checked={lyricsGlowEnabled}
				onChange={(_, checked: boolean) => {
					setLyricsGlowEnabled((settings.lyricsGlowEnabled = checked));
					// Update styles immediately when setting changes
					if ((window as any).updateRadiantLyricsStyles) {
						(window as any).updateRadiantLyricsStyles();
					}
				}}
			/>
			<LunaSwitchSetting
				title="Word by Word Glow | Experimental"
				desc="Enable word-by-word glow effect"
				checked={wordByWordGlowEnabled}
				onChange={(_, checked: boolean) => {
					setWordByWordGlowEnabled((settings.wordByWordGlowEnabled = checked));
					// Update word tracking when setting changes
					if ((window as any).updateWordByWordTracking) {
						(window as any).updateWordByWordTracking();
					}
				}}
			/>
			<LunaSwitchSetting
				title="Hide UI Feature"
				desc="Enable hide/unhide UI functionality with toggle buttons"
				checked={hideUIEnabled}
				onChange={(_, checked: boolean) => {
					setHideUIEnabled((settings.hideUIEnabled = checked));
				}}
			/>
			<LunaSwitchSetting
				title="Player Bar Visibility in Hide UI Mode"
				desc="Keep player bar visible when UI is hidden"
				checked={playerBarVisible}
				onChange={(_, checked: boolean) => {
					console.log("Player Bar Visibility:", checked ? "visible" : "hidden");
					setPlayerBarVisible((settings.playerBarVisible = checked));
					// Update styles immediately when setting changes
					if ((window as any).updateRadiantLyricsStyles) {
						(window as any).updateRadiantLyricsStyles();
					}
				}}
			/>
			<LunaSwitchSetting
				title="Cover Everywhere | Experimental"
				desc="Apply the spinning Cover Art background to the entire app, not just the Now Playing view, Heavily Inspired by Cover-Theme by @Inrixia"
				checked={spinningCoverEverywhere}
				onChange={(_, checked: boolean) => {
					console.log("Spinning Cover Everywhere:", checked ? "enabled" : "disabled");
					setSpinningCoverEverywhere((settings.spinningCoverEverywhere = checked));
					// Update styles immediately when setting changes
					if ((window as any).updateRadiantLyricsGlobalBackground) {
						(window as any).updateRadiantLyricsGlobalBackground();
					}
				}}
			/>
			<LunaSwitchSetting
				title="Performance Mode"
				desc="Performance mode: Reduces blur effects (20px), uses smaller image sizes, to optimize GPU usage"
				checked={performanceMode}
				onChange={(_, checked: boolean) => {
					console.log("Performance Mode:", checked ? "enabled" : "disabled");
					setPerformanceMode((settings.performanceMode = checked));
					// Update background animations immediately when setting changes
					if ((window as any).updateRadiantLyricsGlobalBackground) {
						(window as any).updateRadiantLyricsGlobalBackground();
					}
					if ((window as any).updateRadiantLyricsNowPlayingBackground) {
						(window as any).updateRadiantLyricsNowPlayingBackground();
					}
				}}
			/>
			<LunaSwitchSetting
				title="Background Cover Spin" // Cheers @Max/n0201 for the idea <3
				desc="Enable the spinning cover art background animation"
				checked={spinningArtEnabled}
				onChange={(_, checked: boolean) => {
					console.log("Background Cover Spin:", checked ? "enabled" : "disabled");
					setSpinningArtEnabled((settings.spinningArtEnabled = checked));
					if ((window as any).updateRadiantLyricsGlobalBackground) {
						(window as any).updateRadiantLyricsGlobalBackground();
					}
					if (settings.settingsAffectNowPlaying && (window as any).updateRadiantLyricsNowPlayingBackground) {
						(window as any).updateRadiantLyricsNowPlayingBackground();
					}
				}}
			/>
			<LunaNumberSetting
				title="Background Contrast"
				desc="Adjust the contrast of the spinning background (0-200, default: 120)"
				min={0}
				max={200}
				step={1}
				value={backgroundContrast}
				onNumber={(value: number) => {
					setBackgroundContrast((settings.backgroundContrast = value));
					if ((window as any).updateRadiantLyricsGlobalBackground) {
						(window as any).updateRadiantLyricsGlobalBackground();
					}
					if (settings.settingsAffectNowPlaying && (window as any).updateRadiantLyricsNowPlayingBackground) {
						(window as any).updateRadiantLyricsNowPlayingBackground();
					}
				}}
			/>
			<LunaNumberSetting
				title="Background Blur"
				desc="Adjust the blur amount of the spinning background (0-200, default: 80)"
				min={0}
				max={200}
				step={1}
				value={backgroundBlur}
				onNumber={(value: number) => {
					console.log("Background Blur:", value);
					setBackgroundBlur((settings.backgroundBlur = value));
					if ((window as any).updateRadiantLyricsGlobalBackground) {
						(window as any).updateRadiantLyricsGlobalBackground();
					}
					if (settings.settingsAffectNowPlaying && (window as any).updateRadiantLyricsNowPlayingBackground) {
						(window as any).updateRadiantLyricsNowPlayingBackground();
					}
				}}
			/>
			<LunaNumberSetting
				title="Background Brightness"
				desc="Adjust the brightness of the spinning background (0-100, default: 40)"
				min={0}
				max={100}
				step={1}
				value={backgroundBrightness}
				onNumber={(value: number) => {
					console.log("Background Brightness:", value);
					setBackgroundBrightness((settings.backgroundBrightness = value));
					if ((window as any).updateRadiantLyricsGlobalBackground) {
						(window as any).updateRadiantLyricsGlobalBackground();
					}
					if (settings.settingsAffectNowPlaying && (window as any).updateRadiantLyricsNowPlayingBackground) {
						(window as any).updateRadiantLyricsNowPlayingBackground();
					}
				}}
			/>
			<LunaNumberSetting
				title="Spin Speed"
				desc="Adjust the rotation speed in seconds (10-120, default: 45) - Lower values = Faster rotation"
				min={10}
				max={120}
				step={1}
				value={spinSpeed}
				onNumber={(value: number) => {
					console.log("Spin Speed:", value);
					setSpinSpeed((settings.spinSpeed = value));
					if ((window as any).updateRadiantLyricsGlobalBackground) {
						(window as any).updateRadiantLyricsGlobalBackground();
					}
					if (settings.settingsAffectNowPlaying && (window as any).updateRadiantLyricsNowPlayingBackground) {
						(window as any).updateRadiantLyricsNowPlayingBackground();
					}
				}}
			/>
			<LunaSwitchSetting
				title="Settings Affect Now Playing"
				desc="Apply background settings to Now Playing view"
				checked={settingsAffectNowPlaying}
				onChange={(_, checked: boolean) => {
					console.log("Settings Affect Now Playing:", checked ? "enabled" : "disabled");
					setSettingsAffectNowPlaying((settings.settingsAffectNowPlaying = checked));
					// Update Now Playing background immediately when setting changes
					if ((window as any).updateRadiantLyricsNowPlayingBackground) {
						(window as any).updateRadiantLyricsNowPlayingBackground();
					}
				}}
			/>
		</LunaSettings>
	);
}; 