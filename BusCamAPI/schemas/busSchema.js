const mongoose = require('mongoose')
const Schema = mongoose.Schema

const busSchema = new Schema({
    id: String,
    available: String,
}, { collection: 'bus', versionKey: false, })

const busModel = mongoose.model('Bus', busSchema)

module.exports = busModel