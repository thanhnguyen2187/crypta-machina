import express from 'express'

const app = express()
const port = 3001

app.get('/', (req, res) => {
  res.send({message: 'hello world'})
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
  console.log(`Example app listening on port ${port}`)
})
