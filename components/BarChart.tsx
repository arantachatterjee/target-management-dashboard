import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import { Target } from "@/lib/types"

// Register required chart elements for Chart.js to work correctly
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

/**
 * Props for the BarChart component.
 * @interface BarChartProps
 * @property {Target[]} targets - An array of target objects to display in the bar chart.
 */
interface BarChartProps {
  targets: Target[];
}

/**
 * BarChart component that displays a bar chart summarizing the status counts of targets.
 * @component
 * @param {BarChartProps} props - The props for the BarChart component.
 * @returns {JSX.Element} A rendered bar chart component using react-chartjs-2.
 */
export default function BarChart({ targets }: BarChartProps) {

  /**
   * Compute the counts of each pipeline status from the provided targets.
   * @constant
   * @type {Record<string, number>}
   */
  const statusCounts = targets.reduce((acc: Record<string, number>, target) => {
    const status = target.pipelineStatus || "Unknown";
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

   /**
   * Data object for the bar chart, containing labels and datasets.
   * @constant
   * @type {object}
   */
  const data = {
    labels: Object.keys(statusCounts),
    datasets: [
      {
        label: "Pipeline Status",
        data: Object.values(statusCounts),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
      },
    ],
  };

  // Render the Bar component with the prepared data
  return <Bar data={data} />;
}
