import Person from "./models/person.js"
import express from "express"
import dotenv from "dotenv"
import morgan from "morgan"
import cors from "cors"

dotenv.config()
const app = express()
app.use(express.json())
app.use(cors())
app.use(express.static('build'))

morgan.token('body', (req, res) =>  Object.keys(req.body).length > 0 ? JSON.stringify(req.body) : "" )
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

const generateId = () => (Math.floor(Math.random() * 1000000))

app.get('/api/persons', (request, response, next) => {
    Person.find({}).then(people => {
        response.json(people)
    })
    .catch(error => next(error))
})

app.get('/api/persons/:id', (request, response) => {
    Person.findById(request.params.id).then(person => {
        response.json(person)
    })
    .catch(error => next(error))
})

app.get('/info', (request, response) => {
    Person.find({}).then(people => {
        const numberOfPeople = people.length
        const now = new Date()
        response.send(
            `<p>Phonebook has info for ${numberOfPeople} people</p>
            <p>${now}</p>`
        )
    })
    .catch(error => next(error))
    
})

app.post('/api/persons', (request, response, next) => {
    const body = request.body

    const person = new Person({
        id: generateId(),
        name: body.name,
        number: body.number
    })

    person.save()
    .then(savedPerson => savedPerson.toJSON())
    .then(savedAndFormattedPerson => {
      response.json(savedAndFormattedPerson)
    }) 
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
    const body = request.body

    const person = {
        name: body.name,
        number: body.number,
    }

    Person.findByIdAndUpdate(request.params.id, person, { new: true, runValidators: true })
        .then(updatedPerson => {
            response.json(updatedPerson)
        })
        .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndRemove(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}
  
// handler of requests with unknown endpoint
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
    console.error(error.message)
  
    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message })
    }
  
    next(error)
}

// handler of requests with result to errors
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})