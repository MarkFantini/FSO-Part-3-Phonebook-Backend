require('dotenv').config()
const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const app = express()
const Person = require('./models/phones')

app.use(cors())
app.use(express.static('dist'))
app.use(express.json())

morgan.token("body", (request) => JSON.stringify(request.body))

app.use(
  morgan(
    ':method :url :status :res[content-length] - :response-time ms :body'
  )
)

let persons = [
  { 
    "id": "1",
    "name": "Arto Hellas", 
    "number": "040-123456"
  },
  { 
    "id": "2",
    "name": "Ada Lovelace", 
    "number": "39-44-5323523"
  },
  { 
    "id": "3",
    "name": "Dan Abramov", 
    "number": "12-43-234345"
  },
  { 
    "id": "4",
    "name": "Mary Poppendieck", 
    "number": "39-23-6423122"
  }
]


app.get('/', (request, response) => {
  const currentDate = new Date()
  const message = `<p>Phonebook has info for ${persons.length} people</p><p>${currentDate.toString()}</p>`
  
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



app.post('/api/persons', (request, response) => {
  // const body = request.body
  // const name = request.body.name
  // const nameExists = persons.find(person => person.name === name)

  // if (!body.name || !body.number) {
  //   return response.status(400).json({
  //     error: 'name or number missing'
  //   })
  // } else if (nameExists) {
  //   return response.status(400).json({
  //     error: 'name must be unique'
  //   })
  // }

  // const person = {
  //   id: Math.floor(Math.random()*10000).toString(),
  //   name: body.name,
  //   number: body.number,
  // }

  // persons = persons.concat(person)

  // response.json(person)
  const body = request.body

  if (body.name === undefined || body.number === undefined) { 
    return response.status(400).json({
      error: 'content missing'
    })
  }

  Person.find({ name: body.name }).then(result => {
    response.json({ error: 'name must be unique' })
  })

  const newPerson = new Person({
    name: body.name,
    number: body.number,
  })

  newPerson.save().then(savedPerson => {
    response.json(savedPerson)
  })
})



app.put('/api/persons/:id', (request, response) => {
  const body = request.body
  const name = body.name
  const newNumber = body.number
  const id = request.params.id

  if (!body.name || !body.number) {
    return response.status(400).json({
      error: 'name or number missing'
    })
  }

  const updatedPerson = {
    id: id,
    name: name,
    number: newNumber
  }

  persons = persons.map(person => person.id === id ? updatedPerson : person)

  response.json(updatedPerson)
})



app.delete('/api/persons/:id', (request, response) => {
  // const id = request.params.id
  // console.log('ID to be deleted: ', id)
  // persons = persons.filter(person => person.id !== id)
  // console.log('Persons after deletion')
  // console.log(persons)

  // response.status(204).end()
  Person.findByIdAndDelete(request.params.id)
    .then(result => {
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
    return response.status(400).send({ error: 'malformatted id'})
  }

  next(error)
}

app.use(errorHandler)



const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})