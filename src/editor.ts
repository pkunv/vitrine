import { config } from "@/index";
import type { TextRow } from "@/lib/text";
import type { ContextTypes, TabContext } from "@/lib/window";
import sdl from "@kmamal/sdl";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { EOL } from "os";

export type Editor = ReturnType<typeof createEditor>;

export function createEditor({
	src,
	startCol,
	startRow,
}: {
	src?: string;
	startCol?: number;
	startRow?: number;
}) {
	const text = src ? readFileSync(src, "utf-8") : "\n";
	let actionVerboseStatus = "";
	let lastCharCol = 0;
	let col = startCol || 0;
	let row = startRow || 0;
	let newSrc = src ?? process.cwd();
	const content: string[] = text ? text.split(EOL) : [];
	let isSelecting = false;
	let dialogStatus = {
		save: false,
		load: false,
		find: false,
	};

	const selection = {
		start: { col: 0, row: 0 },
		end: { col: 0, row: 0 },
	} as {
		start: { col: number; row: number };
		end: { col: number; row: number };
	};

	function moveCursor(x: number, y: number, forceLastCharCol = false) {
		col += x;
		row += y;

		if (content[row] === undefined) {
			content[row] = "";
		}

		if (x != 0 && content[row] !== "") {
			lastCharCol = col;
		}

		if (y != 0 && content[row] !== "") {
			col = forceLastCharCol
				? content[row].length
				: content[row].length < lastCharCol
				? content[row].length
				: lastCharCol;
			lastCharCol = col;
		}
		if (y != 0 && content[row] === "") {
			col = 0;
		}

		if (y != 0 && col > content[row].length) {
			moveCursor(0, 1);
		}
		if (col < 0) {
			moveCursor(0, -1);
		}

		if (isSelecting) {
			selection.end = { col, row };
		}
	}

	function setCursor(x: number, y: number) {
		col = x;
		row = y;
	}

	function getCursor() {
		return { col, row };
	}

	function getContent() {
		return content;
	}

	function insertCharacter(character: string) {
		const line = content[row];
		content[row] = line.substring(0, col) + character + line.substring(col);
		moveCursor(character.length, 0);
	}

	function removeCharacter() {
		if (isSelecting) {
			removeSelection();
			return;
		}
		if (col === 0 && (content[row].length === 0 || content[row] === " ")) {
			content.splice(row, 1);
			moveCursor(0, -1, true);
			return;
		}
		const line = content[row];
		content[row] = line.substring(0, col - 1) + line.substring(col);
		if (col > 0) moveCursor(-1, 0);
		/*
		if (content[row] === "") {
			content.splice(row, 1);
			moveCursor(0, -1);
		}
      */
		if (col === 0 && content[row].length > 0) {
			content.splice(row, 1);
			moveCursor(0, -1);
			content[row] += line;
		}
	}

	function insertNewLine() {
		const line = content[row];
		const newLine = line.substring(col);
		content[row] = line.substring(0, col);
		moveCursor(0, 1);
		content.splice(row, 0, newLine);
	}

	function registerSelection() {
		if (!isSelecting) {
			selection!.start = { col, row };
		}
		isSelecting = true;
	}

	function endSelection() {
		isSelecting = false;
	}

	function getIsSelecting() {
		return isSelecting;
	}

	function getSelection() {
		return selection;
	}

	function copySelection() {
		endSelection();
		const result = [];
		const sel = selection;
		for (let i = 0; i < content.length; i++) {
			if ((i >= sel.end.row && i <= sel.start.row) || (i >= sel.start.row && i <= sel.end.row)) {
				const startCol = sel.start.row === i ? sel.start.col : 0;
				const endCol = sel.end.row === i ? sel.end.col : content[i].length;
				result.push(content[i].substring(startCol, endCol));
			}
		}

		sdl.clipboard.setText(result.join(EOL));
	}

	function pasteClipboard() {
		const clipboardContent = sdl.clipboard.text;
		const clipboardLines = clipboardContent.split(EOL);
		if (clipboardLines.length > 1) {
			const line = content[row];
			content[row] = line.substring(0, col) + clipboardLines[0] + line.substring(col);
			for (let i = 1; i < clipboardLines.length; i++) {
				insertNewLine();
				content[row] = clipboardLines[i];
			}
		} else {
			const line = content[row];
			content[row] = line.substring(0, col) + clipboardContent + line.substring(col);
			col += clipboardContent.length;
		}
	}

	function removeSelection() {
		endSelection();
		const sel = selection;
		const isReverseColSelection = sel.start.col > sel.end.col;
		const isReverseRowSelection = sel.start.row > sel.end.row;
		for (let i = 0; i < content.length; i++) {
			if ((i >= sel.end.row && i <= sel.start.row) || (i >= sel.start.row && i <= sel.end.row)) {
				const startCol = sel.start.row === i ? sel.start.col : 0;
				const endCol = sel.end.row === i ? sel.end.col : content[i].length;
				if (!isReverseColSelection) {
					content[i] = content[i].substring(0, startCol) + content[i].substring(endCol);
				} else {
					content[i] = content[i].substring(0, sel.end.col) + content[i].substring(sel.start.col);
				}
			}
		}

		setCursor(
			!isReverseColSelection ? sel.start.col : sel.end.col,
			!isReverseRowSelection ? sel.start.row : sel.end.row
		);
	}

	function selectCurrentLine() {
		registerSelection();
		selection.start = { col: 0, row };
		selection.end = { col: content[row].length, row };

		setCursor(selection.end.col, selection.end.row);
	}

	function goToStartOfLine() {
		setCursor(0, row);
	}

	function goToEndOfLine() {
		setCursor(content[row].length, row);
	}

	function toggleDialog(dialog: "save" | "load" | "find") {
		dialogStatus[dialog] = !dialogStatus[dialog];
	}

	function saveFile() {
		const formattedContent = content.join(EOL);

		try {
			const path = newSrc;

			// write
			writeFileSync(path, formattedContent, "utf-8");
		} catch (e) {
			console.error(e);
		}
	}

	// contexted functions below

	// not an isolated function, uses functions from the editor
	function inputResolver(
		context: TabContext<ContextTypes>,
		input: sdl.Events.Window.KeyDown | sdl.Events.Window.TextInput
	) {
		if (dialogStatus.load) {
			if (input.type === "textInput") {
				newSrc += input.text;
				return;
			}
			if (input.scancode === sdl.keyboard.SCANCODE.BACKSPACE) {
				newSrc = newSrc.slice(0, -1);
				return;
			}
			if (input.scancode === sdl.keyboard.SCANCODE.ESCAPE) {
				toggleDialog("load");
				return;
			}
			if (input.scancode === sdl.keyboard.SCANCODE.RETURN) {
				if (input.shift && context.window) {
					context.window.tabs.forEach((tab) => {
						tab.setActive(false);
					});
					context.window.createTab({
						id: `tab-${context.window.tabs.length + 1}`,
						title: newSrc.split("/").pop(),
						isActive: true,
						context: createEditor({ src: newSrc }),
						inputResolver: (context, input) => {
							if (context.data === null) {
								return;
							}
							context.data.inputResolver(context, input);
						},
						renderer: (context) => {
							if (context.data === null) {
								return [];
							}
							return context.data.renderer(context);
						},
					});
					toggleDialog("load");
					return;
				}

				// check if file exists and is not a directory

				if (existsSync(newSrc) && !existsSync(newSrc + "/")) {
					context.tab.context = createEditor({ src: newSrc });
					context.tab.title = newSrc.split("/").pop();
					toggleDialog("load");
					return;
				} else {
					actionVerboseStatus = "File not found";
					return;
				}
			}
			return;
		}
		if (dialogStatus.save) {
			if (input.type === "textInput") {
				newSrc += input.text;
				return;
			}
			if (input.scancode === sdl.keyboard.SCANCODE.BACKSPACE) {
				newSrc = newSrc.slice(0, -1);
				return;
			}
			if (input.scancode === sdl.keyboard.SCANCODE.ESCAPE) {
				toggleDialog("save");
				return;
			}
			if (input.scancode === sdl.keyboard.SCANCODE.RETURN) {
				saveFile();
				context.tab.title = newSrc.split("/").pop();
				toggleDialog("save");
				return;
			}
			return;
		}

		if (input.type === "textInput") {
			insertCharacter(input.text);
			return;
		}

		if (input.ctrl && input.scancode === sdl.keyboard.SCANCODE.S) {
			toggleDialog("save");
			return;
		}

		if (input.ctrl && input.scancode === sdl.keyboard.SCANCODE.O) {
			toggleDialog("load");
			return;
		}

		if (input.ctrl && input.scancode === sdl.keyboard.SCANCODE.Q) {
			goToStartOfLine();
			return;
		}
		if (input.ctrl && input.scancode === sdl.keyboard.SCANCODE.E) {
			goToEndOfLine();
			return;
		}
		if (input.ctrl && input.scancode === sdl.keyboard.SCANCODE.C) {
			copySelection();
			return;
		}
		if (input.ctrl && input.scancode === sdl.keyboard.SCANCODE.V) {
			pasteClipboard();
			return;
		}
		if (input.ctrl && input.scancode === sdl.keyboard.SCANCODE.X) {
			copySelection();
			removeSelection();
			return;
		}
		if (input.ctrl && input.scancode === sdl.keyboard.SCANCODE.L) {
			selectCurrentLine();
			return;
		}

		if (input.scancode === sdl.keyboard.SCANCODE.RETURN) {
			insertNewLine();
			return;
		}
		if (input.scancode === sdl.keyboard.SCANCODE.BACKSPACE) {
			removeCharacter();
			return;
		}
		if (input.scancode === sdl.keyboard.SCANCODE.TAB) {
			insertCharacter("	");
			return;
		}

		const multiplier = input.alt ? 5 : 1;

		if (input.scancode === sdl.keyboard.SCANCODE.LEFT) {
			if (input.shift) registerSelection();
			else endSelection();
			moveCursor(-multiplier, 0);
			return;
		}
		if (input.scancode === sdl.keyboard.SCANCODE.RIGHT) {
			if (input.shift) registerSelection();
			else endSelection();
			moveCursor(multiplier, 0);
			return;
		}
		if (input.scancode === sdl.keyboard.SCANCODE.UP) {
			if (input.shift) registerSelection();
			else endSelection();
			moveCursor(0, -multiplier);
			return;
		}
		if (input.scancode === sdl.keyboard.SCANCODE.DOWN) {
			if (input.shift) registerSelection();
			else endSelection();
			moveCursor(0, multiplier);
			return;
		}
	}

	// isolated function, do not use external editor variables
	// (although that might be a subject to change, i don't know what is more efficient)
	function renderer(context: TabContext<ContextTypes>) {
		const editor = context.data;
		if (editor === null) {
			return [];
		}

		const dialogStatus = editor.getDialogStatus();

		if (dialogStatus.save) {
			return [
				[{ text: `Path: ${editor.getMetadata().src}`, color: config.theme.text.primary }],
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
				[{ text: "Click ENTER to confirm, ESC to cancel", color: config.theme.text.primary }],
				[{ text: editor.getMetadata().actionVerboseStatus, color: config.theme.text.primary }],
			];
		}

		if (dialogStatus.load) {
			return [
				[{ text: `Path: ${editor.getMetadata().src}`, color: config.theme.text.primary }],
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
				[{ text: "Click ENTER to confirm, ESC to cancel", color: config.theme.text.primary }],
				[{ text: "Press SHIFT+ENTER to open in a new tab", color: config.theme.text.primary }],
				[{ text: editor.getMetadata().actionVerboseStatus, color: config.theme.text.primary }],
			];
		}

		// we need to execute .get() function to get the actual value of the workspace
		const workspace = context.workspace.get();
		const cursor = editor.getCursor();
		const content = editor.getContent();

		const lines = [] as TextRow[][];
		const startIndex = Math.max(cursor.row - Math.floor(workspace.rows / 2), 0);

		// find maximum index number length to pad the line numbers
		// ternary operation needed for empty content
		const maxContentLineLength = content.length
			? Math.max(...content.map((line, index) => index.toString().toString().length))
			: 1;

		if (editor.getMetadata().filename !== "untitled") {
			lines.push([
				{
					text: `File: ${editor.getMetadata().src}`,
					color: config.theme.text.primary,
				},
			]);
		}

		// horizontal "helper ruler" lines (every 10th character)
		lines.push([
			{
				text:
					" " +
					" ".repeat(maxContentLineLength) +
					Array(workspace.cols - maxContentLineLength)
						.fill(" ")
						.map((_x, i) => {
							if (i % 10 === 0) {
								return (i % 100).toString()[0];
							}
							return " ";
						})
						.join("")
						.slice(0, workspace.cols - maxContentLineLength),
				color: config.theme.text.dim,
			},
		]);

		// horizontal "helper ruler" lines (every 2th character)
		lines.push([
			{
				text:
					" " +
					" ".repeat(maxContentLineLength) +
					Array(workspace.cols - maxContentLineLength)
						.fill(" ")
						.map((_x, i) => {
							const colNum = i % 10;
							return colNum % 2 === 0 ? colNum.toString() : " ";
						})
						.join(""),
				color: config.theme.text.dim,
			},
		]);

		const linesLength = lines.length;

		// content lines
		for (let i = startIndex; i < workspace.rows + startIndex - linesLength; i++) {
			// if the line is not defined, we will display a tilde (~) character, like in vim
			let textRow =
				content[i] !== undefined
					? [{ text: content[i], color: config.theme.text.plain }]
					: [{ text: "~", color: config.theme.text.dim }];

			// format tabs as spaces, this should be reversed during saving
			// this is a temporary solution, we will need to implement a proper tab handling
			content[i] = content[i] !== undefined ? content[i].replaceAll("	", " ") : undefined;

			// cursor indicator
			if (i === cursor.row) {
				textRow = [
					{ text: content[i].substring(0, cursor.col), color: config.theme.text.plain },
					{
						text: content[i][cursor.col] || " ",
						bgColor: config.theme.text.primary,
						color: config.theme.text.dim,
					},
					{ text: content[i].substring(cursor.col + 1), color: config.theme.text.plain },
				];
			}

			// selection
			const sel = editor.getSelection();
			if (
				(editor.getIsSelecting() && i >= sel.end.row && i <= sel.start.row) ||
				(editor.getIsSelecting() && i >= sel.start.row && i <= sel.end.row)
			) {
				const startCol = sel.start.row === i ? sel.start.col : 0;
				const endCol = sel.end.row === i ? sel.end.col : content[i].length;

				textRow = [
					{ text: content[i].substring(0, startCol), color: config.theme.text.plain },
					{
						text: content[i].substring(startCol, endCol),
						bgColor: config.theme.text.primary,
						color: config.theme.text.plain,
					},
					{ text: content[i].substring(endCol), color: config.theme.text.plain },
				];
			}

			lines.push([
				{
					// line number with padding behavior
					text: `${i}${" ".repeat(
						maxContentLineLength <= 1 ? 1 : maxContentLineLength - i.toString().length
					)} `,
					color: "gray",
				},
				...textRow,
			]);
		}

		return lines;
	}

	return {
		inputResolver,
		getContent,
		getCursor,
		getIsSelecting,
		getSelection,
		renderer,
		getDialogStatus: () => {
			return dialogStatus;
		},
		getMetadata: () => {
			return {
				src: newSrc,
				filename: src ? newSrc.split("/").pop() : "untitled",
				startCol: col,
				startRow: row,
				actionVerboseStatus,
			};
		},
	};
}
