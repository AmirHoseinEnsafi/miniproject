const express = require('express')

const router = express.Router()
const mongoose = require('mongoose')
const Joi = require('joi')

const {Author} = require('../mongoose-model/mongoose')
const {joiSchemaAuthor} = require('../joi/joi')

function objectIdvalidate(id){
    return mongoose.Types.ObjectId.isValid(id)
}

router.get('/' , async (req , res) => {
    const authors = await Author.find()
    res.send(JSON.stringify(authors , null , 2))
})

router.post('/' , async (req , res) => {
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

router.get('/:id' , async (req , res) => {
    if(!objectIdvalidate(req.params.id))return res.status(400).send(`id must be valid id`)

    const author = await Author.findById(req.params.id)

    if(!author) return res.status(404).send(`author not found try with correct id`)

    res.send(author)
})

const putJoiSchema = Joi.object({

    name : Joi.string().min(3).max(15),
    lastName : Joi.string().min(3).max(15),
    age : Joi.number().min(12).max(100)

})

router.put('/:id' , async (req, res) => {
    if(!objectIdvalidate(req.params.id))return res.status(400).send(`id must be valid id`)

    //check the if body dont have property or user send nothing
    const property = ['name' , 'lastName' , 'age']
    const a = property.filter(prop => !(prop in req.body));
    if(a.length > 2) return res.status(400).send(`send the value of the property you want to update`)

    const author = await Author.findById(req.params.id)
    if(!author) return res.status(404).send(`author not found try with correct id`)

    const {error} = putJoiSchema.validate(req.body)
    if(error) return res.status(400).send(error.details[0].message)


    if(req.body.name) author.name = req.body.name
    if(req.body.lastName) author.lastName = req.body.lastName
    if(req.body.age) author.age = req.body.age
    
    const result = await author.save()
    res.send(result)
})

router.delete('/:id' , async (req , res) => {
    if(!objectIdvalidate(req.params.id)) return res.status(400).send(`id is not valid id please send the valid id`)
    const author = await Author.findByIdAndDelete(req.params.id) 
    if(!author) return res.status(404).send(`id not found please check the id you send`)
    res.send(`author deleted successfully and this was the author id : ${req.params.id}`)
})

module.exports = router