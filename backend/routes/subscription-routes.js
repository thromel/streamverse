const express = require('express');
const {check} = require('express-validator');
const subscriptionController = require('../controllers/subscription-controller');
const checkAuth = require('../middleware/check-auth');


const router = express.Router();

//TODO: Add authorization
//router.use(checkAuth);

router.get('/', subscriptionController.getSubscriptions);

router.get('/subid/:email', subscriptionController.getSubId);

router.get('/bill/:sub_id', subscriptionController.getBill);

router.get('/isvalid/:sub_id', subscriptionController.isValidSubscription);

router.post('/add', subscriptionController.addSubscription);

router.get('/history/:email', subscriptionController.getHistory);

router.get('/getenddate/:email', subscriptionController.getEndDate);

router.post('/update', subscriptionController.updateSubscription);

router.patch('/delete', subscriptionController.deleteSubscription);

router.get('/plans', subscriptionController.getplans);

module.exports = router;