const express = require('express')
require("dotenv").config()
const empRoute = require('./Routes/empRoute')
const busRoute = require('./Routes/busRoute')
const checkInRoute = require('./Routes/checkInRoute')
const adminRoute = require('./Routes/adminRoute')
const mongoose = require('mongoose')
const helmet = require('helmet')

const app = express()

app.set('api-key', process.env.API_KEY)
app.use((req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(401).json({message: 'api-key is required'})
  }

  const api_key = app.get('api-key')
  const req_key = req.headers.authorization.split(' ')[1]
  
  if (req_key === api_key) {
    next()
  } else {
    return res.status(401).json({message: 'access denied'})
  }
})
app.use(express.json())
app.use(helmet())

const connectToMongo = async () => {
  await mongoose.connect(process.env.ATLAS_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    bufferMaxEntries: 0,
    bufferCommands: true,
  })
}

connectToMongo()
app.use('/emp', empRoute)
app.use('/bus', busRoute)
app.use('/checkIn', checkInRoute)
app.use('/admin', adminRoute)

app.listen(process.env.PORT, () => {
  console.log(`Application is running ...`)
})