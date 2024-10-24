import {PIPELINE_STATUSES} from "@/lib/types";

/**
 * This utility function retrieves unique pipeline statuses from the given array of acquisition targets.
 * If a target's status is null, it is considered "Unknown."
 * @returns {string[]} An array of unique pipeline statuses.
 */
export const getUniqueStatuses = () => {
    return [...PIPELINE_STATUSES, 'Unknown'];
};
