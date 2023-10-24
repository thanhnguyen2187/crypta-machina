import * as fs from 'fs/promises'
import * as fse from 'fs-extra'

export type Snippet = {
  id: string
  name: string
  language: string
  text: string
  encrypted: boolean
  position: number
}

export async function directoryExisted(path: string) {
  return await fse.exists(path)
}

export async function createDirectory(path: string) {
  await fse.mkdirp(path)
}

/**
 * Remove characters from the end of a string.
 *
 * @example
 * trimEnd('abc///', '/')
 * // abc
 * trimEnd('abcdef, 'a')
 * // abcdef
 * */
function trimEnd(str: string, chars: string): string {
  while (str.endsWith(chars)) {
    str = str.slice(0, -chars.length)
  }
  return str
}

export async function readFilePaths(directoryPath: string): Promise<string[]> {
  await fse.ensureDir(directoryPath)
  directoryPath = trimEnd(directoryPath, '/')

  // use `fs.readdir` instead of `fse.readdir` since the latter mysteriously
  // raise exception on `readdir` is not a function
  const fileNames = await fs.readdir(directoryPath)
  const filePaths = fileNames.map(name => `${directoryPath}/${name}`)
  return filePaths
}

export async function readSnippets(folderPath: string) {
  const snippetPaths = await readFilePaths(folderPath)
  const snippets = []
  for (const path of snippetPaths) {
    const snippetText = await fs.readFile(path, {encoding: 'utf-8'})
    const snippet = JSON.parse(snippetText)
    snippets.push(snippet)
  }
  return snippets
}
