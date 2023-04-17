const router = require('express').Router();
const cloudinary = require('cloudinary');
const auth = require('../middleware/authAdmin');
const authAdmin = require('../middleware/authAdmin');
const fs = require('fs');
const { Console } = require('console');


// we will upload image on cloudinary server
cloudinary.config({
    cloud_name: "dxkokmfiu",
    api_key: "273788454448995",
    api_secret: "ieh91tAToXf0Y6pfP0JL9GAk_uI",
});

router.post("/upload", (req, res) => {
    try {
        if(!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).send('No files were uploaded');
        }
        
        const file = req.files.img;
        console.log(file.img);
        if(file.size > 1024*1024*6) {
            removeTmp(file.tempFilePath);
            return res.status(400).json({msg: "size ti large"});
        }
        if(file.mimetype !== 'image/jpeg' && file.mimetype !== 'image/png') {
            removeTmp(file.tempFilePath);
            return res.status(400).json({msg: "File format is incorrect"});
        }
        
        cloudinary.v2.uploader.upload(file.tempFilePath, {folder: "test"}, async(err, result) => {
            if(err) throw err;

            removeTmp(file.tempFilePath);

            res.json({
                public_id: result.public_id,
                url: result.secure_url,
            });
        })

    } catch (err) {
        res.status(500).json({msg: err.message});
    }
});

// Delete image
router.post('/destroy', (req, res) => {
    try {
        const {public_id } = req.body;
        if(!public_id) {
            res.status(400).json({msg: 'No image Selected'});
        }
        cloudinary.v2.uploader.destroy(public_id, async (err, result) => {
            if(err) throw err;

            res.json({msg: "Deleted Image"});
        })

    } catch (err) {
        res.status(500).json({msg: err.message});
         
    }
})

const removeTmp = (path) => {
    fs.unlink(path, err => {
        if(err) throw err;
    })
}

module.exports = router;