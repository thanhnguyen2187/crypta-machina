import express from 'express'
import 'dotenv/config'
import { createLogger } from './logging.ts'

const app = express()
const port = Number.parseInt(process.env.PORT ?? '21870')
const dataFolder = process.env.DATA_FOLDER ?? '~/.config/crypta'
const logger = createLogger({
  get date(): string {
    return new Date().toISOString()
  },
})

app.get('/api/v1/alive', (req, res) => {
  res.send({alive: true})
})

app.get('/api/v1/snippets', (req, res) => {
  res.send({message: 'fetched all snippets'})
})

app.put('/api/v1/snippet/:id', (req, res) => {
  const { id } = req.params
  res.send({message: 'snippet id ' + id})
})

app.delete('/api/v1/snippet/:id', (req, res) => {
  res.send({message: 'deleted one snippet'})
})

app.listen(port, () => {
  logger.info({
    message: `Application started`,
    port,
  })
})
