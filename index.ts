import express, { json } from 'express'
import 'dotenv/config'
import { createLogger } from './logging.ts'
import { createDirectory, deleteSnippet, directoryExisted, readSnippets, upsertSnippet } from './persistence.ts'

const app = express()
app.use(json())

const port = Number.parseInt(process.env.PORT ?? '21870')
const dataDirectory = process.env.DATA_DIRECTORY ?? './data'
const logger = createLogger({
  get date(): string {
    return new Date().toISOString()
  },
})

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
  let { folder } = req.query
  const handleLogger = logger.extend({
    path: `/api/v1/snippet`,
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

  try {
    await upsertSnippet(dataDirectory, folder, req.body)
    const successObj = {
      message: 'upsert snippet successfully',
      id: req.body.id,
    }
    handleLogger.info(successObj)
    res.send(successObj)
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

app.listen(port, async () => {
  const appLogger = logger.extend({
    port,
    dataDirectory,
  })
  appLogger.info({
    message: 'Crypta Machina started'
  })
  if (!await directoryExisted(dataDirectory)) {
    await createDirectory(dataDirectory)
    appLogger.info({
      message: 'data directory did not exist and was created'
    })
  }
})
