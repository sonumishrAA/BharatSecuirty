import express from 'express';
import { authMiddleware as auth, adminMiddleware as adminOnly } from '../middleware/auth.middleware.js';
import { getRoutes, getTables, getTableData, getFiles } from '../controllers/system.controller.js';

export const systemRoutes = express.Router();

// Get all API routes
systemRoutes.get('/routes', auth, adminOnly, getRoutes);

// Get all database tables
systemRoutes.get('/tables', auth, adminOnly, getTables);

// Get data from a specific table
systemRoutes.get('/tables/:tableName', auth, adminOnly, getTableData);

// Get all uploaded files
systemRoutes.get('/files', auth, adminOnly, getFiles);
