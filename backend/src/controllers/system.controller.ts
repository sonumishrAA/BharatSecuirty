import { Request, Response } from 'express';
import { query } from '../config/database.js';
import { mediaService } from '../services/media.service.js';

export const getRoutes = (req: Request, res: Response) => {
    try {
        const routes: any[] = [];
        const app = req.app;

        function print(path: any, layer: any) {
            if (layer.route) {
                layer.route.stack.forEach((lo: any) => {
                    if (lo.route) {
                        routes.push({
                            path: path + lo.route.path,
                            method: Object.keys(lo.route.methods)[0].toUpperCase()
                        });
                    }
                });
                if (layer.route.path && layer.route.methods) {
                    routes.push({
                        path: path + layer.route.path,
                        method: Object.keys(layer.route.methods)[0].toUpperCase()
                    });
                }
            } else if (layer.name === 'router' && layer.handle.stack) {
                layer.handle.stack.forEach((l: any) => {
                    let p = path;
                    // Improved regex parsing for router path
                    if (layer.regexp) {
                        const str = layer.regexp.source
                            .replace('^\\', '')
                            .replace('\\/?(?=\\/|$)', '')
                            .replace(/\\\//g, '/');
                        if (str !== '^' && str !== '') p += '/' + str;
                    }
                    print(p, l);
                });
            }
        }

        // iterate main stack
        app._router.stack.forEach((layer: any) => {
            print('', layer);
        });

        // Clean up paths (remove double slashes, etc if regex failed slightly)
        const cleanRoutes = routes.map(r => ({
            ...r,
            path: r.path.replace(/\/\//g, '/').replace(/\\\//g, '/')
        })).filter(r => r.path !== '' && !r.path.includes('node_modules'));

        // Removing duplicates
        const uniqueRoutes = [...new Map(cleanRoutes.map(item => [item.method + ':' + item.path, item])).values()];

        res.json(uniqueRoutes);
    } catch (error) {
        console.error('Error fetching routes:', error);
        res.status(500).json({ error: 'Failed to fetch routes' });
    }
};

export const getTables = async (req: Request, res: Response) => {
    try {
        const result = await query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name
        `);
        res.json(result.rows.map(r => r.table_name));
    } catch (error) {
        console.error('Error fetching tables:', error);
        res.status(500).json({ error: 'Failed to fetch tables' });
    }
};

export const getTableData = async (req: Request, res: Response) => {
    const { tableName } = req.params;

    // Safety check: allow only alphanumeric and underscores
    if (!/^[a-zA-Z0-9_]+$/.test(tableName)) {
        return res.status(400).json({ error: 'Invalid table name' });
    }

    try {
        // First check if table exists to prevent errors
        const exists = await query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = $1
            )
        `, [tableName]);

        if (!exists.rows[0].exists) {
            return res.status(404).json({ error: 'Table not found' });
        }

        const result = await query(`SELECT * FROM ${tableName} LIMIT 100`);
        res.json(result.rows);
    } catch (error) {
        console.error(`Error fetching data for ${tableName}:`, error);
        res.status(500).json({ error: `Failed to fetch data for ${tableName}` });
    }
};

export const getFiles = async (req: Request, res: Response) => {
    try {
        const files = await mediaService.listAll();
        res.json(files);
    } catch (error) {
        console.error('Error fetching files:', error);
        res.status(500).json({ error: 'Failed to fetch files' });
    }
};
