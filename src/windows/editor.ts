import { createEditor } from "@/editor";
import { createTab, createWindow } from "@/lib/window";

export const editorWindow = createWindow({
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
				context.data.inputResolver(context, input);
			},
			renderer: (context) => {
				if (context.data === null) {
					return [];
				}
				return context.data.renderer(context);
			},
			context: createEditor({}),
		}),
	],
});
