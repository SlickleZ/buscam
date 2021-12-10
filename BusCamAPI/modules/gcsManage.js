const {Storage} = require('@google-cloud/storage');

const storage = new Storage({
    projectId: 'getstartedcloud101',
    keyFilename: './keyfile.json',
});


let bucketName = 'buscam-picture'

let gcsManage = {}

gcsManage.changeProfileImg = (req, res, next) => {
    const bucket = storage.bucket(bucketName)

    if(!req.file) return res.status(500).json({'message': 'There was an error' , 'error': 'no file available'});

    // console.log(req);
    const gcsFileName = 'profile/'+req.file.originalname;
    const file = bucket.file(gcsFileName);
    
    const stream = file.createWriteStream({
        metadata: {
            contentType: req.file.mimetype,
            cacheControl: 'no-store',
        },
        resumable: false,
        gzip: true,
    });
    stream.on('error', err => {
        req.file.cloudStorageError = err;
        next(err);
    });
    stream.on('finish', () => {
        req.file.cloudStorageObject = gcsFileName;
        next();
    });
    stream.end(req.file.buffer);
};

// TODO -> this function may be fixed in the future
gcsManage.uploadCheckInImg = (req, res, next) => {
    const bucket = storage.bucket(bucketName)

    if(!req.file) return res.status(500).json({'message': 'There was an error' , 'error': 'no file available'});

    // console.log(req);
    const gcsFileName = 'check_in/'+req.file.originalname;
    const file = bucket.file(gcsFileName);

    const stream = file.createWriteStream({
        metadata: {
            contentType: req.file.mimetype,
            cacheControl: 'no-store',
        },
        resumable: false,
        gzip: true,
    });

    stream.on('error', err => {
        req.file.cloudStorageError = err;
        next(err);
    });

    stream.on('finish', () => {
        req.file.cloudStorageObject = gcsFileName;
        next();
    });

    stream.end(req.file.buffer);
};

gcsManage.deleteProfile = (req, res) => {
    const bucket = storage.bucket(bucketName);

    const gcsFileName = 'profile/'+req.body.id+'-profile.jpg'
    const file = bucket.file(gcsFileName);
    
    file.delete()
    .then((data) => {
        res.status(200).json({message: 'delete user successfully'})
    })
    .catch(err => {
        res.status(500).json({'message': 'There was an error', 'error': err})
    })
}

gcsManage.getProfileImage = (req, res) => {
    const { id } = req.params

    const bucket = storage.bucket(bucketName)
    const gcsFileName = 'profile/'+id+'-profile.jpg'
    const file = bucket.file(gcsFileName);
    
    var remoteReadStream = file.createReadStream()
    remoteReadStream.on('error', err => {
        res.status(404).json({'message': 'Image not founded', 'error': err})
    })
    res.header('Content-Type', 'image/jpeg')
    remoteReadStream.pipe(res)
}

gcsManage.getCheckInImage = (req, res) => {
    const { id } = req.params

    const bucket = storage.bucket(bucketName)
    const gcsFileName = 'check_in/'+id+'.jpg'
    const file = bucket.file(gcsFileName);
    
    var remoteReadStream = file.createReadStream()
    remoteReadStream.on('error', err => {
        res.status(404).json({'message': 'Image not founded', 'error': err})
    })
    res.header('Content-Type', 'image/jpeg')
    remoteReadStream.pipe(res)
}

module.exports = gcsManage;