const rcedit = require("rcedit");

async function setWindowsIcon(exePath, iconPath) {
	try {
		await rcedit(exePath, {
			icon: iconPath,
		});
		console.log("Icon successfully changed!");
	} catch (error) {
		console.error("Error changing icon:", error);
	}
}

// Usage example
const exePath = "dist/vitrine.exe";
const iconPath = "resources/icon.ico";

setWindowsIcon(exePath, iconPath);
