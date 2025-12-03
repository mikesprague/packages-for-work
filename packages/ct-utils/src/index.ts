import fs from 'node:fs';

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
 * @returns  {Promise<boolean>} true if file was written successfully
 */

export interface WriteDataAsJsonFileParams {
  data: unknown;
  fileName: string;
}
export const writeDataAsJsonFile = async ({
  data,
  fileName,
}: WriteDataAsJsonFileParams): Promise<void> => {
  await fs.writeFileSync(fileName, JSON.stringify(data, null, 2), 'utf-8');
};
