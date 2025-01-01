import { config } from "@/index";
import { parseHTML } from "@/parser";
import type { Language } from "@/utils";
import he from "he";
import hljs from "highlight.js";

export function formatHighlightedContent(text: string, language: Language) {
	const highlightResult = he.decode(
		hljs.highlight(text, {
			language: language as string,
		}).value
	);

	const highlightedLines = parseHTML(highlightResult, config);
	//console.log(highlightedLines);
	return highlightedLines;
}
