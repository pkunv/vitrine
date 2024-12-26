export const formatMemoryUsage = (data: number) =>
	`${Math.round((data / 1024 / 1024) * 100) / 100} MB`
