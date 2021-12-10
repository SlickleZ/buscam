const express = require('express')
const busModel = require('../schemas/busSchema')
const { validateSeat } = require('../modules/auth')
const busRoute = express.Router()

busRoute.get('/list', async (req, res) => {
    const buses = await busModel.find({}, {_id: 0})
    res.status(200).json(buses)
})

// used for checking bus available status
busRoute.get('/get/:id', async (req, res) => {
    const { id } = req.params
    await busModel.findOne({ id: id }, {_id: 0})
    .then((dbUser) => {
        if (!dbUser) {
            res.status(404).json({message: 'bus not found'})
        } else {
            res.status(200).json(dbUser)
        }
    })
})

busRoute.post('/add', (req, res) => {
    busModel.findOne({id: req.body.id})
    .then(async (dbUser) => {
        if (dbUser) {
            return res.status(409).json({message: 'BusID already exist'})
        } else {
            const payload = {
                id: req.body.id,
                available: 'no',
            }
            const bus = new busModel(payload)
            await bus.save((err) => {
                if (err) {
                    res.status(500).json({message: "error while adding bus"});
                } else {
                    res.status(200).json({message: "bus created"});
                }
            })
        }
    })
    .catch((err) => {
        return res.status(500).json({message: 'There was an error with find method', error: err})
    })
})

// used for scan QR Code Screen
busRoute.post('/validate-seat', validateSeat)

busRoute.put('/set-status/:id', async (req, res) => {
    const { status } = req.body
    const { id } = req.params
    await busModel.findOne({id: id})
    .then((dbUser) => {
        if (!dbUser) {
            return res.status(404).json({message: 'BusID not found'})
        }
        busModel.updateOne({id: id}, {status: status})
        .then(() => {
            res.status(200).json({message: 'edit status successfully'})
        })
        .catch((err) => {
            res.status(500).json({'message': 'There was an error', 'error': err})
        })
    })
    .catch(err => res.status(500).json({'message': 'There was an error with find method', 'error': err}))
})

busRoute.delete('/del', async (req, res) => {
    const { id } = req.body
    await busModel.findOne({id: id})
    .then((dbUser) => {
        if (!dbUser) {
            return res.status(404).json({message: 'BusID not found'})
        }
        busModel.deleteOne({id: id}, (err) => {
            if (err) {
                res.status(500).json({'message': 'There was an error', 'error': err})
            } else {
                res.status(200).json({message: 'delete bus successfully'})
            }
        })
    })
    .catch(err => res.status(500).json({'message': 'There was an error with find method', 'error': err}))
})

module.exports = busRoute