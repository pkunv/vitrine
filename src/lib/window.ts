import type { Editor } from "@/editor";

import type { TextRow } from "@/lib/text";
import type { Workspace } from "@/lib/workspace";
import sdl from "@kmamal/sdl";

// change in one sec
export type ContextTypes = Editor | null;

export interface TabContext<T> {
	workspace: Workspace;
	data: T;
	tab: Tab;
	window?: Window;
}

export interface TabConfig {
	id: string;
	title?: string;
	isActive: boolean;
	renderer: (context: TabContext<ContextTypes>) => TextRow[][];
	downBarRenderer?: (context: TabContext<ContextTypes>) => TextRow[][];
	inputResolver: (
		context: TabContext<ContextTypes>,
		input: sdl.Events.Window.KeyDown | sdl.Events.Window.TextInput
	) => void;
	context: ContextTypes;
}

export interface WindowConfig {
	id: string;
	title: string;
	tabs: Tab[];
	initial: boolean;
}

export type Tab = ReturnType<typeof createTab>;
export type Window = ReturnType<typeof createWindow>;

export function createTab(tabConfig: TabConfig) {
	let isActive = tabConfig.isActive || false;
	return {
		id: tabConfig.id,
		title: tabConfig.title ?? tabConfig.context?.getMetadata().filename,
		renderer: tabConfig.renderer,
		downBarRenderer: tabConfig.downBarRenderer,
		inputResolver: tabConfig.inputResolver,
		context: tabConfig.context,
		isActive,
		setActive: (value: boolean) => {
			isActive = value;
		},
		updateDataFromContext: (context: ContextTypes) => {
			if (context === null) {
				return;
			}
			tabConfig.title = context.getMetadata().filename;
		},
	};
}

export function createWindow(windowConfig: WindowConfig) {
	const tabs = windowConfig.tabs || [];
	let isActive = windowConfig.initial || false;

	return {
		id: windowConfig.id,
		title: windowConfig.title,
		tabs: windowConfig.tabs as Tab[],
		isActive: isActive,
		createTab: (tabConfig: TabConfig) => {
			tabs.push(createTab(tabConfig) as Tab);
		},
		deleteTab: (tabId: string) => {
			const index = tabs.findIndex((tab) => tab.id === tabId);
			tabs.splice(index, 1);
		},
		getActiveTab: () => {
			return tabs.find((tab) => tab.isActive);
		},
		setActiveTab: (tabId: string) => {
			tabs.forEach((tab) => {
				tab.setActive(tab.id === tabId);
			});
		},
	};
}
