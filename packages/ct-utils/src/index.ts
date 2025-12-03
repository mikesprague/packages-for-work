import fs from 'node:fs';
import path from 'node:path';

/**
 * @function writeDataAsJsonFile
 * @summary  async function that writes an object as a string in JSON format to a file
 * @example  await writeDataAsJsonFile({
 *   data: referenceToDataObject
 *   fileName: 'outputDirectory/my-data.json',
 * });
 * @param    {WriteDataAsJsonFileParams} obj object with parameters
 * @param    {Object} obj.data
 * @param    {string} obj.fileName name of the file to write (including path and .json extension)
 * @returns  {Promise<boolean>}
 */

export interface WriteDataAsJsonFileParams {
  data: unknown;
  fileName: string;
}
export const writeDataAsJsonFile = async ({
  data,
  fileName,
}: WriteDataAsJsonFileParams): Promise<boolean> => {
  try {
    fs.mkdirSync(path.dirname(fileName), { recursive: true });
    fs.writeFileSync(fileName, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error(`Error writing JSON file to ${fileName}:`, error);
    return Promise.resolve(false);
  }
  return Promise.resolve(true);
};
