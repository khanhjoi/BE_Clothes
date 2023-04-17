require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const cookieParser = require('cookie-parser');
 

const app = express();

// use middleware 
app.use(express.json());
app.use(cookieParser());
app.use(cors());
app.use(fileUpload({
    useTempFiles: true,
}))

// Routes
app.use('/user', require('../server/routes/userRouter'));
app.use('/api', require('../server/routes/categoryRouter'));
app.use('/api', require('../server/routes/uploadRouter'));
app.use('/api', require('../server/routes/productRouter'));


// connect to mongodb 
const URI  = "mongodb://localhost:27017/web";
mongoose.connect(URI, (err) => {
    if(err) console.log(err);
    console.log(`Connected to MongoDB`);
})

app.get('/', (req, res) => {
    res.json({msg: 'Hello '})
})

const PORT = process.env.PORT || 3030;
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`)
})