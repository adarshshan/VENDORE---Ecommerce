import { Router } from 'express';
import { BannerController } from '../controllers/BannerController';
import { protect, admin } from '../middleware/auth';
import upload from '../middleware/multer';

const router = Router();
const bannerController = new BannerController();

// Public routes
router.get('/', (req, res) => bannerController.getActiveBanners(req, res));

// Admin routes
router.get('/admin/all', protect, admin, (req, res) => bannerController.getAllBanners(req, res));
router.post('/admin', protect, admin, upload.single('image'), (req, res) => bannerController.createBanner(req, res));
router.put('/admin/:id', protect, admin, upload.single('image'), (req, res) => bannerController.updateBanner(req, res));
router.delete('/admin/:id', protect, admin, (req, res) => bannerController.deleteBanner(req, res));
router.put('/admin/:id/toggle', protect, admin, (req, res) => bannerController.toggleBannerVisibility(req, res));

export { router as bannerRoutes };
