import { config } from "@/index";
import { type TextOption, type TextRow } from "@/lib/text";
import type { Window } from "@/lib/window";
import type { Workspace } from "@/lib/workspace";

export function wrapper({ windows, workspace }: { windows: Window[]; workspace: Workspace }) {
	const activeWindow = windows.find((window) => window.isActive);
	if (!activeWindow) {
		return;
	}
	const activeTab = activeWindow.getActiveTab();

	return {
		topBarRenderer: () => {
			const navigation = [
				[
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

			const activeTabTopBarRenderer =
				activeTab?.topBarRenderer !== undefined
					? activeTab.topBarRenderer({ data: activeTab.context, workspace, tab: activeTab })
					: undefined;

			return activeTabTopBarRenderer
				? [...navigation, ...activeTabTopBarRenderer]
				: ([...navigation] as TextRow[][]);
		},
		bottomBarRenderer: () => {
			return activeTab && activeTab.downBarRenderer !== undefined
				? activeTab.downBarRenderer({ data: activeTab.context, workspace, tab: activeTab })
				: ([
						[
							{
								text: `made by Kunv // kunv.dev`,
								color: config.theme.text.plain,
							},
						],
				  ] as TextRow[][]);
		},
	};
}
