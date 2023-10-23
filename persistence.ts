import * as fs from 'fs-extra'

export async function folderExisted(path: string) {
  return await fs.exists(path)
}

export async function createFolder(folderPath: string) {
  await fs.mkdirp(folderPath)
}
