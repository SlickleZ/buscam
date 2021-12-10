const mongoose = require('mongoose')
const Schema = mongoose.Schema

const empSchema = new Schema({
    name: String,
    position: String,
    salary: Number,
    id: String,
    password: String,
}, { collection: 'employee', versionKey: false, })

const empModel = mongoose.model('Employee', empSchema)

module.exports = empModel