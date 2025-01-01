import type { Config } from "@/config";
import { HTMLElement, parse } from "node-html-parser";

interface ParsedElement {
	type: "element" | "text";
	text: string;
	classes?: string;
	color: string;
}

export function parseHTML(html: string, config: Config): ParsedElement[][] {
	// Split input into lines and filter out empty lines
	const lines = html.split("\n").map((line) => (line.trim() ? line : " "));

	return lines.map((line) => {
		const root = parse(line);
		return parseLine(root, config);
	});
}

function parseLine(root: HTMLElement, config: Config): ParsedElement[] {
	const result: ParsedElement[] = [];
	let currentTextContent = "";

	// Process all child nodes
	for (const node of root.childNodes) {
		if (node.nodeType === 1) {
			// Element node
			// First add accumulated text if any
			if (currentTextContent) {
				result.push({
					type: "text",
					text: currentTextContent,
					color: config.theme.text.plain,
				});
				currentTextContent = "";
			}

			// Process element
			const element = node as HTMLElement;
			const classAttr = element.getAttribute("class");

			result.push({
				type: "element",
				text: element.text,
				classes: classAttr ? classAttr : " ",
				// @ts-expect-error
				color: classAttr ? config.theme.text[classAttr ?? "plain"] : config.theme.text.plain,
			});
		} else if (node.nodeType === 3) {
			// Text node
			currentTextContent += node.text;
		}
	}

	// Add any remaining text content
	if (currentTextContent) {
		result.push({
			type: "text",
			text: currentTextContent,
			color: config.theme.text.plain,
		});
	}

	return result;
}
