const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');
const authMiddleware = require('../middleware/authMiddleware');

// === BLOCK: SPECIFIC NAMED ROUTES (must come before /:id routes) — START === //
router.post('/requests/save', authMiddleware, requestController.saveRequestAsDraft);
router.get('/service-types', authMiddleware, requestController.getServiceTypes);
// === BLOCK: SPECIFIC NAMED ROUTES — END === //

// === BLOCK: COLLECTION ROUTES — START === //
router.post('/requests', authMiddleware, requestController.createRequest);
router.get('/requests', authMiddleware, requestController.getMyRequests);
// === BLOCK: COLLECTION ROUTES — END === //

// === BLOCK: INDIVIDUAL REQUEST ROUTES (/:id) — START === //
router.get('/requests/:id', authMiddleware, requestController.getRequestById);
router.put('/requests/:id', authMiddleware, requestController.updateRequest);
router.delete('/requests/:id', authMiddleware, requestController.deleteRequest);
router.patch('/requests/:id/restore', authMiddleware, requestController.restoreRequest);
router.patch('/requests/:id/submit', authMiddleware, requestController.submitRequest);
// === BLOCK: INDIVIDUAL REQUEST ROUTES — END === //

module.exports = router;