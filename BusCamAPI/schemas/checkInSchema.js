const mongoose = require('mongoose')
const Schema = mongoose.Schema

// Send data (id, name, busNo, qrVal, pics, date, time, position) to server
const checkInSchema = new Schema({
    id: String,
    empId: String,
    name: String,
    busId: String,
    seatId: String,
    position: String,
    dateTime: String,
}, { collection: 'check_in', versionKey: false, })

const checkInModel = mongoose.model('CheckIn', checkInSchema)

module.exports = checkInModel
