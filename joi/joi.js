const Joi = require('joi')

const joiSchemaBook = Joi.object({

    bookName : Joi.string().min(3).max(20).required(),
    yearPublished : Joi.number().min(1500).max(2024).required(),
    genr : Joi.string().min(6).max(10).required(),
    author : Joi.alternatives().try(
        Joi.string(),
        Joi.object()
    ).required()
    
})

const joiSchemaAuthor = Joi.object({

    name : Joi.string().min(3).max(15).required(),
    lastName : Joi.string().min(3).max(15).required(),
    age : Joi.number().min(12).max(100).required()

})

exports.joiSchemaBook = joiSchemaBook;
exports.joiSchemaAuthor = joiSchemaAuthor;