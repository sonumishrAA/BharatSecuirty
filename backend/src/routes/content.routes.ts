import { Router } from 'express';
import { contentController } from '../controllers/content.controller.js';

const router = Router();

// Main content routes
router.get('/services', (req, res) => contentController.getServices(req, res));
router.get('/case-studies', (req, res) => contentController.getCaseStudies(req, res));
router.get('/homepage', (req, res) => contentController.getHomepage(req, res));
router.get('/statistics', (req, res) => contentController.getStatistics(req, res));
router.get('/testimonials', (req, res) => contentController.getTestimonials(req, res));

// CMS specific routes (grouped under /cms in controller, but handled here)
// Note: App.ts mounts this at /api, so these will be /api/cms/client-logos if handled appropriately
// However, the router here is flat. We need to handle the structure.
// The user request shows: /api/cms/client-logos
// So we can define sub-routes here.

router.get('/cms/client-logos', (req, res) => contentController.getClientLogos(req, res));
router.get('/cms/technologies', (req, res) => contentController.getTechnologies(req, res));
router.get('/cms/process-steps', (req, res) => contentController.getProcessSteps(req, res));

export default router;
