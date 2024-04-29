const mongoose = require('mongoose')

const authorSchema = mongoose.Schema({
    name : String,
    lastName : String,
    age : Number
})

const Author = mongoose.model('author' , authorSchema)

const bookSchema = mongoose.Schema({
    bookName : String,
    yearPublished : Number,
    genr : String,
    author : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'author'
    }
})

const Book = mongoose.model('book' , bookSchema)

exports.Author = Author;
exports.Book = Book;