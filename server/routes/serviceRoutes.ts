import { Router } from 'express';
import { db } from '../db.ts';

export const serviceRouter = Router();

// GET /api/services
serviceRouter.get('/', (req, res): any => {
  const { category, platform, search } = req.query;

  let query = 'SELECT * FROM services WHERE active = 1';
  const params: any[] = [];

  if (category && typeof category === 'string') {
    query += ' AND category = ?';
    params.push(category);
  }

  if (platform && typeof platform === 'string') {
    query += ' AND platform = ?';
    params.push(platform);
  }

  if (search && typeof search === 'string') {
    query += ' AND (name LIKE ? OR description LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  query += ' ORDER BY category ASC, rate_per_1000 ASC';

  const services = db.prepare(query).all(...params);
  return res.json(services);
});

// GET /api/services/categories
serviceRouter.get('/categories', (req, res): any => {
  const categories = db.prepare(`
    SELECT category, platform, COUNT(*) as service_count
    FROM services
    WHERE active = 1
    GROUP BY category, platform
    ORDER BY service_count DESC
  `).all();

  return res.json(categories);
});

// GET /api/services/:id
serviceRouter.get('/:id', (req, res): any => {
  const service = db.prepare('SELECT * FROM services WHERE id = ? AND active = 1').get(req.params.id);
  if (!service) {
    return res.status(404).json({ error: 'Huduma haikupatikana au imezimwa kwa sasa.' });
  }
  return res.json(service);
});
