import { renderTextRow } from "@/lib/text";
import type { Window } from "@/lib/window";
import { createWorkspace } from "@/lib/workspace";
import { editorWindow } from "@/windows/editor";
import { homeWindow } from "@/windows/home";
import { wrapper } from "@/wrapper";
import sdl from "@kmamal/sdl";
import { createCanvas, registerFont } from "canvas";
import path from "path";

process.title = "vitrine";

export const config = {
	width: 640,
	height: 480,
	fontSize: 16,
	font: {
		size: 16,
		family: "Fira Code",
		path: path.join(process.cwd(), "src", "fonts", "FiraCode-Regular.ttf"),
	},
	theme: {
		background: {
			primary: "#141414",
			secondary: "gray",
		},
		text: {
			plain: "white",
			primary: "#9EDF9C",
			dim: "gray",
		},
	},
};

export enum keyDownType {
	ctrl = 0,
	shift = 1,
	alt = 2,
	meta = 3,
}

registerFont(config.font.path, { family: config.font.family });

// Setup
const window = sdl.video.createWindow({ title: "vitrine" });
window.setResizable(true);
const { pixelWidth: width, pixelHeight: height } = window;
const canvas = createCanvas(width, height);
const ctx = canvas.getContext("2d");

let text = "Hello, World!\nhere is something nice";

export const workspace = createWorkspace({ cols: 80, rows: 24 });
export const windows: Window[] = [homeWindow, editorWindow];

function render(width = canvas.width, height = canvas.height) {
	ctx.fillStyle = "#141414";
	ctx.fillRect(0, 0, width, height);

	const dimensions = {
		cols: Math.round(width / (config.fontSize / 2)),
		rows: Math.floor(height / config.fontSize),
	};

	const appWrapper = wrapper({ windows });
	if (!appWrapper) {
		return;
	}

	workspace.set({
		cols: dimensions.cols,
		rows:
			dimensions.rows - appWrapper.topBarRenderer().length - appWrapper.bottomBarRenderer().length,
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

	for (let i = 0; i < appWrapper.topBarRenderer().length; i++) {
		const row = appWrapper.topBarRenderer()[i];
		// @ts-expect-error - that's most proper type
		renderTextRow({ ctx, content: row, row: startRowIndex + i });
	}

	ctx.fillStyle = config.theme.background.secondary;

	ctx.fillRect(0, startRowIndex * config.fontSize + 2, width, 1);

	startRowIndex += appWrapper.topBarRenderer().length;

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

	for (let i = 0; i < appWrapper.bottomBarRenderer().length; i++) {
		const row = appWrapper.bottomBarRenderer()[i];
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

	render();
});

window.on("keyDown", (input) => {
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

	render();
});

/*
	key.scancode === sdl.keyboard.SCANCODE.ESCAPE && window.destroy();

	key.key.scancode === sdl.keyboard.SCANCODE.BACKSPACE && (text = text.slice(0, -1));

	key.scancode === sdl.keyboard.SCANCODE.RETURN && (text += "\n");
	*/
