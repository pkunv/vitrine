import { setPropertyFromDotNotation } from "@/utils";
import { readFileSync } from "fs";
import { join } from "path";

const defaultConfig = {
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
		},
	},
};

export type Config = typeof defaultConfig;

export function createConfig() {
	let config: Config = defaultConfig;
	// config file not detected, set config to a default one
	if (Bun.file(join(process.cwd(), ".vitrine", "config.json")).size === 0) {
		Bun.write(
			join(process.cwd(), ".vitrine", "config.json"),
			JSON.stringify(defaultConfig, null, 2)
		);
	} else {
		// we need to use readFileSync as Bun.file is async
		// bytecode compilation converts to cjs so we cannot use top-level await
		config = JSON.parse(readFileSync(join(process.cwd(), ".vitrine", "config.json")).toString());
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
