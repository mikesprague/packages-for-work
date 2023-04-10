import fs from 'node:fs';

/**
 * @function writeDataAsJsonFile
 * @summary  async function that writes an object as a string in JSON format to a file
 * @example  await writeDataAsJsonFile({
 *   path: 'outputDirectory/',
 *   fileName: 'my-data.json',
 *   data: referenceToDataObject
 * });
 * @param    {writeDataAsJsonFileParams} obj object with parameters
 * @param    {string} obj.path
 * @param    {string} obj.fileName
 * @param    {Object} obj.data
 * @returns  {Promise<boolean>} true if file was written successfully
 */

export interface writeDataAsJsonFileParams {
  path: string;
  fileName: string;
  data: any;
}

export const writeDataAsJsonFile = async ({
  path,
  fileName,
  data,
}: writeDataAsJsonFileParams): Promise<boolean> => {
  try {
    if (!fs.existsSync(path)) {
      await fs.mkdirSync(path, { recursive: true });
    }
    await fs.writeFileSync(`${path}${fileName}`, JSON.stringify(data, null, 2));

    return true;
  } catch (error) {
    console.error(error);

    return false;
  }
};
