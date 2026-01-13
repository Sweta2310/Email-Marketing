import express from 'express';
import { getProfile, updateProfile, changePassword } from '../controllers/profile.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Profile routes
router.get('/', getProfile);
router.put('/', updateProfile);
router.post('/change-password', changePassword);

export default router;
