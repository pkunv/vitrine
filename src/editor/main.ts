import { getEOLSequence } from "@/utils";
import sdl from "@kmamal/sdl";
import { readFileSync } from "fs";
import { EOL as OS_EOL } from "os";
import path from "path";

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
	const text = src ? readFileSync(src, { encoding: "utf-8" }) : `${OS_EOL}`;
	const EOL = getEOLSequence(text);
	let actionVerboseStatus = "";
	let lastCharCol = 0;
	let col = startCol || 0;
	let row = startRow || 0;
	let newSrc = src ?? process.cwd();
	const content: string[] = text ? text.split(EOL.sequence) : [];
	let findQuery: string = "";
	let isSelecting = false;
	// boolean for putting asterisk if file is changed
	let isChanged = false;
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
		isChanged = true;
		const line = content[row];
		content[row] = line.substring(0, col) + character + line.substring(col);
		moveCursor(character.length, 0);
	}

	function removeCharacter() {
		isChanged = true;
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
		isChanged = true;
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

		sdl.clipboard.setText(result.join(EOL.sequence));
	}

	function pasteClipboard() {
		const clipboardContent = sdl.clipboard.text;
		const clipboardLines = clipboardContent.split(EOL.sequence);
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
		isChanged = true;
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
	function selectAll() {
		registerSelection();
		selection.start = { col: 0, row: 0 };
		selection.end = { col: content[content.length - 1].length, row: content.length - 1 };

		setCursor(selection.end.col, selection.end.row);
	}

	function goToStartOfLine() {
		lastCharCol = 0;
		setCursor(0, row);
	}

	function goToEndOfLine() {
		lastCharCol = content[row].length;
		setCursor(content[row].length, row);
	}

	function toggleDialog(dialog: "save" | "load" | "find") {
		dialogStatus[dialog] = !dialogStatus[dialog];
	}

	function saveFile() {
		const formattedContent = content.join(EOL.sequence);

		try {
			const path = newSrc;
			src = newSrc;
			isChanged = false;

			Bun.write(path, formattedContent);
		} catch (e) {
			console.error(e);
		}
	}
	function modifyNewSrc(str: string, operation: "add" | "remove") {
		if (operation === "add") {
			newSrc += str;
		}
		if (operation === "remove") {
			newSrc = newSrc.slice(0, -1);
		}
	}
	function modifyFindQuery(str: string, operation: "add" | "remove") {
		if (operation === "add") {
			findQuery += str;
		}
		if (operation === "remove") {
			findQuery = findQuery.slice(0, -1);
		}
	}

	return {
		getContent,
		getCursor,
		getIsSelecting,
		getSelection,
		toggleDialog,
		saveFile,
		removeCharacter,
		insertCharacter,
		insertNewLine,
		moveCursor,
		setCursor,
		registerSelection,
		endSelection,
		copySelection,
		pasteClipboard,
		removeSelection,
		selectCurrentLine,
		selectAll,
		goToStartOfLine,
		goToEndOfLine,
		modifyNewSrc,
		modifyFindQuery,
		getDialogStatus: () => {
			return dialogStatus;
		},
		modifyActionVerboseStatus: (str: string) => {
			actionVerboseStatus = str;
		},
		getMetadata: () => {
			return {
				isChanged,
				findQuery,
				eol: EOL,
				src,
				newSrc,
				filename: src ? src.split(path.sep).pop() : "untitled",
				startCol: col,
				startRow: row,
				actionVerboseStatus,
			};
		},
	};
}
