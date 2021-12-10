const express = require('express');
const checkInModel = require('../schemas/checkInSchema')
const gcsManage = require('../modules/gcsManage')
const Multer = require('multer')

const checkInRoute = express.Router()
const multer = Multer({
    storage: Multer.memoryStorage(),
    fileSize: 50*1024*1024, // In MB
  })

checkInRoute.get('/list', async (req, res) => {
    const checkInLists = await checkInModel.find({}, {_id: 0})
    res.status(200).json(checkInLists)
})

checkInRoute.get('/get/:id', (req, res) => {
    const { id } = req.params
    checkInModel.findOne({id: id}, {_id: 0})
    .then((dbUser) => {
        if (!dbUser) {
            res.status(404).json({message: 'User not found'})
        } else {
            res.status(200).json(dbUser)
        }
    })
})

checkInRoute.get('/checkIn-image/:id', gcsManage.getCheckInImage)

// Send data (id, name, busNo, qrVal, pics, date, time, position) to server
checkInRoute.post('/check', multer.single('image'), gcsManage.uploadCheckInImg, (req, res) => {
    if (req.file.cloudStorageError) {
      return res.status(500).json(req.file.cloudStorageError)
    }
    const payload = {
      id: req.body.id,
      empId: req.body.empId,
      name: req.body.name,
      busId: req.body.busId,
      seatId: req.body.seatId,
      position: req.body.position,
      dateTime: req.body.dateTime,
    }
    const check_in = new checkInModel(payload)
    check_in.save()
    .then((result) => {
      res.status(200).json({message: "check in successfully"});
    })
    .catch((err) => {
      res.status(500).json({message: 'check in failed', error: err})
    })
  })
  

module.exports = checkInRoute
