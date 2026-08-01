const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');
const authMiddleware = require('../middleware/authMiddleware');

// Protected routes
router.post('/requests', authMiddleware, requestController.createRequest);
router.get('/requests', authMiddleware, requestController.getMyRequests);
router.get('/requests/:id', authMiddleware, requestController.getRequestById);
router.put('/requests/:id', authMiddleware, requestController.updateRequest);
router.delete('/requests/:id', authMiddleware, requestController.deleteRequest);
router.patch('/requests/:id/restore', authMiddleware, requestController.restoreRequest);
router.patch('/requests/:id/submit', authMiddleware, requestController.submitRequest);
router.get('/service-types', authMiddleware, requestController.getServiceTypes);

module.exports = router;
