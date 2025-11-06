/**
 * Public exports for the demo state layer.
 */
export {
	addCategory,
	addTodo,
	clearSelection,
	deleteCompleted,
	deleteSelected,
	getTodoById,
	removeTodo,
	resetDemo,
	selectAllVisible,
	toggleAllSelected,
	updateTodo,
} from "./_actions.js";
export {
	categoryOptions,
	completedCount,
	debugLogs,
	openCount,
	selectedCount,
	summary,
	totalCount,
	visibleCount,
	visibleLabel,
	visibleTodos,
} from "./_computed.js";
export { appVersion, isEmbedded, root, store } from "./_store-setup.js";
