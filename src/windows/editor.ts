import { editorInputResolver } from "@/editor/input-resolver";
import { createEditor } from "@/editor/main";
import { editorDownBarRenderer, editorRenderer, editorTopBarRenderer } from "@/editor/renderers";
import { windows } from "@/index";
import { createTab, createWindow } from "@/lib/window";

export async function createEditorWindow() {
	windows.push(
		createWindow({
			id: "editor",
			title: "Editor",
			initial: false,
			tabs: [
				createTab({
					id: "file-0",
					isActive: true,
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
					context: await createEditor({}),
				}),
			],
		})
	);
}
