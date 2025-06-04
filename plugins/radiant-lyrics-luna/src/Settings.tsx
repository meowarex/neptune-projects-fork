import { ReactiveStore } from "@luna/core";
import { LunaSettings, LunaSwitchSetting, LunaNumberSetting } from "@luna/ui";
import React from "react";

export const settings = await ReactiveStore.getPluginStorage("RadiantLyrics", {
	hideUIEnabled: true,
	playerBarVisible: true,
	lyricsGlowEnabled: true,
	spinningCoverEverywhere: false,
	performanceMode: false,
	backgroundContrast: 120,
	backgroundBlur: 80,
	backgroundBrightness: 40,
});

export const Settings = () => {
	const [hideUIEnabled, setHideUIEnabled] = React.useState(settings.hideUIEnabled);
	const [playerBarVisible, setPlayerBarVisible] = React.useState(settings.playerBarVisible);
	const [lyricsGlowEnabled, setLyricsGlowEnabled] = React.useState(settings.lyricsGlowEnabled);
	const [spinningCoverEverywhere, setSpinningCoverEverywhere] = React.useState(settings.spinningCoverEverywhere);
	const [performanceMode, setPerformanceMode] = React.useState(settings.performanceMode);
	const [backgroundContrast, setBackgroundContrast] = React.useState(settings.backgroundContrast);
	const [backgroundBlur, setBackgroundBlur] = React.useState(settings.backgroundBlur);
	const [backgroundBrightness, setBackgroundBrightness] = React.useState(settings.backgroundBrightness);
	
	return (
		<LunaSettings>
			<LunaSwitchSetting
				title="Lyrics Glow Effect"
				desc="Enable glowing effect for lyrics & Font Stytling Changes"
				checked={lyricsGlowEnabled}
				onChange={(_, checked: boolean) => {
					console.log("Lyrics Glow Effect:", checked ? "enabled" : "disabled");
					setLyricsGlowEnabled((settings.lyricsGlowEnabled = checked));
					// Update styles immediately when setting changes
					if ((window as any).updateRadiantLyricsStyles) {
						(window as any).updateRadiantLyricsStyles();
					}
				}}
			/>
			<LunaSwitchSetting
				title="Hide UI Feature"
				desc="Enable hide/unhide UI functionality with toggle buttons"
				checked={hideUIEnabled}
				onChange={(_, checked: boolean) => {
					console.log("Hide UI Feature:", checked ? "enabled" : "disabled");
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
				desc="Apply the spinning CoverArt background to the entire app, not just the Now Playing view, Heavily Inspired by Cover-Theme by @Inrixia"
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
				desc="Disable spinning animations to reduce performance impact on your computer (backgrounds become static)"
				checked={performanceMode}
				onChange={(_, checked: boolean) => {
					console.log("Performance Mode:", checked ? "enabled" : "disabled");
					setPerformanceMode((settings.performanceMode = checked));
					// Update background animations immediately when setting changes
					if ((window as any).updateRadiantLyricsGlobalBackground) {
						(window as any).updateRadiantLyricsGlobalBackground();
					}
					if ((window as any).updateRadiantLyricsPerformanceMode) {
						(window as any).updateRadiantLyricsPerformanceMode();
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
					console.log("Background Contrast:", value);
					setBackgroundContrast((settings.backgroundContrast = value));
					if ((window as any).updateRadiantLyricsGlobalBackground) {
						(window as any).updateRadiantLyricsGlobalBackground();
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
				}}
			/>
		</LunaSettings>
	);
}; 