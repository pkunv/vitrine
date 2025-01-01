import { setPropertyFromDotNotation } from "@/utils";
import { join } from "path";

export const defaultConfig = {
	width: 640,
	height: 480,
	fps: 30,
	font: {
		size: 16,
		family: "monospace",
		path: "", // TODO: handle font loading (bug on Windows)
	},
	theme: {
		background: {
			primary: "#141414",
			secondary: "#635f5f",
		},
		text: {
			plain: "#c9c9c9",
			primary: "#9EDF9C",
			dim: "#808080",
			"hljs-comment": "#5c6370",
			"hljs-quote": "#5c6370",
			"hljs-doctag": "#c678dd",
			"hljs-keyword": "#c678dd",
			"hljs-formula": "#c678dd",
			"hljs-section": "#e06c75",
			"hljs-name": "#e06c75",
			"hljs-selector-tag": "#e06c75",
			"hljs-deletion": "#e06c75",
			"hljs-subst": "#e06c75",
			"hljs-literal": "#56b6c2",
			"hljs-string": "#98c379",
			"hljs-regexp": "#98c379",
			"hljs-addition": "#98c379",
			"hljs-attribute": "#98c379",
			"hljs-attr": "#d19a66",
			"hljs-variable": "#d19a66",
			"hljs-template-variable": "#d19a66",
			"hljs-type": "#d19a66",
			"hljs-selector-class": "#d19a66",
			"hljs-selector-attr": "#d19a66",
			"hljs-selector-pseudo": "#d19a66",
			"hljs-number": "#d19a66",
			"hljs-symbol": "#61aeee",
			"hljs-bullet": "#61aeee",
			"hljs-link": "#61aeee",
			"hljs-meta": "#61aeee",
			"hljs-selector-id": "#61aeee",
			"hljs-title": "#61aeee",
			"hljs-title function_": "#61aeee",
			"hljs-built_in": "#e5c07b",
			"hljs-class": "#e5c07b",
			"hljs-title class_": "#e5c07b",
		},
	},
};

export type Config = typeof defaultConfig;

export async function createConfig() {
	let config: Config = defaultConfig;
	// config file not detected, set config to a default one
	if (Bun.file(join(process.cwd(), ".vitrine", "config.json")).size === 0) {
		Bun.write(
			join(process.cwd(), ".vitrine", "config.json"),
			JSON.stringify(defaultConfig, null, 2)
		);
	} else {
		// fake promise for testing
		//await new Promise((resolve) => setTimeout(resolve, 1000));
		config = (await Bun.file(join(process.cwd(), ".vitrine", "config.json")).json()) as Config;
	}
	return {
		...config,
		// TODO: these parameter types
		modify: (property: any, value: any) => {
			// mutable dot notation object setter
			setPropertyFromDotNotation(config, property, value);

			Bun.write(join(process.cwd(), ".vitrine", "config.json"), JSON.stringify(config, null, 2));
		},
	};
}
