import { Router } from 'express';
import { catalogController } from '../controllers/catalog.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { requireAdmin } from '../middlewares/role.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createCatalogEntrySchema, updateCatalogEntrySchema } from '../schemas/catalog.schema.js';
import { uuidParamSchema } from '../schemas/common.schema.js';

const router = Router();

/**
 * [ROUTE] /api/v1/catalog
 * Public sacred puja catalog exploration and management.
 */
router.get('/', catalogController.getCatalog);
router.get('/:id', validate(uuidParamSchema, 'params'), catalogController.getCatalogById);
router.post('/', requireAuth, requireAdmin, validate(createCatalogEntrySchema), catalogController.createCatalogEntry);
router.put('/:id', requireAuth, requireAdmin, validate(uuidParamSchema, 'params'), validate(updateCatalogEntrySchema), catalogController.updateCatalogEntry);
router.delete('/:id', requireAuth, requireAdmin, validate(uuidParamSchema, 'params'), catalogController.deleteCatalogEntry);

export const catalogRoutes = router;

