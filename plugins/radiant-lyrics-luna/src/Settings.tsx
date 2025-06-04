import { ReactiveStore } from "@luna/core";
import { LunaSettings, LunaSwitchSetting } from "@luna/ui";
import React from "react";

export const settings = await ReactiveStore.getPluginStorage("RadiantLyrics", {
	hideUIEnabled: true,
	playerBarVisible: true,
	lyricsGlowEnabled: true,
	spinningCoverEverywhere: false,
});

export const Settings = () => {
	const [hideUIEnabled, setHideUIEnabled] = React.useState(settings.hideUIEnabled);
	const [playerBarVisible, setPlayerBarVisible] = React.useState(settings.playerBarVisible);
	const [lyricsGlowEnabled, setLyricsGlowEnabled] = React.useState(settings.lyricsGlowEnabled);
	const [spinningCoverEverywhere, setSpinningCoverEverywhere] = React.useState(settings.spinningCoverEverywhere);
	
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
				title="Cover Everywhere | Experimental"
				desc="Apply the spinning album cover background to the entire app, not just the Now Playing view, Heavily Inspired by Cover-Theme by @Inrixia"
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
		</LunaSettings>
	);
}; 