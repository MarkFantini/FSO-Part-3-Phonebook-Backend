require('dotenv').config()
const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const app = express()
const Person = require('./models/phones')

app.use(cors())
app.use(express.static('dist'))
app.use(express.json())

morgan.token('body', (request) => JSON.stringify(request.body))

app.use(
  morgan(
    ':method :url :status :res[content-length] - :response-time ms :body'
  )
)



app.get('/', (request, response) => {
  const totalPeople = Person.find({}).then(result => {
    response.json(result)
  })

  const currentDate = new Date()
  const message = `<p>Phonebook has info for ${totalPeople.length} people</p><p>${currentDate.toString()}</p>`

  response.send(message)
})



app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
})



app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})



app.post('/api/persons', (request, response, next) => {
  const body = request.body

  if (!body.name || !body.number) {
    return response.status(400).json({
      error: 'name or number missing'
    })
  }

  Person.findOne({ name: body.name })
    .then(existingPerson => {
      if (existingPerson) {
        return response.status(400).json({ error: 'name must be unique' })
      }

      const person = new Person({
        name: body.name,
        number: body.number,
      })

      return person.save()
    })
    .then(savedPerson => {
      response.json(savedPerson)
    })
    .catch(error => {
      next(error)
    })
})



app.put('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body

  if (!name || !number) {
    return response.status(400).json({
      error: 'name or number missing'
    })
  }

  Person.findByIdAndUpdate(
    request.params.id,
    { name, number },
    { new: true, runValidators: true, context: 'query' })
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => {
      console.log(error)
      next(error)
    })
})



app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(() => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)



const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).send({ error: error.message })
  }

  next(error)
}

app.use(errorHandler)



const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})