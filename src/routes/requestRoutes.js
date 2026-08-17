const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');
const authMiddleware = require('../middleware/authMiddleware');

// === BLOCK: SPECIFIC NAMED ROUTES (must come before /:id routes) — START === //
router.get('/stats', authMiddleware, requestController.getDashboardStats);
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

const adminMiddleware = require('../middleware/adminMiddleware');
const upload = require('../middleware/uploadMiddleware');

// === BLOCK: ADMIN ROUTES — START === //
router.get('/admin/requests', authMiddleware, adminMiddleware, requestController.getAllRequests);
router.get('/admin/requests/:id', authMiddleware, adminMiddleware, requestController.getRequestByIdAdmin);
router.patch('/admin/requests/:id/status', authMiddleware, adminMiddleware, requestController.updateRequestStatus);
router.post('/admin/requests/:id/deliverable', authMiddleware, adminMiddleware, upload.single('file'), requestController.createDeliverable);
// === BLOCK: ADMIN ROUTES — END === //

// === BLOCK: DELIVERABLE ROUTES (client + admin) — START === //
router.get('/deliverables/:requestId', authMiddleware, requestController.getDeliverables);
router.get('/deliverables/file/:fileName', (req, res) => {
  const path = require('path');
  const filePath = path.join(__dirname, '../../uploads', req.params.fileName);
  res.sendFile(filePath);
});
// === BLOCK: DELIVERABLE ROUTES — END === //

module.exports = router;