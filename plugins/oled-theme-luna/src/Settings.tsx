import { ReactiveStore } from "@luna/core";
import { LunaSettings, LunaSwitchSetting } from "@luna/ui";
import React from "react";

export const settings = await ReactiveStore.getPluginStorage("OLEDTheme", {
	qualityColorMatchedSeekBar: true,
});

export const Settings = () => {
	const [qualityColorMatchedSeekBar, setQualityColorMatchedSeekBar] = React.useState(settings.qualityColorMatchedSeekBar);
	
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
		</LunaSettings>
	);
}; 