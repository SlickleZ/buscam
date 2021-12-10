const mongoose = require('mongoose')
const Schema = mongoose.Schema

const adminSchema = new Schema({
    id: String,
    name: String,
    password: String,
}, { collection: 'admin', versionKey: false, })

const adminModel = mongoose.model('Admin', adminSchema)

module.exports = adminModel
