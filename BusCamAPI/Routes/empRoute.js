const express = require('express')
const Multer = require('multer')
const bcrypt = require('bcrypt');
const {addEmp, empLogin} = require('../modules/auth')
const empModel = require('../schemas/empSchema')
const gcsManage = require('../modules/gcsManage')
const empRoute = express.Router()
const saltRounds = 12;

const multer = Multer({
    storage: Multer.memoryStorage(),
    fileSize: 50*1024*1024, // In MB
})

empRoute.get('/list', async (req, res) => {
    const employees = await empModel.find({}, {password: 0, _id: 0})
    res.status(200).json(employees)
})

empRoute.get('/get/:id', async (req, res) => {
    const { id } = req.params
    await empModel.findOne({ id: id }, {password: 0, _id: 0})
    .then((dbUser) => {
        if (!dbUser) {
            res.status(404).json({message: 'user not found'})
        } else {
            res.status(200).json(dbUser)
        }
    })
})

empRoute.get('/profile-image/:id', gcsManage.getProfileImage)

empRoute.post('/add', addEmp)
empRoute.post('/login', empLogin)

empRoute.put('/profile-picture/change', multer.single('image'), gcsManage.changeProfileImg, async (req, res) => {
    if (req.file.cloudStorageError) {
        return res.status(500).json(req.file.cloudStorageError)
    }
    res.status(200).json({message: `${req.file.cloudStorageObject} has been changed`});
})


empRoute.put('/set-password/:id', async (req, res) => {
    const password = req.body.password
    const { id } = req.params
    await empModel.findOne({id: id})
    .then((dbUser) => {
        if (!dbUser) {
            return res.status(404).json({message: 'user not found'})
        }
        bcrypt.genSalt(saltRounds, (err, salt) => {
            if (err) {
                return res.status(500).json({message: 'Could not generate salt'})
            }
            bcrypt.hash(password, salt, (err, hash) => {
                if (err) {
                    return res.status(500).json({message: 'Could not hash password'})
                }
                empModel.updateOne({id: id}, {password: hash})
                .then(() => {
                    res.status(200).json({message: 'password updated'})
                })
                .catch(err => {
                    res.status(500).json({message: 'There was an error updating the password', 'error': err})
                })
            })
        })
    })
    .catch(err => res.status(500).json({'message': 'There was an error with find method', 'error': err}))
})

empRoute.delete('/del', async (req, res, next) => {
    const { id } = req.body
    await empModel.findOne({id: id})
    .then((dbUser) => {
        if (!dbUser) {
            return res.status(404).json({message: 'user not found'})
        }
        empModel.deleteOne({id: id}, (err) => {
            if (err) {
                res.status(500).json({'message': 'There was an error', 'error': err})
            } else {
                next()
            }
        })
    })
    .catch(err => res.status(500).json({'message': 'There was an error with find method', 'error': err}))
}, gcsManage.deleteProfile)

module.exports = empRoute