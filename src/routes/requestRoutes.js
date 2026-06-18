const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');
const authMiddleware = require('../middleware/authMiddleware');

// Protected routes
router.post('/requests', authMiddleware, requestController.createRequest);
router.get('/requests', authMiddleware, requestController.getMyRequests);
router.get('/service-types', authMiddleware, requestController.getServiceTypes);

module.exports = router;
