import { config } from "@/index";
import { createTab, createWindow } from "@/lib/window";
import pkg from "../../package.json";

export const homeWindow = createWindow({
	id: "home",
	title: "Home",
	initial: true,
	tabs: [
		createTab({
			id: "welcome",
			title: "Welcome page",
			isActive: true,
			context: null,
			inputResolver: (context, input) => {
				if (input.type !== "keyDown") {
					return;
				}
				if (input.key === "c" && input.ctrl) {
					process.exit(0);
				}
			},
			renderer: (context) => {
				const workspace = context.workspace.get();
				return [
					[
						{
							text: `Welcome to vitrine ${pkg.version}, keyboard-centric lightweight code text editor.`,
							color: config.theme.text.primary,
						},
					],
					[
						{
							text: "This is a work in progress project created with Bun, Typescript and SDL2. Feel free to contribute or report issues.",
							color: config.theme.text.primary,
						},
					],
					[
						{
							text: " ",
							color: config.theme.text.primary,
						},
					],
					[
						{
							text: "Press CTRL+C in Home window to close the application.",
							color: config.theme.text.primary,
						},
					],
					[
						{
							text: " ",
							color: config.theme.text.primary,
						},
					],
					[
						{
							text: "==============================================",
							color: config.theme.text.plain,
						},
					],
					[
						{
							text: " ",
							color: config.theme.text.primary,
						},
					],
					[
						{
							text: "Full editor keybindings:",
							color: config.theme.text.plain,
						},
					],
					[
						{
							text: " ",
							color: config.theme.text.primary,
						},
					],
					[
						{
							text: `UP/DOWN/LEFT/RIGHT - Move cursor by 1 rows/columns`,
							color: config.theme.text.plain,
						},
					],
					[
						{
							text: `ALT+UP/ALT+DOWN/ALT+LEFT/ALT+RIGHT - Move cursor by 5 rows/columns`,
							color: config.theme.text.plain,
						},
					],
					[
						{
							text: `CTRL+Q - Move cursor to the start of the line`,
							color: config.theme.text.plain,
						},
					],
					[
						{
							text: `CTRL+E - Move cursor to the end of the line`,
							color: config.theme.text.plain,
						},
					],
					[
						{
							text: `CTRL+C - Copy selection`,
							color: config.theme.text.plain,
						},
					],
					[
						{
							text: `CTRL+V - Paste clipboard`,
							color: config.theme.text.plain,
						},
					],
					[
						{
							text: `CTRL+X - Cut selection`,
							color: config.theme.text.plain,
						},
					],
					[
						{
							text: `CTRL+L - Select current line`,
							color: config.theme.text.plain,
						},
					],
					[
						{
							text: `RETURN - Insert new line`,
							color: config.theme.text.plain,
						},
					],
					[
						{
							text: `BACKSPACE - Remove character/selection`,
							color: config.theme.text.plain,
						},
					],
					[
						{
							text: `CTRL+S - Save file dialog`,
							color: config.theme.text.plain,
						},
					],
					[
						{
							text: `CTRL+O - Open file dialog`,
							color: config.theme.text.plain,
						},
					],
					[{ text: "~", color: config.theme.text.dim }],
					...Array(workspace.rows - 22)
						.fill({})
						.map(() => {
							return [{ text: "~", color: config.theme.text.dim }];
						}),
				];
			},
		}),
		createTab({
			id: "welcome",
			title: "Options",
			isActive: false,
			context: null,
			inputResolver: () => {
				return 0;
			},
			renderer: (context) => {
				const workspace = context.workspace.get();
				return [
					[{ text: "Option 1", color: config.theme.text.primary }],
					[{ text: "Option 2", color: config.theme.text.primary }],
					[{ text: "Option 3", color: config.theme.text.primary }],
					[{ text: "Option 4", color: config.theme.text.primary }],
					[{ text: "Option 5", color: config.theme.text.primary }],
				];
			},
		}),
	],
});