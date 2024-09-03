const express = require('express');
const router = express.Router();
const UserController = require('../controllers/user');


router.post('/registerAdmin', UserController.registerAdmin);
router.post('/loginAdmin', UserController.loginAdmin);
router.post('/createBusiness', UserController.createBusiness);



module.exports = router;
