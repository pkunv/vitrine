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

export const setPropertyFromDotNotation = (t, path, value) => {
	if (typeof t != "object") throw Error("non-object");
	if (path == "") throw Error("empty path");
	const pos = path.indexOf(".");
	return pos == -1
		? ((t[path] = value), value)
		: setPropertyFromDotNotation(t[path.slice(0, pos)], path.slice(pos + 1), value);
};
