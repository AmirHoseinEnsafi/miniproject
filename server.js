const express = require('express')
const app = express()

const mongoose = require('mongoose')

const Joi = require('joi')

mongoose.connect('mongodb://localhost/playground')
    .then(() => console.log(`connected to the data base`))
    .catch((err) => console.error(err))

const authorSchema = mongoose.Schema({
    name : String,
    lastName : String,
    age : Number
})

const Author = mongoose.model('author' , authorSchema)

const bookSchema = mongoose.Schema({
    bookName : String,
    yearPublished : Number,
    genr : {
        type : String,
        enum : ['Fiction' , 'Non-fiction' , 'Mystery' , 'Fantasy' , 'Romance' , 'Historical ' , 'Horror']
    },
    author : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'author'
    }
})

const Book = mongoose.model('book' , bookSchema)

const joiSchemaAuthor = Joi.object({
    name : Joi.string().min(3).max(15).required(),
    lastName : Joi.string().min(3).max(15).required(),
    age : Joi.number().min(12).max(100).required()
})

const joiSchemaBook = Joi.object({
    bookName : Joi.string().min(3).max(20).required(),
    yearPublished : Joi.number().min(1500).max(2024).required(),
    genr : Joi.string().min(6).max(10).required(),
    author : Joi.alternatives.try(
        Joi.string,
        Joi.object
    ).required()
})



function objectIdvalidate(id){
    return mongoose.Types.ObjectId.isValid(id)
}

app.use(express.JSON())

app.get('/authors' , async (req , res) => {
    const authors = await Author.find()
    res.send(JSON.stringify(authors , null , 2))
})

app.post('/authors' , async (req , res) => {
    const  {error} = joiSchemaAuthor.validate(req.body)
    if(error)return res.status(400).send(error.details[0].message)
    const author = new Author({
        name : req.body.name,
        lastName : req.body.lastName,
        age : req.body.age
    })
    const result = await author.save()
    res.send(result)
})

app.get('/authors/:id' , async (req , res) => {
    if(!objectIdvalidate(req.params.id))return res.status(400).send(`id must be valid id`)
    const author = await Author.findById(req.body.id)
    if(!author) return res.status(404),send(`author not found try with correct id`)
    res.send(author)
})

const putJoiSchema = Joi.object({
    name : Joi.string().min(3).max(15),
    lastName : Joi.string().min(3).max(15),
    age : Joi.number().min(12).max(100)
})

app.put('/authors/:id' , async (req, res) => {
    if(!objectIdvalidate(req.params.id))return res.status(400).send(`id must be valid id`)
    const author = await Author.findById(req.body.id)
    if(!author) return res.status(404),send(`author not found try with correct id`)
    const {error} = putJoiSchema.validate(req.body)
    if(error) return res.status(400).send(error.details[0].message)
    if(req.body.name) author.name = req.body.name
    if(req.body.lastName) author.lastName = req.body.lastName
    if(req.body.age) author.age = req.body.age
    const result = await author.save()
    res.send(result)
})

app.delete('/authors/:id' , async (req , res) => {
    if(!objectIdvalidate(req.params.id)) return res.status(400).send(`id is not valid id please send the valid id`)
    const author = Author.findByIdAndDelete(req.params.id) 
    if(!author) return res.status(404).send(`id not found please check the id you send`)
    res.send(`author deleted successfully and this is the author lastName : ${author.lastName}`)
})

app.get('/books' , async (req , res) => {
    const books = await Book.find().populate('author')
    res.send(JSON.stringify(books , null , 2))
})


app.post('books' , async (req, res) => {
    if(!objectIdvalidate(req.body.author)){//if user dont send the object id of the author instead send object to create new author
        const {error} = joiSchemaAuthor.validate(req.body.author)
        if(error)return res.status(400).send(error.details[0].message)
        const authorInDB = await Author.find({name : req.body.author.name , lastName : req.body.author.lastName})
        if(authorInDB) return res.status(400).send(`author is already exist please send the correct author id`)
        const author = new Author({
            name : req.body.author.name,
            lastName : req.body.author.lastName,
            age : req.body.author.age
        })
        const resultAuthor = await author.save()
        const book = new Book({
            bookName : req.body.bookName,
            yearPublished : req.body.yearPublished,
            genr : req.body.genr,
            author : resultAuthor._id
        })
        let result = await book.save()
        result = await result.populate('author')
        res.send(result)
    }else{
        const {error} = joiSchemaBook.validate(req.body)
        if(error)res.status(400).send(error.details[0].message)
        const book = new Book({
            bookName : req.body.bookName,
            yearPublished : req.body.yearPublished,
            genr : req.body.genr,
            author : req.body.author
        })
        let result = await book.save()
        result = await result.populate('author')
        res.send(result)    
    }  
})

app.get('/books/:id' , async (req , res) => {
     if(!objectIdvalidate(req.params.id))return res.status(400).send(`bad request : please send a valid id`)
     const book = await Book.findById(req.params.id).populate('author')
     if (!book) return res.status(404).send(`book not found`)
     res.send(book)
})

const putBookValidate = Joi.object({
    bookName : Joi.string().min(3).max(20),
    yearPublished : Joi.number().min(1500).max(2024),
    genr : Joi.string().min(6).max(10),
    author : Joi.alternatives.try(
        Joi.string,
        Joi.object
    )
})
function checkvalue(x){
    const value = ['Fiction' , 'Non-fiction' , 'Mystery' , 'Fantasy' , 'Romance' , 'Historical ' , 'Horror']
    const exist = value.find(val => val === x)
    if(exist)return true;
    else return false;
}
app.put('/books/:id' , async (req , res) => {
    if(!objectIdvalidate(req.params.id)) return res.status(400).send(`please send the valid id`)
    const book = await Book.findById(req.params.id)
    if(!book) return res.status(404).send(`book not found`)
    const {error} = putBookValidate(req.body)
    if(error)return res.status(400).send(error.details[0].message)
    if(req.body.bookName) book.bookName = req.body.bookName
    if(req.body.yearPublished) book.yearPublished = req.body.yearPublished
    if(checkvalue(req.body.genr)) book.genr = req.body.genr
    if(req.body.author){
        if(objectIdvalidate(req.body.author)) book.author = req.body.author
        else{
        const {error} = joiSchemaAuthor.validate(req.body.author)
        if(error)return res.status(400).send(error.details[0].message)
        const authorInDB = await Author.find({name : req.body.author.name , lastName : req.body.author.lastName})
        if(authorInDB) return res.status(400).send(`author is already exist please send the correct author id`)
        const author = new Author({
            name : req.body.author.name,
            lastName : req.body.author.lastName,
            age : req.body.author.age
        })
        const resultAuthor = await author.save()
        book.author = resultAuthor._id            
        }
    }
    let result = await book.save()
    result = await result.populate('author')
    res.send(result)
})

app.delete('/books/:id' , async (req , res) => {
    if(!objectIdvalidate(req.params.id))return res.status(400).send(`bad request : givin id is not correct please send the valid id`)
    const book = await Book.findByIdAndDelete(req.params.id)
    if(!book) return res.status(404).send(`with givin id book not found in the data base`)
    res.send(`book delet successfully and book deleted was ${book.bookName}`)
})
