import { ReactiveStore } from "@luna/core";
import { LunaSettings, LunaSwitchSetting } from "@luna/ui";
import React from "react";

export const settings = await ReactiveStore.getPluginStorage("OLEDTheme", {
	qualityColorMatchedSeekBar: true,
	oledFriendlyButtons: true,
});

export const Settings = () => {
	const [qualityColorMatchedSeekBar, setQualityColorMatchedSeekBar] = React.useState(settings.qualityColorMatchedSeekBar);
	const [oledFriendlyButtons, setOledFriendlyButtons] = React.useState(settings.oledFriendlyButtons);
	
	return (
		<LunaSettings>
			<LunaSwitchSetting
				title="Quality Color Matched Seek Bar"
				desc="Apply Tidals Default color styling for the seek bar for color mathcing with song quality"
				checked={qualityColorMatchedSeekBar}
				onChange={(_, checked) => {
					console.log("Quality Color Matched Seek Bar:", checked ? "enabled" : "disabled");
					setQualityColorMatchedSeekBar((settings.qualityColorMatchedSeekBar = checked));
					// Update styles immediately when setting changes
					if ((window as any).updateOLEDThemeStyles) {
						(window as any).updateOLEDThemeStyles();
					}
				}}
			/>
			<LunaSwitchSetting
				title="OLED Friendly Buttons"
				desc="Remove button styling from OLED theme to keep buttons with original Tidal appearance"
				checked={oledFriendlyButtons}
				onChange={(_, checked) => {
					console.log("OLED Friendly Buttons:", checked ? "enabled" : "disabled");
					setOledFriendlyButtons((settings.oledFriendlyButtons = checked));
					// Update styles immediately when setting changes
					if ((window as any).updateOLEDThemeStyles) {
						(window as any).updateOLEDThemeStyles();
					}
				}}
			/>
		</LunaSettings>
	);
}; 