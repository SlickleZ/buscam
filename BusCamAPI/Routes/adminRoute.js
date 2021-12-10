const express = require('express')
const { addAdmin, adminLogin } = require('../modules/auth')

const adminRoute = express.Router()

adminRoute.post('/add', addAdmin)
adminRoute.post('/login', adminLogin)

module.exports = adminRoute