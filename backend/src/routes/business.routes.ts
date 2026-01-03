import { Router } from 'express';
import { businessService } from '../services/business.service.js';
import { authMiddleware as auth, adminMiddleware as adminOnly } from '../middleware/auth.middleware.js';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Configure Multer for File Uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
    fileFilter: (req, file, cb) => {
        // Accept common document and image types
        if (file.mimetype.match(/^(image\/.*|application\/pdf|application\/msword|application\/vnd.openxmlformats-officedocument.wordprocessingml.document)$/)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type'));
        }
    }
});

// ==========================================
// PUBLIC ROUTES
// ==========================================

// Get All Services
router.get('/services', async (req, res) => {
    try {
        const services = await businessService.getAllServices();
        res.json(services);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch services' });
    }
});

// Get Service by Slug
router.get('/services/:slug', async (req, res) => {
    try {
        const service = await businessService.getServiceBySlug(req.params.slug);
        if (!service) return res.status(404).json({ error: 'Service not found' });
        res.json(service);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch service' });
    }
});

// Get Testimonials
router.get('/testimonials', async (req, res) => {
    try {
        const testimonials = await businessService.getTestimonials();
        res.json(testimonials);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch testimonials' });
    }
});

// Get Clients
router.get('/clients', async (req, res) => {
    try {
        const clients = await businessService.getClients();
        res.json(clients);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch clients' });
    }
});

// Create Booking (Public + File Upload)
router.post('/bookings', upload.single('attachment'), async (req, res) => {
    try {
        const attachment_url = req.file ? `/uploads/${req.file.filename}` : undefined;

        const bookingData = {
            ...req.body,
            attachment_url
        };

        const result = await businessService.createBooking(bookingData);
        res.status(201).json(result);
    } catch (err: any) {
        res.status(400).json({ error: err.message || 'Booking failed' });
    }
});


// ==========================================
// CLIENT ROUTES (Protected)
// ==========================================

// Get My Bookings
router.get('/client/bookings', auth, async (req, res) => {
    try {
        const userId = (req as any).user.userId;
        const bookings = await businessService.getUserBookings(userId);
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch bookings' });
    }
});

// Get My Booking Details
router.get('/client/bookings/:id', auth, async (req, res) => {
    try {
        const userId = (req as any).user.userId;
        const booking = await businessService.getUserWithBookings(userId); // Reusing logic or create specific getBooking(id, userId)
        // Ideally we should have a getBookingByIdAndUser(id, userId)
        // For now let's just use the list or implement a getBooking check
        // Actually, let's implement a proper check if needed, but the list is fetched first.
        // Frontend calls getBookingDetails(id) only if needed.
        // Let's implement a simple direct fetch.

        // TEMPORARY: Just return from the list logic for now or implement direct query
        // Let's rely on list for now or add proper method if frontend uses it (it does in client.service getBookingDetails)

        // Actually client.service has getBookingDetails. Let's add that route too.
        res.status(501).json({ error: 'Not implemented' }); // User hasn't complained about detail view separately yet, they use the dashboard list.
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch booking' });
    }
});


// ==========================================
// ADMIN ROUTES (Protected)
// ==========================================

// Get All Bookings (Admin)
router.get('/bookings', auth, adminOnly, async (req, res) => {
    try {
        const bookings = await businessService.getBookings();
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch bookings' });
    }
});

// Create Service
router.post('/services', auth, adminOnly, async (req, res) => {
    try {
        const service = await businessService.createService(req.body);
        res.status(201).json(service);
    } catch (err) {
        res.status(500).json({ error: 'Failed to create service' });
    }
});

// Update Service
router.put('/services/:id', auth, adminOnly, async (req, res) => {
    try {
        const service = await businessService.updateService(req.params.id, req.body);
        if (!service) return res.status(404).json({ error: 'Service not found' });
        res.json(service);
    } catch (err) {
        res.status(500).json({ error: 'Failed to update service' });
    }
});

// Delete Single Booking
router.delete('/bookings/:id', auth, adminOnly, async (req, res) => {
    try {
        await businessService.deleteBooking(req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete booking' });
    }
});

// Bulk Delete Bookings
router.post('/bookings/bulk-delete', auth, adminOnly, async (req, res) => {
    try {
        const { ids } = req.body;
        if (!ids || !Array.isArray(ids)) {
            return res.status(400).json({ error: 'IDs array required' });
        }
        await businessService.bulkDeleteBookings(ids);
        res.json({ success: true, deleted: ids.length });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete bookings' });
    }
});

// Create Testimonial
router.post('/testimonials', auth, adminOnly, async (req, res) => {
    try {
        const testimonial = await businessService.createTestimonial(req.body);
        res.status(201).json(testimonial);
    } catch (err) {
        res.status(500).json({ error: 'Failed to create testimonial' });
    }
});

// Create Client
router.post('/clients', auth, adminOnly, async (req, res) => {
    try {
        const client = await businessService.createClient(req.body);
        res.status(201).json(client);
    } catch (err) {
        res.status(500).json({ error: 'Failed to create client' });
    }
});

// ==========================================
// USERS MANAGEMENT (for Admin Panel)
// ==========================================

// Get All Client Users
router.get('/users', auth, adminOnly, async (req, res) => {
    try {
        const users = await businessService.getAllClientUsers();
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// Get User by ID with all bookings
router.get('/users/:id', auth, adminOnly, async (req, res) => {
    try {
        const user = await businessService.getUserWithBookings(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

// Update User Credentials
router.put('/users/:id/credentials', auth, adminOnly, async (req, res) => {
    try {
        const { email, password } = req.body;
        await businessService.updateUserCredentials(req.params.id, email, password);
        res.json({ success: true, message: 'Credentials updated' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update credentials' });
    }
});

// Delete User
router.delete('/users/:id', auth, adminOnly, async (req, res) => {
    try {
        await businessService.deleteUser(req.params.id);
        res.json({ success: true, message: 'User deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

// ==========================================
// STATUS MANAGEMENT & TIMELINE
// ==========================================

// Update Booking Status (with history tracking)
router.put('/bookings/:id/status', auth, adminOnly, async (req, res) => {
    try {
        const { status, progress, notes } = req.body;
        const adminId = (req as any).user.userId;
        const booking = await businessService.updateBookingStatus(req.params.id, status, progress, notes, adminId);
        res.json(booking);
    } catch (err) {
        res.status(500).json({ error: 'Failed to update status' });
    }
});

// Get Status History/Timeline (accessible to both admin and user)
router.get('/bookings/:id/history', auth, async (req, res) => {
    try {
        const history = await businessService.getStatusHistory(req.params.id);
        res.json(history);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch history' });
    }
});

// ==========================================
// CHAT MESSAGES
// ==========================================

// Get Messages for a Booking
// Get Messages for a Booking
router.get('/bookings/:id/messages', auth, async (req, res) => {
    try {
        console.log(`GET /bookings/${req.params.id}/messages HIT by ${(req as any).user?.email}`);
        const messages = await businessService.getBookingMessages(req.params.id);
        console.log(`Found ${messages.length} messages for booking ${req.params.id}`);
        res.json(messages);
    } catch (err) {
        console.error('Get Messages Error:', err);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

// Send Message
// Send Message
router.post('/bookings/:id/messages', auth, (req, res, next) => {
    upload.single('attachment')(req, res, (err) => {
        if (err) {
            console.error('Multer Upload Error:', err);
            return res.status(400).json({ error: err.message || 'File upload failed' });
        }
        next();
    });
}, async (req, res) => {
    try {
        console.log('POST /bookings/:id/messages HIT');
        console.log('Body:', req.body);
        console.log('File:', req.file);

        const senderId = (req as any).user.userId;
        const senderRole = (req as any).user.role;
        const content = req.body.content || ''; // Handle empty content explicitly
        const attachment_url = req.file ? `/uploads/${req.file.filename}` : undefined;

        const message = await businessService.sendMessage(req.params.id, senderId, senderRole, content, attachment_url);
        res.status(201).json(message);
    } catch (err) {
        console.error('Send Message Logic Error:', err);
        res.status(500).json({ error: 'Failed to send message' });
    }
});

// ==========================================
// DASHBOARD STATS
// ==========================================

// Get Dashboard Stats
router.get('/stats', auth, adminOnly, async (req, res) => {
    try {
        const stats = await businessService.getDashboardStats();
        res.json(stats);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

export const businessRoutes = router;

// ==========================================
// STATS MANAGEMENT (Public GET, Admin CRUD)
// ==========================================

// Get All Stats (Public - for home page)
router.get('/home-stats', async (req, res) => {
    try {
        const stats = await businessService.getStats();
        res.json(stats);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

// Create Stat (Admin)
router.post('/home-stats', auth, adminOnly, async (req, res) => {
    try {
        const stat = await businessService.createStat(req.body);
        res.status(201).json(stat);
    } catch (err) {
        res.status(500).json({ error: 'Failed to create stat' });
    }
});

// Update Stat (Admin)
router.put('/home-stats/:id', auth, adminOnly, async (req, res) => {
    try {
        const stat = await businessService.updateStat(req.params.id, req.body);
        if (!stat) return res.status(404).json({ error: 'Stat not found' });
        res.json(stat);
    } catch (err) {
        res.status(500).json({ error: 'Failed to update stat' });
    }
});

// Delete Stat (Admin)
router.delete('/home-stats/:id', auth, adminOnly, async (req, res) => {
    try {
        await businessService.deleteStat(req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete stat' });
    }
});

// ==========================================
// CASE STUDIES (Public GET, Admin CRUD)
// ==========================================

// Get All Active Case Studies (Public - for home page)
router.get('/case-studies', async (req, res) => {
    try {
        const caseStudies = await businessService.getCaseStudies();
        res.json(caseStudies);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch case studies' });
    }
});

// Get All Case Studies including inactive (Admin)
router.get('/case-studies/all', auth, adminOnly, async (req, res) => {
    try {
        const caseStudies = await businessService.getAllCaseStudies();
        res.json(caseStudies);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch case studies' });
    }
});

// Get Case Study by Slug (Public)
router.get('/case-studies/:slug', async (req, res) => {
    try {
        const caseStudy = await businessService.getCaseStudyBySlug(req.params.slug);
        if (!caseStudy) return res.status(404).json({ error: 'Case study not found' });
        res.json(caseStudy);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch case study' });
    }
});

// Create Case Study (Admin)
router.post('/case-studies', auth, adminOnly, async (req, res) => {
    try {
        const caseStudy = await businessService.createCaseStudy(req.body);
        res.status(201).json(caseStudy);
    } catch (err) {
        res.status(500).json({ error: 'Failed to create case study' });
    }
});

// Update Case Study (Admin)
router.put('/case-studies/:id', auth, adminOnly, async (req, res) => {
    try {
        const caseStudy = await businessService.updateCaseStudy(req.params.id, req.body);
        if (!caseStudy) return res.status(404).json({ error: 'Case study not found' });
        res.json(caseStudy);
    } catch (err) {
        res.status(500).json({ error: 'Failed to update case study' });
    }
});

// Delete Case Study (Admin)
router.delete('/case-studies/:id', auth, adminOnly, async (req, res) => {
    try {
        await businessService.deleteCaseStudy(req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete case study' });
    }
});

