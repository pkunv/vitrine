import { config } from "@/index";
import { type TextOption, type TextRow } from "@/lib/text";
import type { Window } from "@/lib/window";
import { formatMemoryUsage } from "@/utils";

export function wrapper({ windows }: { windows: Window[] }) {
	const activeWindow = windows.find((window) => window.isActive);
	if (!activeWindow) {
		return;
	}

	return {
		topBarRenderer: () => {
			return [
				[
					{ text: "🅥 ", color: config.theme.text.primary },
					{ text: "vitrine", color: config.theme.text.primary },
					{ text: " | ", color: config.theme.text.primary },
					...windows.map((window, index) => {
						return {
							text: `[${window.title} F${index + 1}]`,
							color: config.theme.text.plain,
							options: window.isActive ? (["bold"] as TextOption[]) : undefined,
							bgColor: window.isActive ? config.theme.background.secondary : undefined,
						};
					}),
				],
				[
					...activeWindow.tabs.map((tab, index) => {
						return {
							text: `[${tab.title} CTRL+${index + 1}]`,
							color: config.theme.text.plain,
							options: tab.isActive ? (["bold"] as TextOption[]) : undefined,
							bgColor: tab.isActive ? config.theme.background.secondary : undefined,
						};
					}),
				],
			] as TextRow[][];
		},
		bottomBarRenderer: () => {
			return [
				[
					{
						text: `RAM Usage: ${formatMemoryUsage(process.memoryUsage().external)} (too high bruh)`,
						color: config.theme.text.plain,
					},
				],
			] as TextRow[][];
		},
	};
}
