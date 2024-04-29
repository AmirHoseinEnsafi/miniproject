const express = require('express')
const app = express()
const mongoose = require('mongoose')
const Joi = require('joi')

const books = require('./router/book-router')
const authors = require('./router/author-router')

mongoose.connect('mongodb://localhost/playground')
    .then(() => console.log(`connected to the data base`))
    .catch((err) => console.error(err))

app.use(express.json())

app.use('/books' , books)
app.use('/authors' , authors)


const PORT = process.env.PORT || 3000

app.listen(PORT , () =>  console.log(`listening to the port : ${PORT}`))