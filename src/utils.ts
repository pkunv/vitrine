export const formatMemoryUsage = (data: number) =>
	`${Math.round((data / 1024 / 1024) * 100) / 100} MB`;

export function getEOLSequence(sample: string) {
	var temp = sample.indexOf("\n");
	if (sample[temp - 1] === "\r")
		return {
			name: "CRLF",
			sequence: "\r\n",
		};
	return {
		name: "LF",
		sequence: "\n",
	};
}

export function hexToRgb(hex: string) {
	var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result
		? {
				r: parseInt(result[1], 16),
				g: parseInt(result[2], 16),
				b: parseInt(result[3], 16),
		  }
		: null;
}

interface ObjectWithProperties {
	[key: string]: any;
}

export const setPropertyFromDotNotation = <T extends ObjectWithProperties>(
	t: T,
	path: string,
	value: any
): any => {
	if (typeof t != "object") throw Error("non-object");
	if (path == "") throw Error("empty path");
	const pos = path.indexOf(".");
	return pos == -1
		? ((t[path] = value), value)
		: setPropertyFromDotNotation(t[path.slice(0, pos)], path.slice(pos + 1), value);
};

export type Language = ReturnType<typeof getLanguageFromExtension>;

export const getLanguageFromExtension = (ext: string) => {
	ext = ext.slice(1);
	switch (ext) {
		case "js":
			return "javascript";
		case "ts":
			return "typescript";
		case "json":
			return "json";
		case "html":
			return "html";
		case "css":
			return "css";
		case "md":
			return "markdown";
		case "py":
			return "python";
		case "java":
			return "java";
		case "c":
			return "c";
		case "cpp":
			return "cpp";
		case "rs":
			return "rust";
		case "go":
			return "go";
		case "rb":
			return "ruby";
		case "php":
			return "php";
		case "sh":
			return "shell";
		case "sql":
			return "sql";
		case "swift":
			return "swift";
		case "kt":
			return "kotlin";
		case "cs":
			return "csharp";
		case "r":
			return "r";
		case "m":
			return "matlab";
		case "pl":
			return "perl";
		case "lua":
			return "lua";
		case "dart":
			return "dart";
		case "scala":
			return "scala";
		case "ts":
			return "typescript";
		case "jsx":
			return "jsx";
		case "tsx":
			return "tsx";
		case "vue":
			return "vue";
		case "svelte":
			return "svelte";
		case "graphql":
			return "graphql";
		case "yaml":
			return "yaml";
		case "toml":
			return "toml";
		case "ini":
			return "ini";
		case "xml":
			return "xml";
		case "yml":
			return "yaml";
		case "svg":
			return "xml";
		case "csv":
			return "csv";
		case "tsv":
			return "tsv";
		case "sh":
			return "shell";
		case "bash":
			return "shell";
		case "zsh":
			return "shell";
		case "fish":
			return "shell";
		case "awk":
			return "awk";
		case "sed":
			return "sed";
		case "rkt":
			return "racket";
		case "racket":
			return "racket";
		case "jl":
			return "julia";
		default:
			"plaintext";
	}
};

type AsyncGlobal<T> = {
	value: T | null;
	ready: boolean;
	initialize: () => Promise<void>;
	get: () => T;
};

export function createAsyncGlobal<T>(
	initializerFn: () => Promise<T>,
	fallbackValue: T
): AsyncGlobal<T> {
	const global: AsyncGlobal<T> = {
		value: null,
		ready: false,
		initialize: async () => {
			try {
				global.value = await initializerFn();
				global.ready = true;
			} catch (error) {
				console.error("Failed to initialize global value:", error);
				global.value = fallbackValue;
				global.ready = true;
			}
		},
		get: () => {
			if (!global.ready) {
				return fallbackValue;
			}
			return global.value ?? fallbackValue;
		},
	};

	// Start initialization immediately
	global.initialize();

	return global;
}

export function splitAtIndex(str: string, index: number): [string, string] {
	return [str.substring(0, index), str.substring(index)];
	// or
	// return [str.slice(0, index), str.slice(index)];
}
