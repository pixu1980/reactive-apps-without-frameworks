/**
 * Job contract accepted by the microtask scheduler.
 * @typedef {{ run(): void }} SchedulableJob
 */

/** @type {Set<SchedulableJob>} */
const scheduled = new Set();
let flushing = false;

/**
 * Queues an effect for batched microtask execution.
 * @param {SchedulableJob} effect
 * @returns {void}
 */
export function schedule(effect) {
	scheduled.add(effect);

	if (flushing) return;

	flushing = true;

	queueMicrotask(() => {
		try {
			while (scheduled.size > 0) {
				const batch = [...scheduled];
				scheduled.clear();
				for (const job of batch) {
					job.run();
				}
			}
		} finally {
			flushing = false;
		}
	});
}
