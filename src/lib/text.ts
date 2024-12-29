import { config } from "@/index";
import { hexToRgb } from "@/utils";

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
	const { font } = config;
	const fontSize = font.size;

	ctx.fillStyle = "white";

	let currentWidthMeasure = 0;

	for (let i = 0; i < content.length; i++) {
		const chunk = content[i];

		const options = chunk.options ?? [];

		ctx.font = `${options.join(" ") + " "}${font.size}px ${font.family}`;

		if (chunk.text.includes("	")) {
			for (let i = 0; i < chunk.text.split("	").length - 1; i++) {
				const tabMeasure = ctx.measureText("	").width;
				const rgb = hexToRgb(config.theme.text.dim);
				ctx.fillStyle = `rgba(${rgb?.r}, ${rgb?.g}, ${rgb?.b}, 0.1)`;
				ctx.fillRect(
					currentWidthMeasure +
						tabMeasure * (i === 0 ? 0 : i) +
						ctx.measureText(chunk.text.split("	")[i]).width,
					row * fontSize,
					currentWidthMeasure * 2 + fontSize,
					2
				);
			}
		}

		/*
		if (chunk.text.includes("	")) {
			
			const rgb = hexToRgb(config.theme.text.dim);
			ctx.fillStyle = `rgba(${rgb?.r}, ${rgb?.g}, ${rgb?.b}, 0.5)`;
			ctx.fillRect(
				currentWidthMeasure,
				row * fontSize - fontSize / 2,
				currentWidthMeasure * 2 + fontSize,
				2
			);
		}
		*/

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

		ctx.fillText(chunk.text, currentWidthMeasure, row * fontSize);
		currentWidthMeasure += ctx.measureText(chunk.text).width;
	}
}
