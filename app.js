const bodyParser = require('body-parser');
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
require('dotenv/config');
const AuthJwt = require('./middle_ware/jwt'); 
const mongoose = require('mongoose');
const errorHendler = require('./helpers/error_handler')





const app = express();
const env =  process.env;
const API = env.VERSION;


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('tiny'));
app.use(cors());
app.options('*', cors());
app.use(AuthJwt.expJwt);
app.use(errorHendler);



// Routes
const userRoute = require('./routes/user');






app.use(`${API}/sub-admin`, userRoute);



const PORT = env.PORT;
const HOSTNAME = env.HOST;
const DATABASE = env.DATABASE_STRING;

mongoose.connect(DATABASE).then(() => {
    console.log('DATA BASE CONNECTED!');
}).catch((ex) => {
    console.log(`DATA BASE CONNECTION ERROR ${ex}`);
});

app.listen(PORT, HOSTNAME, () => {
    console.log(`Server Started At http://${HOSTNAME}:${PORT} `)
});