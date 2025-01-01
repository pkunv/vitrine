import { createEditor } from "@/editor/main";
import { editorDownBarRenderer, editorRenderer, editorTopBarRenderer } from "@/editor/renderers";
import type { ContextTypes, TabContext } from "@/lib/window";
import sdl from "@kmamal/sdl";
import { existsSync } from "fs";
import path from "path";

// not an isolated function, uses functions from the editor
export async function editorInputResolver(
	context: TabContext<ContextTypes>,
	input: sdl.Events.Window.KeyDown | sdl.Events.Window.TextInput
) {
	const editor = context.data;
	if (editor === null) {
		return;
	}

	const dialogStatus = editor.getDialogStatus();
	let metadata = editor.getMetadata();

	if (metadata.isChanged && context.tab.title?.includes("*") === false) {
		context.tab.title += "*";
	}
	if (!metadata.isChanged) {
		context.tab.title = context.tab.title?.replace("*", "");
	}

	if (dialogStatus.find) {
		if (input.type === "textInput") {
			editor.modifyFindQuery(input.text, "add");
			return;
		}
		if (input.scancode === sdl.keyboard.SCANCODE.BACKSPACE) {
			editor.modifyFindQuery("", "remove");
			return;
		}
		if (input.scancode === sdl.keyboard.SCANCODE.RETURN) {
			const content = context.data?.getContent();
			if (!content) {
				return;
			}
			for (let i = 0; i < content.length; i++) {
				const chunk = content[i];
				if (chunk.includes(metadata.findQuery)) {
					editor.setCursor(0, i);
				}
				editor.modifyActionVerboseStatus(`Found occurence of ${metadata.findQuery} at ${i + 1}`);
			}
			return;
		}
		if (input.scancode === sdl.keyboard.SCANCODE.ESCAPE) {
			editor.toggleDialog("find");
			return;
		}
	}
	if (dialogStatus.load) {
		if (input.type === "textInput") {
			editor.modifyNewSrc(input.text, "add");
			return;
		}
		if (input.scancode === sdl.keyboard.SCANCODE.BACKSPACE) {
			editor.modifyNewSrc("", "remove");
			return;
		}
		if (input.scancode === sdl.keyboard.SCANCODE.ESCAPE) {
			editor.toggleDialog("load");
			return;
		}
		if (input.scancode === sdl.keyboard.SCANCODE.RETURN) {
			if (input.shift && context.window) {
				context.window.tabs.forEach((tab) => {
					tab.isActive = false;
				});
				context.window.createTab({
					id: `file-${context.window.tabs.length}`,
					title: metadata.newSrc.split(path.sep).pop(),
					isActive: true,
					context: await createEditor({ src: metadata.newSrc }),
					inputResolver: (context, input) => {
						if (context.data === null) {
							return;
						}
						editorInputResolver(context, input);
					},
					renderer: (context) => {
						if (context.data === null) {
							return [];
						}
						return editorRenderer(context);
					},
					topBarRenderer: (context) => {
						if (context.data === null) {
							return [];
						}
						return editorTopBarRenderer(context);
					},
					downBarRenderer: (context) => {
						if (context.data === null) {
							return [];
						}
						return editorDownBarRenderer(context);
					},
				});
				editor.toggleDialog("load");
				return;
			}

			// check if file exists and is not a directory

			if (existsSync(metadata.newSrc) && !existsSync(metadata.newSrc + path.sep)) {
				context.tab.context = await createEditor({ src: metadata.newSrc });
				context.tab.title = metadata.newSrc.split(path.sep).pop();
				editor.toggleDialog("load");
				return;
			} else {
				editor.modifyActionVerboseStatus("File not found");
				return;
			}
		}
		return;
	}
	if (dialogStatus.save) {
		if (input.type === "textInput") {
			editor.modifyNewSrc(input.text, "add");
			return;
		}
		if (input.scancode === sdl.keyboard.SCANCODE.BACKSPACE) {
			editor.modifyNewSrc("", "remove");
			return;
		}
		if (input.scancode === sdl.keyboard.SCANCODE.ESCAPE) {
			editor.toggleDialog("save");
			return;
		}
		if (input.scancode === sdl.keyboard.SCANCODE.RETURN) {
			editor.saveFile();
			context.tab.title = metadata.newSrc.split(path.sep).pop();
			editor.toggleDialog("save");
			return;
		}
		return;
	}

	if (input.type === "textInput") {
		editor.insertCharacter(input.text);
		editor.reformatHighlightedContent(true);
		return;
	}

	if (input.ctrl && input.scancode === sdl.keyboard.SCANCODE.N && context.window) {
		context.window.tabs.forEach((tab) => {
			tab.isActive = false;
		});
		context.window.createTab({
			id: `file-${context.window.tabs.length}`,
			isActive: true,
			context: await createEditor({}),
			inputResolver: (context, input) => {
				if (context.data === null) {
					return;
				}
				editorInputResolver(context, input);
			},
			renderer: (context) => {
				if (context.data === null) {
					return [];
				}
				return editorRenderer(context);
			},
			topBarRenderer: (context) => {
				if (context.data === null) {
					return [];
				}
				return editorTopBarRenderer(context);
			},
			downBarRenderer: (context) => {
				if (context.data === null) {
					return [];
				}
				return editorDownBarRenderer(context);
			},
		});
		return;
	}

	if (input.ctrl && input.scancode === sdl.keyboard.SCANCODE.S) {
		editor.toggleDialog("save");
		return;
	}

	if (input.ctrl && input.scancode === sdl.keyboard.SCANCODE.O) {
		editor.toggleDialog("load");
		return;
	}
	if (input.ctrl && input.scancode === sdl.keyboard.SCANCODE.F) {
		editor.toggleDialog("find");
		return;
	}

	if (input.ctrl && input.scancode === sdl.keyboard.SCANCODE.A) {
		editor.selectAll();
		return;
	}
	if (input.ctrl && input.scancode === sdl.keyboard.SCANCODE.Q) {
		editor.goToStartOfLine();
		return;
	}
	if (input.ctrl && input.scancode === sdl.keyboard.SCANCODE.E) {
		editor.goToEndOfLine();
		return;
	}
	if (input.ctrl && input.scancode === sdl.keyboard.SCANCODE.C) {
		editor.copySelection();
		return;
	}
	if (input.ctrl && input.scancode === sdl.keyboard.SCANCODE.V) {
		editor.pasteClipboard();
		editor.reformatHighlightedContent();
		return;
	}
	if (input.ctrl && input.scancode === sdl.keyboard.SCANCODE.X) {
		editor.copySelection();
		editor.removeSelection();
		editor.reformatHighlightedContent();
		return;
	}
	if (input.ctrl && input.scancode === sdl.keyboard.SCANCODE.L) {
		editor.selectCurrentLine();
		return;
	}

	if (input.scancode === sdl.keyboard.SCANCODE.RETURN) {
		editor.insertNewLine();
		editor.reformatHighlightedContent();
		return;
	}
	if (input.scancode === sdl.keyboard.SCANCODE.BACKSPACE) {
		editor.removeCharacter();
		editor.reformatHighlightedContent();
		return;
	}
	if (input.scancode === sdl.keyboard.SCANCODE.TAB) {
		editor.insertCharacter("	");
		editor.reformatHighlightedContent();
		return;
	}

	const multiplier = input.alt ? 5 : 1;

	if (input.scancode === sdl.keyboard.SCANCODE.LEFT) {
		if (input.shift) {
			editor.registerSelection();
		} else editor.endSelection();
		editor.moveCursor(-multiplier, 0);
		return;
	}
	if (input.scancode === sdl.keyboard.SCANCODE.RIGHT) {
		if (input.shift) editor.registerSelection();
		else editor.endSelection();
		editor.moveCursor(multiplier, 0);
		return;
	}
	if (input.scancode === sdl.keyboard.SCANCODE.UP) {
		if (input.shift) editor.registerSelection();
		else editor.endSelection();
		editor.moveCursor(0, -multiplier);
		return;
	}
	if (input.scancode === sdl.keyboard.SCANCODE.DOWN) {
		if (input.shift) editor.registerSelection();
		else editor.endSelection();
		editor.moveCursor(0, multiplier);
		return;
	}
}
