import * as fs from 'fs-extra'

export async function directoryExisted(path: string) {
  return await fs.exists(path)
}

export async function createDirectory(path: string) {
  await fs.mkdirp(path)
}
