import { Router } from 'express';
import { PropertyController } from '../controllers/property.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { UFService } from '../services/uf.service';

const router = Router();

// Rutas públicas
router.get('/', PropertyController.getAllProperties);

// Ruta para obtener el valor actual de la UF
router.get('/uf/current', async (_req, res) => {
  try {
    const ufValue = await UFService.getUFValue();
    return res.json({ value: ufValue });
  } catch (error) {
    return res.status(500).json({ message: 'Error al obtener el valor de la UF' });
  }
});

router.get('/:id', PropertyController.getPropertyById);

// Rutas protegidas
router.use(authMiddleware);
router.post('/', PropertyController.createProperty);
router.put('/:id', PropertyController.updateProperty);
router.delete('/:id', PropertyController.deleteProperty);

export default router; 