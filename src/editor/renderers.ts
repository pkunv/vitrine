// isolated function, do not use external editor variables

import { config } from "@/index";
import type { TextRow } from "@/lib/text";
import type { ContextTypes, TabContext } from "@/lib/window";

export function editorTopBarRenderer(context: TabContext<ContextTypes>) {
	const editor = context.data;
	if (editor === null) {
		return [];
	}

	const dialogStatus = editor.getDialogStatus();
	const metadata = editor.getMetadata();
	if (dialogStatus.find) {
		return [
			[{ text: `Search: ${metadata.findQuery ?? ""}`, color: config.theme.text.primary }],
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
	if (dialogStatus.save) {
		return [
			[{ text: `Path: ${metadata.src ?? metadata.newSrc}`, color: config.theme.text.primary }],
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
			[{ text: `Path: ${editor.getMetadata().newSrc}`, color: config.theme.text.primary }],
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

	return [];
}

export function editorRenderer(context: TabContext<ContextTypes>) {
	const editor = context.data;
	if (editor === null) {
		return [];
	}

	// we need to execute .get() function to get the actual value of the workspace
	const workspace = context.workspace.get();
	const cursor = editor.getCursor();
	const content = editor.getContent();
	const highlightedContent = editor.getHighlightedContent();

	const lines = [] as TextRow[][];
	const startIndex = Math.max(cursor.row - Math.floor(workspace.rows / 2), 0);

	// find maximum line number string length to pad the line numbers
	const maxContentLineLength = (workspace.rows + startIndex).toString().length;

	// horizontal "helper ruler" lines (every 10th character)
	lines.push([
		{
			text:
				" " +
				" ".repeat(maxContentLineLength) +
				Array(workspace.cols - maxContentLineLength)
					.fill(" ")
					.map((_x, i) => {
						const properIndex = i + 1;
						if (properIndex % 10 === 0) {
							return (properIndex % 100).toString()[0];
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
						const properIndex = i + 1;
						const colNum = properIndex % 10;
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

		if (highlightedContent && highlightedContent[i]) {
			textRow = highlightedContent[i];
		}

		// cursor indicator
		if (i === cursor.row) {
			// Find the segment containing the cursor and its position
			let accumulatedChars = 0;
			let rowChunkIndex = -1;
			let rowChunkElement = null;

			// Find which text segment contains the cursor position
			for (let y = 0; y < textRow.length; y++) {
				const segmentLength = textRow[y].text.length;
				accumulatedChars += segmentLength;

				if (accumulatedChars > cursor.col || y === textRow.length - 1) {
					rowChunkIndex = y;
					rowChunkElement = textRow[y];
					break;
				}
			}

			// If we found the segment containing the cursor
			if (rowChunkIndex !== -1 && rowChunkElement) {
				// Calculate cursor position relative to the current segment
				const prevAccumulatedChars = accumulatedChars - rowChunkElement.text.length;
				const relativeCursorCol = cursor.col - prevAccumulatedChars;

				// Create a new array with the cursor indicator
				const cursoredTextRow = [...textRow];

				// Replace the segment containing the cursor with three segments:
				// 1. Text before cursor
				// 2. Cursor character
				// 3. Text after cursor
				cursoredTextRow.splice(
					rowChunkIndex,
					1,
					{
						text: rowChunkElement.text.substring(0, relativeCursorCol),
						bgColor: config.theme.background.primary,
						color: rowChunkElement.color || config.theme.text.plain,
					} as TextRow,
					{
						text: rowChunkElement.text[relativeCursorCol] || " ",
						bgColor: config.theme.text.primary,
						color: config.theme.background.primary,
					} as TextRow,
					{
						text: rowChunkElement.text.substring(relativeCursorCol + 1),
						bgColor: config.theme.background.primary,
						color: rowChunkElement.color || config.theme.text.plain,
					} as TextRow
				);

				textRow = cursoredTextRow;
			}
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
				{ text: content[i].substring(0, startCol), color: config.theme.text.plain } as TextRow,
				{
					text: content[i].substring(startCol, endCol),
					bgColor: config.theme.text.primary,
					color: config.theme.background.primary,
				} as TextRow,
				{ text: content[i].substring(endCol), color: config.theme.text.plain } as TextRow,
			];
		}
		lines.push([
			{
				// line number with padding behavior (with proper index starting at 1, not 0)
				text: `${i + 1}${" ".repeat(
					maxContentLineLength >= 2 ? maxContentLineLength - (i + 1).toString().length : 1
				)} `,
				color: "gray",
			},
			...textRow,
		]);
	}

	return lines;
}

export function editorDownBarRenderer(context: TabContext<ContextTypes>) {
	const editor = context.data;
	if (editor === null) {
		return [];
	}
	const cursor = editor.getCursor();
	const metadata = editor.getMetadata();

	return [
		[
			{ text: `Ln ${cursor.row + 1}, Col ${cursor.col + 1}`, color: config.theme.text.primary },
			{ text: ` | `, color: config.theme.text.primary },
			{ text: `EOL: ${metadata.eol.name}`, color: config.theme.text.primary },
			{ text: ` | `, color: config.theme.text.primary },
			{ text: metadata.language, color: config.theme.text.primary },
		],
		[
			{
				text: `Path: ${metadata.src ? metadata.src : "new file"}`,
				color: config.theme.background.primary,
				bgColor: config.theme.text.dim,
			} as TextRow,
		],
	] as TextRow[][];
}
