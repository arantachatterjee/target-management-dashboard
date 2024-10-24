export const dynamic = 'force-dynamic';

import { NextResponse, NextRequest } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

/**
 * Handles the GET request to retrieve all acquisition targets.
 * @returns {NextResponse} A JSON response containing the targets data.
 */
export async function GET() {
  try {
    const filePath = getTargetsFilePath();
    const data = await fs.readFile(filePath, 'utf8');
    const targetsData = JSON.parse(data);
    return NextResponse.json(targetsData);
  } catch (error) {
    console.error('Error reading targets data:', error);
    return NextResponse.json({ error: 'Error reading targets data.' }, { status: 500 });
  }
}

/**
 * Handles the PUT request to update the pipeline status of a specific target.
 * Expects a JSON payload with the target id and the new status.
 * @param {NextRequest} req - The incoming request containing the target id and new status.
 * @returns {NextResponse} A JSON response indicating the success or failure of the update operation.
 */
export async function PUT(req: NextRequest) {
  try {
    const { id, newStatus } = await req.json();

    if (typeof id !== 'number' || typeof newStatus !== 'string') {
      return NextResponse.json({ error: 'Invalid input data.' }, { status: 400 });
    }

    const filePath = getTargetsFilePath();
    const data = await fs.readFile(filePath, 'utf8');
    const targetsData = JSON.parse(data);
    
    const currentDate = new Date().toISOString();
    const updatedTargets = targetsData.map((target: { id: number }) =>
      target.id === id ? { ...target, pipelineStatus: newStatus, lastUpdated: currentDate } : target
    );

    await writeTargets(updatedTargets);

    return NextResponse.json({ message: 'Pipeline status updated successfully.' }, { status: 200 });
  } catch (error) {
    console.error('Error updating pipeline status:', error);
    return NextResponse.json({ error: 'Error updating pipeline status.' }, { status: 500 });
  }
}

/**
 * Constructs the file path to the targets.json file located in the data directory.
 * @returns {string} The file path to targets.json.
 */
const getTargetsFilePath = () => path.join(process.cwd(), 'data', 'targets.json')

/**
 * Writes the updated targets data to the targets.json file.
 * @param {unknown} updatedTargets - The updated targets data to write.
 */
const writeTargets = (updatedTargets: unknown) => {
  const filePath = getTargetsFilePath()
  fs.writeFile(filePath, JSON.stringify(updatedTargets, null, 2), 'utf8')
}
