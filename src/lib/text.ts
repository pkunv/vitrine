import { config } from "@/index";

export type TextOption = "bold" | "italic" | "underline";

export interface TextRow {
	text: string;
	color: string;
	bgColor?: string;
	options?: TextOption[];
	forceAlign?: "left" | "center" | "right";
}

export function renderTextRow({
	ctx,
	content,
	row,
}: {
	ctx: CanvasRenderingContext2D;
	content: TextRow[];
	row: number;
}) {
	const { fontSize, font } = config;

	ctx.fillStyle = "white";

	let currentWidthMeasure = 0;

	for (let i = 0; i < content.length; i++) {
		const chunk = content[i];

		const options = chunk.options ?? [];

		ctx.font = `${options.join(" ") + " "}${fontSize}px ${font.family}`;

		if (chunk.text.includes("	")) {
			ctx.fillStyle = "red";
			ctx.fillRect(currentWidthMeasure, row * fontSize - fontSize, 4, fontSize);
		}

		if (chunk.bgColor) {
			ctx.fillStyle = chunk.bgColor;
			ctx.fillRect(
				currentWidthMeasure,
				row * fontSize - fontSize,
				ctx.measureText(chunk.text).width,
				fontSize
			);
		}

		ctx.fillStyle = chunk.color;
		if (content[i].forceAlign === "center") {
			ctx.textAlign = "center";
		}

		ctx.fillText(chunk.text.replaceAll("	", "  "), currentWidthMeasure, row * fontSize);
		currentWidthMeasure += ctx.measureText(chunk.text).width;
	}
}
