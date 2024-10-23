import React from "react";
import { Target } from "@/lib/types"

/**
 * Props for the TargetTable component.
 * @interface TargetTableProps
 * @property {AcquisitionTarget[]} targets - List of acquisition targets to display.
 * @property {string[]} uniquePipelineStatuses - Unique pipeline statuses to populate the dropdown options.
 * @property {(id: number, newStatus: string) => void} onUpdatePipelineStatus - Function to handle updates to the pipeline status of a target.
 */
interface TargetTableProps {
  targets: Target[];
  uniquePipelineStatuses: string[];
  onUpdatePipelineStatus: (id: number, newStatus: string) => void;
}

/**
 * Helper function to extract unique statuses from the list of acquisition targets.
 * Null statuses are treated as "Unknown".
 * @param {Target[]} targets - List of targets.
 * @returns {string[]} An array of unique pipeline statuses.
 */
const getUniqueStatuses = (targets: Target[]) => {
  const statuses = targets.map((target) => target.pipelineStatus || "Unknown");
  return Array.from(new Set(statuses)); // Get unique statuses
};

/**
 * TargetTable component to display acquisition targets in a grouped, sortable table.
 * @component
 * @param {TargetTableProps} props - Props for the component.
 * @returns {JSX.Element} A table grouped by pipeline status, displaying target details.
 */
export default function TargetTable({ 
  targets,
  onUpdatePipelineStatus,
}: TargetTableProps) {
  // Fetch unique statuses
  const uniqueStatuses = getUniqueStatuses(targets);

   // Group targets by pipeline status
   const groupedTargets = targets.reduce((acc, target) => {
    const status = target.pipelineStatus || "Unknown"; // Default to "Unknown" if pipelineStatus is null
    if (!acc[status]) {
      acc[status] = []; // Initialize an array for this status
    }
    acc[status].push(target);
    return acc;
  }, {} as Record<string, Target[]>);

  // Helper function to sort each group by lastUpdated date in descending order
  const sortedGroupedTargets = Object.entries(groupedTargets).sort(([statusA], [statusB]) => {
    // Sort groups by the last updated date of their most recent target
    const latestA = Math.max(...groupedTargets[statusA].map(target => new Date(target.lastUpdated).getTime()));
    const latestB = Math.max(...groupedTargets[statusB].map(target => new Date(target.lastUpdated).getTime()));
    return latestB - latestA; // Sort groups in descending order
  });

   // Helper function to format the date to "Month day, year" format for better readability
   const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Render the table
  return (
   <table className="w-full border-collapse border border-gray-300">
      <thead>
        <tr>
          <th className="border border-gray-300 px-4 py-2">Company Name</th>
          <th className="border border-gray-300 px-4 py-2">Pipeline Status</th>
          <th className="border border-gray-300 px-4 py-2">Markets</th>
          <th className="border border-gray-300 px-4 py-2">Last Updated</th>
        </tr>
      </thead>
      <tbody>
        {sortedGroupedTargets.map(([pipelineStatus, acquisitionTargets]) => (
          <React.Fragment key={pipelineStatus}>
            <tr>
              <td
                colSpan={4}
                className="border border-gray-300 bg-gray-100 font-bold px-4 py-2"
              >
                {pipelineStatus}
              </td>
            </tr>
            {acquisitionTargets.map((target) => (
              <tr key={target.id}>
                <td className="border border-gray-300 px-4 py-2">
                  {target.name}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {/* Editable Table Field - Pipeline Status */}
                  <div className="tooltip">
                    <select
                      value={target.pipelineStatus || "Unknown"}
                      onChange={(e) =>
                        onUpdatePipelineStatus(target.id, e.target.value)
                      }
                      className="border rounded p-1"
                    >
                      {uniqueStatuses.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                    <span className="tooltip-text">Change the pipeline status</span>
                  </div>
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  <ul className="list-disc pl-5">
                    {target.markets.length > 0 ? (
                      target.markets.map((market) => (
                        <li key={market}>{market}</li>
                      ))
                    ) : (
                      <li>Unknown</li>
                    )}
                  </ul>
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {/* Display lastUpdated date in Month, date and year format for better readability */}
                  {formatDate(target.lastUpdated)}
                </td>
              </tr>
            ))}
          </React.Fragment>
        ))}
      </tbody>
    </table>
  );
}
