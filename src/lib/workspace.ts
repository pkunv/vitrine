export type Workspace = ReturnType<typeof createWorkspace>;

export function createWorkspace({ cols, rows }: { cols: number; rows: number }) {
	let workspace = {
		cols,
		rows,
	};
	return {
		cols,
		rows,
		get: () => workspace,
		set: ({ cols, rows }: { cols: number; rows: number }) => {
			workspace = { cols, rows };
			return workspace;
		},
	};
}
