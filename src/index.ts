import { createConfig, defaultConfig } from "@/config";
import { renderTextRow } from "@/lib/text";
import type { Window } from "@/lib/window";
import { createWorkspace } from "@/lib/workspace";
import { createAsyncGlobal } from "@/utils";
import { editorWindow } from "@/windows/editor";
import { homeWindow } from "@/windows/home";
import { wrapper } from "@/wrapper";
import sdl from "@kmamal/sdl";
import { createCanvas } from "canvas";
process.title = "vitrine";

export const workspace = createWorkspace({ cols: 80, rows: 24 });
export const windows: Window[] = [homeWindow, editorWindow];

// Setup
const window = sdl.video.createWindow({ title: "vitrine" });
window.setResizable(true);
const { pixelWidth: width, pixelHeight: height } = window;
const canvas = createCanvas(width, height);
const ctx = canvas.getContext("2d");

let enableRender = true;

export const configHandler = createAsyncGlobal(async () => createConfig(), {
	...defaultConfig,
	modify: () => null,
});

// here this is a fallback value until the async config loader is resolved
export let config = configHandler.get();

const configLoadInterval = setInterval(() => {
	// if async config loader is resolved, then set config and render result
	if (configHandler.ready) {
		config = configHandler.get();
		clearInterval(configLoadInterval);
		enableRender = true;
	}
}, 150);

function render(width = canvas.width, height = canvas.height) {
	ctx.fillStyle = config.theme.background.primary;
	ctx.fillRect(0, 0, width, height);

	const dimensions = workspace.set({
		cols: Math.round(width / (config.font.size / 2)),
		rows: Math.floor(height / config.font.size),
	});

	const appWrapper = wrapper({ windows, workspace });
	if (!appWrapper) {
		return;
	}

	const topBarRenderer = appWrapper.topBarRenderer();
	const bottomBarRenderer = appWrapper.bottomBarRenderer();

	workspace.set({
		cols: dimensions.cols,
		rows: dimensions.rows - topBarRenderer.length - bottomBarRenderer.length,
	});

	let startRowIndex = 1;

	const activeWindow = windows.find((window) => window.isActive);
	if (!activeWindow) {
		return;
	}
	const activeTab = activeWindow.tabs.find((tab) => tab.isActive);
	if (!activeTab) {
		return;
	}
	const activeTabContext = activeTab.context;

	for (let i = 0; i < topBarRenderer.length; i++) {
		const row = topBarRenderer[i];
		// @ts-expect-error - that's most proper type
		renderTextRow({ ctx, content: row, row: startRowIndex + i });
	}

	ctx.fillStyle = config.theme.background.secondary;

	ctx.fillRect(0, startRowIndex * config.font.size + 2, width, 1);

	startRowIndex += topBarRenderer.length;

	const activeTabRenderer = activeTab.renderer({
		workspace,
		data: activeTabContext,
		tab: activeTab,
		window: activeWindow,
	});
	const activeTabRendererLength = activeTabRenderer.length;

	for (let i = 0; i < activeTabRendererLength; i++) {
		const row = activeTabRenderer[i];
		// @ts-expect-error - that's most proper type
		renderTextRow({ ctx, content: row, row: i + startRowIndex });
	}

	startRowIndex += activeTabRendererLength;

	for (let i = 0; i < bottomBarRenderer.length; i++) {
		const row = bottomBarRenderer[i];
		// @ts-expect-error - that's most proper type
		renderTextRow({ ctx, content: row, row: i + startRowIndex });
	}

	// Render to window
	const buffer = canvas.toBuffer("raw");
	window.render(width, height, width * 4, "bgra32", buffer);
}

render();

window.on("resize", (event) => {
	canvas.width = event.pixelWidth;
	canvas.height = event.pixelHeight;

	render(event.pixelWidth, event.pixelHeight);
});

window.on("textInput", (input) => {
	const activeTab = windows.find((window) => window.isActive)?.getActiveTab();
	enableRender = true;

	if (!activeTab) {
		return;
	}

	activeTab.inputResolver(
		{
			workspace: workspace,
			data: activeTab.context,
			tab: activeTab,
			window: windows.find((window) => window.isActive),
		},
		input
	);
});

window.on("keyDown", (input) => {
	enableRender = true;

	// zooming in and out
	if (input.ctrl && input.scancode === 45) {
		config.modify("font.size", config.font.size - 2);
	}
	if (input.ctrl && input.scancode === 46) {
		config.modify("font.size", config.font.size + 2);
	}

	if (
		windows
			.map((window, index) => {
				// @ts-expect-error - that's kinda safe
				return sdl.keyboard.SCANCODE[`F${index + 1}`];
			})
			.includes(input.scancode)
	) {
		windows.forEach((_window, index) => {
			// @ts-expect-error - that's kinda safe
			if (sdl.keyboard.SCANCODE[`F${index + 1}`] === input.scancode) {
				_window.isActive = true;
				window.setTitle("vitrine | " + _window.tabs.find((tab) => tab.isActive)?.title);
			} else {
				_window.isActive = false;
			}
		});
	}

	const activeWindow = windows.find((window) => window.isActive);

	if (!activeWindow) {
		return;
	}

	if (
		activeWindow.tabs
			.map((tab, index) => {
				// @ts-expect-error - that's kinda safe
				return sdl.keyboard.SCANCODE[index + 1];
			})
			.includes(input.scancode) &&
		input.ctrl
	) {
		activeWindow.tabs.forEach((tab, index) => {
			// @ts-expect-error - that's kinda safe
			// from 0-9
			if (sdl.keyboard.SCANCODE[index + 1] === input.scancode) {
				tab.isActive = true;
				window.setTitle("vitrine | " + activeWindow.tabs.find((tab) => tab.isActive)?.title);
			} else {
				tab.isActive = false;
			}
		});
	}

	const activeTab = activeWindow.tabs.find((tab) => tab.isActive);
	if (!activeTab) {
		return;
	}
	activeTab.inputResolver(
		{
			workspace: workspace,
			data: activeTab.context,
			tab: activeTab,
			window: windows.find((window) => window.isActive),
		},
		input
	);

	activeTab.updateDataFromContext(activeTab.context);
});

setInterval(() => {
	if (!enableRender) {
		return;
	}
	render();
	enableRender = false;
}, 1000 / config.fps);
