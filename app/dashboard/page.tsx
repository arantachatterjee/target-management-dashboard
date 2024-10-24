"use client";

import { useEffect, useState, useCallback } from "react";
import BarChart from "@/components/BarChart";
import TargetTable from "@/components/TargetTable";
import SuccessMessageModal from "@/components/SuccessMessageModal";
import { Target } from "@/lib/types";
import { getUniqueStatuses } from "@/lib/utils";

/**
 * Sorts an array of acquisition targets by their pipeline status and last updated date.
 * @param {Target[]} targets - The array of acquisition targets to sort.
 * @returns {Target[]} A sorted array of acquisition targets.
 */
const sortTargets = (targets: Target[]) => {
  return targets.sort((a, b) => {
    // Sort by pipelineStatus first, then by lastUpdated descending
    const statusComparison = (a.pipelineStatus ?? "Unknown").localeCompare(b.pipelineStatus ?? "Unknown");
    if (statusComparison !== 0) return statusComparison;

    // Considering dates are in ISO format (e.g., '2024-10-20T12:00:00Z')
    return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
  });
};

export default function Dashboard() {
  const [targets, setTargets] = useState<Target[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [showSuccessMessageModal, setSuccessMessageModal] = useState(false);

  // Fetch unique pipeline statuses
  const uniquePipelineStatuses = getUniqueStatuses();

  /**
   * Fetches acquisition targets from the API and updates the state.
   * It sets loading state while fetching and handles errors.
   */
  const fetchTargets = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/targets", {
        method: "GET",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate", // Ensure API response is not cached
          Pragma: "no-cache",
          Expires: "0",
        },
      });
      if (!response.ok) throw new Error("Failed to fetch targets.");
      const data = await response.json();
      setTargets(sortTargets(data)); // Sort targets after fetching
    } catch (error) {
      console.error("Error fetching targets:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch targets on initial render
  useEffect(() => {
    fetchTargets();
  }, [fetchTargets]);

   /**
   * Updates the pipeline status of a specific target by making a PUT request to the API.
   * @param {number} id - The ID of the target to update.
   * @param {string} newStatus - The new pipeline status to set.
   */
  const updatePipelineStatus = async (id: number, newStatus: string) => {
    try {
      const response = await fetch("/api/targets", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update pipeline status.");
      }

      // Refetch and sort data after successful update
      setSuccessMessageModal(true);
    } catch (error) {
      console.error(error);
      alert("Something went wrong. Please try again and if the issue persists, contact support at support@analyst3.ai.");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  // Filter targets based on selected pipeline status
  // If the status is null, display it as "Unknown"
  const filteredTargets = targets.filter(target => {
    return selectedStatus === "All" || (target.pipelineStatus ?? "Unknown") === selectedStatus;
  });

  return (
    <div className="p-8">

      {/* Dashboard Heading */}
      <h1 className="text-3xl font-bold mb-6 flex justify-center items-center">Dashboard</h1>

      {/* Global Filter */}
      <div className="mb-6 flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4 mx-auto">
        <label
          htmlFor="pipeline-status"
          className="text-lg font-medium text-gray-700"
        >
          Filter Targets by Pipeline Status:
        </label>
        <select
          id="pipeline-status"
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="border border-gray-300 rounded-lg p-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="All">All</option>
          {uniquePipelineStatuses.map((status, index) => (
            <option key={index} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      {/* Bar Chart - Acquisition targets summarization by pipeline status */}
      <div className="bg-white shadow-md rounded-lg p-4 w-full max-w-3xl mb-6 flex justify-center items-center mx-auto">
        <BarChart targets={filteredTargets} />
      </div>

      {/* Table - All acquisition targets */}
      <div className="bg-white shadow-md rounded-lg p-4 w-full max-w-3xl flex justify-center items-center mx-auto">
        <TargetTable 
          targets={filteredTargets}
          uniquePipelineStatuses={uniquePipelineStatuses}
          onUpdatePipelineStatus={updatePipelineStatus}
        />
      </div>

      {/* Success message when pipeline status is updated successfully */}
      {showSuccessMessageModal && (
      <SuccessMessageModal
        message="Target pipeline status updated successfully."
        onClose={async () => {
          setSuccessMessageModal(false);
          await fetchTargets(); // Fetch the latest targets when the modal closes
        }}
      />
      )}
    </div>
  );
}
