import express from 'express'
import 'dotenv/config'
import { createLogger } from './logging.ts'
import { createDirectory, directoryExisted, readSnippets } from './persistence.ts'

const app = express()
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
  const handleLogger = logger.extend({path: '/api/v1/snippets'})
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

  const snippets = await readSnippets(`${dataDirectory}/${folder}`)
  handleLogger.info({
    dataDirectory,
    folder,
    message: `fetched ${snippets.length} snippet(s) successfully`,
  })
  res.send({
    data: snippets
  })
})

app.put('/api/v1/snippet/:id', (req, res) => {
  const { id } = req.params
  res.send({message: 'snippet id ' + id})
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
