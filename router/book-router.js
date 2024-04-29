const express = require('express')

const router = express.Router()
const mongoose = require('mongoose')
const Joi = require('joi')

const {Author , Book} = require('../mongoose-model/mongoose')
const {joiSchemaAuthor , joiSchemaBook} = require('../joi/joi')

router.get('/' , async (req , res) => {
    const books = await Book.find().populate('author')
    res.send(JSON.stringify(books , null , 2))
})

function objectIdvalidate(id){
    return mongoose.Types.ObjectId.isValid(id)
}


router.post('/' , async (req, res) => {
    const book = await Book.find({bookName : req.body.bookName , yearPublished : req.body.yearPublished})
    if(!book.length == 0)return res.status(400).send(`book is already exist`)

    if (!objectIdvalidate(req.body.author) && typeof req.body.author === 'string') return res.status(400).send(`please write the valid id`);
    if (!objectIdvalidate(req.body.author) && typeof req.body.author === 'object') { //if user dont send the object id of the author instead send object to create new author
        
        let {error: error1} = joiSchemaBook.validate(req.body);
        if (error1) return res.status(400).send(error1.details[0].message);

        let {error: error2} = joiSchemaAuthor.validate(req.body.author);
        if (error2) return res.status(400).send(error2.details[0].message);

        const authorInDB = await Author.find({name : req.body.author.name , lastName : req.body.author.lastName})
        if(!authorInDB.length == 0) return res.status(400).send(`author is already exist please send the correct author id`)

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
        const author = await Author.findById(req.body.author)
        if(!author) return res.status(400).send(`givin id in author is not exist for eny of the authors please send the existing id`)

        const {error} = joiSchemaBook.validate(req.body)
        if(error) return res.status(400).send(error.details[0].message)

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

router.get('/:id' , async (req , res) => {
     if(!objectIdvalidate(req.params.id))return res.status(400).send(`bad request : please send a valid id`)

     const book = await Book.findById(req.params.id).populate('author')
     if (!book) return res.status(404).send(`book not found please write the correct id`)

     res.send(book)
})

const putBookValidate = Joi.object({

    bookName : Joi.string().min(3).max(20),
    yearPublished : Joi.number().min(1500).max(2024),
    genr : Joi.string().min(6).max(10),
    author : Joi.alternatives().try(
        Joi.string(),
        Joi.object()
    )

})


router.put('/:id' , async (req , res) => {
    
    if(!objectIdvalidate(req.params.id)) return res.status(400).send(`please send the valid id`)

    const book = await Book.findById(req.params.id)
    if(!book) return res.status(404).send(`book not found`)

    const {error} = putBookValidate.validate(req.body)
    if(error)return res.status(400).send(error.details[0].message)

    const property = ['bookName' , 'yearPublished' , 'genr' , 'author']
    const a = property.filter(prop => !(prop in req.body));
    if(a.length > 3) return res.status(400).send(`send the value of the property you want to update`)

    if(req.body.bookName) book.bookName = req.body.bookName
    if(req.body.yearPublished) book.yearPublished = req.body.yearPublished
    if(req.body.genr) book.genr = req.body.genr
    if(req.body.author){

        if (!objectIdvalidate(req.body.author) && typeof req.body.author === 'string') return res.status(400).send(`please write the valid id`);
        if (objectIdvalidate(req.body.author)){
            const author = await Author.findById(req.body.author)
            if(author) book.author = req.body.author
            else return res.status(400).send(`the author id is not exist you must send the existing the id`)
        }
        if (typeof req.body.author === 'object'){
            
        let {error} = joiSchemaAuthor.validate(req.body.author)
        if(error)return res.status(400).send(error.details[0].message)

        const authorInDB = await Author.find({name : req.body.author.name , lastName : req.body.author.lastName})
        if(authorInDB.length > 0) return res.status(400).send(`author is already exist please send the correct author id`)

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

router.delete('/:id' , async (req , res) => {
    if(!objectIdvalidate(req.params.id))return res.status(400).send(`bad request : givin id is not correct please send the valid id`)
    
    const book = await Book.findByIdAndDelete(req.params.id)
    
    if(!book) return res.status(404).send(`with givin id book not found in the data base`)
    res.send(`book delet successfully and book deleted was ${book.bookName}`)
})

module.exports = router;