import express, { json } from 'express'
import 'dotenv/config'
import { createLogger } from './logging.ts'
import { createDirectory, directoryExisted, readSnippets, upsertSnippet } from './persistence.ts'

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
  res.send({alive: true})
})

app.get('/api/v1/snippets', async (req, res) => {
  const handleLogger = logger.extend({
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

  const folderPath = `${dataDirectory}/${folder}`
  const snippets = await readSnippets(folderPath)
  handleLogger.info({
    dataDirectory,
    folder,
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

app.delete('/api/v1/snippet/:id', (req, res) => {
  res.send({message: 'deleted one snippet'})
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
