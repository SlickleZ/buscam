const bcrypt = require('bcrypt');
const empModel = require('../schemas/empSchema')
const adminModel = require('../schemas/adminSchema')
const busModel = require('../schemas/busSchema')
const saltRounds = 12;


const addEmp = (req, res) => {
    empModel.findOne({id: req.body.id})
    .then((dbUser) => {
        if (dbUser) {
            return res.status(409).json({message: 'ID already exist'})
        } else {
            bcrypt.genSalt(saltRounds, (err, salt) => {
                if (err) {
                    return res.status(500).json({message: "couldn't generate salt"}); 
                }
                bcrypt.hash(req.body.password, salt, async (err, hash) => {
                    if (err) {
                        return res.status(500).json({message: "couldn't hash the password"});  
                    }
                    const payload = {
                        name: req.body.name,
                        position: req.body.position,
                        salary: req.body.salary,
                        id: req.body.id,
                        password: hash,
                    }
                    const employee = new empModel(payload)
                    await employee.save()
                    .then((result) => {
                        res.status(200).json({message: "user created successfully"});
                    })
                    .catch((err) => {
                        res.status(500).json({message: "error while creating the user", error: err});
                    });
                })
            })
        }
    }).catch(err => {
        console.log('err', err)
        return res.status(500).json({message: 'There was an error with find method', error: err})
    })
}

const addAdmin = (req, res) => {
    adminModel.findOne({id: req.body.id})
    .then((dbUser) => {
        if (dbUser) {
            return res.status(409).json({message: 'user already exists'})
        } else {
            bcrypt.genSalt(saltRounds, (err, salt) => {
                if (err) {
                    return res.status(500).json({message: "couldn't generate salt"})
                }
                bcrypt.hash(req.body.password, salt, (err, hash) => {
                    if (err) {
                        return res.status(500).json({message: "couldn't hash the password"})
                    }
                    const payload = {
                        id: req.body.id,
                        name: req.body.name,
                        password: hash
                    }
                    const admin = new adminModel(payload)
                    admin.save()
                    .then((result) => {
                        res.status(200).json({message: 'admin created successfully'})
                    })
                    .catch((err) => {
                        res.status(500).json({message: 'error while creating admin', err: err})
                    })
                })
            })
        }
    })
    .catch((err) => {
        res.status(500).json({message: 'error while finding admin', err: err})
    })
}

const empLogin = (req, res) => {
    empModel.findOne({id: req.body.id})
    .then((dbUser) => {
        if (!dbUser) {
            res.status(404).json({message: 'user not found'})
        } else {
            bcrypt.compare(req.body.password, dbUser.password, (err, result) => {
                if (err) {
                    return res.status(500).json({message: 'error while authorizing'})
                } else if (result) {
                    res.status(200).json({message: 'user authorized'})
                } else {
                    res.status(401).json({message: 'user is not authorized'})
                }
            })
        }
    }).catch(err => {
        console.log('err', err)
        return res.status(500).json({message: 'There was an error with find method', error: err})
    })
}

const adminLogin = (req, res) => {
    adminModel.findOne({id: req.body.id})
    .then((dbUser) => {
        if (!dbUser) {
            res.status(404).json({message: 'user not found'})
        } else {
            bcrypt.compare(req.body.password, dbUser.password, (err, result) => {
                if (err) {
                    return res.status(500).json({message: "error while authorizing'"})
                } else if (result) {
                    res.status(200).json({message: 'user authorized'})
                } else {
                    res.status(401).json({message: 'user is not authorized'})
                }
            })
        }
    })
}

const validateSeat = (req, res) => {
    const { busId, seatId } = req.body

    if (!(busId & seatId)) {
        return res.status(400).json({message: 'busId and seatId is required'})
    }

    busModel.findOne({id: busId})
    .then((dbUser) => {
        if (!dbUser) {
            return res.status(404).json({message: 'busId not found'})
        }
        // console.log(busId, seatId);
        // seatId : yyyyXX yyyy is busId, XX is seatNumber (01 - 30)
        if (seatId.slice(0, 4) == busId & (seatId.slice(4) <= 30 & seatId.slice(4).length == 2))  { // 1 bus has 30 seats
            res.status(200).json({message: 'validated successfully!'})
        } else {
            res.status(401).json({message: 'Invalid seatId!'})
        }

    }).catch(err => {
        // console.log('err', err)
        return res.status(500).json({message: 'There was an error with find method', error: err})
    })
}

module.exports = { addEmp, addAdmin, empLogin, adminLogin, validateSeat }