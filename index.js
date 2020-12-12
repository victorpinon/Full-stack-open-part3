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

let persons = [
    {
        name: "Arto Hellas",
        number: "040-123456",
        id: 1
    },
    {
        name: "Ada Lovelace",
        number: "39-44-5323523",
        id: 2
    },
    {
        name: "Dan Abramov",
        number: "12-43-234345",
        id: 3
    },
    {
        name: "Mary Poppendieck",
        number: "39-23-6423122",
        id: 4
    }
]

const generateId = () => (Math.floor(Math.random() * 1000000))

app.get('/api/persons', (request, response, next) => {
    Person.find({}).then(people => {
        response.json(people)
    })
    .catch(error => next(error))
})

// TO-DO
app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(person => person.id === id)
    
    if (person) {
        response.json(person)
    } else {
        response.status(404).end()
    }
})

//TO-DO
app.get('/info', (request, response) => {
    const numberOfPeople = persons.length
    const now = new Date()
    response.send(
        `<p>Phonebook has info for ${numberOfPeople} people</p>
         <p>${now}</p>`
    )
})

app.post('/api/persons', (request, response, next) => {
    const body = request.body

    if (!body.name) {
      return response.status(400).json({ 
        error: 'name missing' 
      })
    }
    else if (!body.number) {
        return response.status(400).json({ 
            error: 'number missing' 
        })
    }
    /*else if (persons.find(p => p.name === body.name)) {
        return response.status(409).json({ 
            error: 'name must be unique' 
        })
    }*/

    const person = new Person({
        id: generateId(),
        name: body.name,
        number: body.number
    })

    person.save().then(savedPerson => {
        response.json(savedPerson)
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
    } 
  
    next(error)
}

// handler of requests with result to errors
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})