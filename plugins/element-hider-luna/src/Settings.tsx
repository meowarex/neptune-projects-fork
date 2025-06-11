import { ReactiveStore } from "@luna/core";
import { LunaSettings } from "@luna/ui";
import React from "react";

export const settings = await ReactiveStore.getPluginStorage("ElementHider", {
	hiddenElements: [] as Array<{
		selector: string;
		tagName: string;
		className: string;
		textContent: string;
		timestamp: number;
	}>
});

export const Settings = () => {
	const [hiddenElementsCount, setHiddenElementsCount] = React.useState(settings.hiddenElements.length);
	
	// Update count when settings change
	React.useEffect(() => {
		const interval = setInterval(() => {
			setHiddenElementsCount(settings.hiddenElements.length);
		}, 1000);
		
		return () => clearInterval(interval);
	}, []);
	
	return null;
}; 