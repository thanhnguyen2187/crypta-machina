import express, { json } from 'express'
import cors from 'cors'
import 'dotenv/config'

import { createLogger } from './logging.ts'
import {
  createDirectory,
  deleteSnippet,
  directoryExisted,
  readSnippet,
  readSnippets,
  upsertSnippet
} from './persistence.ts'
import expressBasicAuth from 'express-basic-auth'

const port = Number.parseInt(process.env.PORT ?? '21870')
const dataDirectory = process.env.DATA_DIRECTORY ?? './data'
const authentication = process.env.AUTHENTICATION ?? 'admin:admin'
const [username, password] = authentication.split(':')
const logger = createLogger({
  get date(): string {
    return new Date().toISOString()
  },
})

const app = express()
app.use(json())
app.use(cors())
app.use(expressBasicAuth({
  users: {[username]: password},
  challenge: true,
  realm: 'crypta-machina',
}))

app.get('/api/v1/alive', (req, res) => {
  const handleLogger = logger.extend({
    path: '/api/v1/alive',
    method: 'GET',
    fromIP: req.ip,
  })
  res.send({alive: true})
  handleLogger.info({})
})

app.get('/api/v1/snippets', async (req, res) => {
  let handleLogger = logger.extend({
    path: '/api/v1/snippets',
    method: 'GET',
  })
  let { folder } = req.query
  if (typeof folder === 'undefined') {
    folder = 'default'
  } else if (typeof folder !== 'string') {
    const errObj = {
      message: 'invalid folder in query param',
      expected: [
        'arbitrary-string',
        undefined,
      ],
      got: folder,
    }
    handleLogger.error(errObj)
    res.status(400).send(errObj)
    return
  }
  handleLogger = handleLogger.extend({folder})

  const snippets = await readSnippets(dataDirectory, folder)
  handleLogger.info({
    dataDirectory,
    message: `fetched ${snippets.length} snippet(s) successfully`,
  })
  res.send({
    data: snippets
  })
})

app.put('/api/v1/snippet', async (req, res) => {
  const { id } = req.body
  let { folder } = req.query
  let handleLogger = logger.extend({
    path: `/api/v1/snippet`,
    id,
    method: 'PUT',
  })
  if (typeof folder === 'undefined') {
    folder = 'default'
  } else if (typeof folder !== 'string') {
    const errObj = {
      message: 'invalid folder in query param',
      expected: [
        'arbitrary-string',
        undefined,
      ],
      got: folder,
    }
    handleLogger.error(errObj)
    res.status(400).send(errObj)
    return
  }
  handleLogger = handleLogger.extend({folder})

  try {
    await upsertSnippet(dataDirectory, folder, req.body)
    const message = 'upsert snippet successfully'
    handleLogger.info({message})
    res.send({message})
  } catch (error: any) {
    const message = 'failed upserting snippet'
    handleLogger.error({message, error})
    res.status(500).send({message})
  }
})

app.delete('/api/v1/snippet/:id', async (req, res) => {
  const { id } = req.params
  let { folder } = req.query
  let handleLogger = logger.extend({
    path: `/api/v1/snippet/:id`,
    id,
    method: 'DELETE',
  })
  if (typeof folder === 'undefined') {
    folder = 'default'
  } else if (typeof folder !== 'string') {
    const errObj = {
      message: 'invalid folder in query param',
      expected: [
        'arbitrary-string',
        undefined,
      ],
      got: folder,
    }
    handleLogger.error(errObj)
    res.status(400).send(errObj)
    return
  }
  handleLogger.extend({folder})

  try {
    await deleteSnippet(dataDirectory, folder, id)
    const message = 'deleted snippet successfully'
    handleLogger.info({message})
    res.send({message})
  } catch (error: any) {
    const message = 'failed deleting snippet'
    handleLogger.error({message, error})
    res.status(500).send({message})
  }
})

app.get('/api/v1/snippet/:id', async (req, res) => {
  const { id } = req.params
  let { folder } = req.query
  let handleLogger = logger.extend({
    path: `/api/v1/snippet/:id`,
    id,
    method: 'GET',
  })
  if (typeof folder === 'undefined') {
    folder = 'default'
  } else if (typeof folder !== 'string') {
    const errObj = {
      message: 'invalid folder in query param',
      expected: [
        'arbitrary-string',
        undefined,
      ],
      got: folder,
    }
    handleLogger.error(errObj)
    res.status(400).send(errObj)
    return
  }
  handleLogger.extend({folder})

  try {
    const snippet = await readSnippet(dataDirectory, folder, id)
    const message = 'read snippet successfully'
    handleLogger.info({message})
    res.send({message, data: snippet})
  } catch (error: any) {
    const message = 'failed reading snippet'
    handleLogger.error({message, error})
    res.status(500).send({message})
  }
})

app.listen(port, async () => {
  const appLogger = logger.extend({
    port,
    dataDirectory,
  })
  appLogger.info({
    message: 'Crypta Machina started',
    username,
  })
  if (!await directoryExisted(dataDirectory)) {
    await createDirectory(dataDirectory)
    appLogger.info({
      message: 'data directory did not exist and was created'
    })
  }
})
