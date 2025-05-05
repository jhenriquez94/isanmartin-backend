import { Router } from 'express';
import { UFService } from '../services/uf.service';

const router = Router();

// Ruta de diagnóstico para verificar la API externa
router.get('/diagnostico', async (_req, res) => {
  try {
    const resultado = await UFService.diagnosticoAPI();
    return res.json(resultado);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ 
        message: 'Error en el diagnóstico', 
        error: error.message 
      });
    }
    return res.status(500).json({ message: 'Error desconocido' });
  }
});

// Obtener el valor actual de la UF
router.get('/current', async (_req, res) => {
  try {
    const ufValue = await UFService.getUFValue();
    return res.json({ value: ufValue });
  } catch (error) {
    return res.status(500).json({ message: 'Error al obtener el valor de la UF' });
  }
});

// Convertir de UF a CLP
router.get('/convert', async (req, res) => {
  try {
    const { amount } = req.query;
    
    if (!amount || isNaN(Number(amount))) {
      return res.status(400).json({ message: 'El monto debe ser un número válido' });
    }
    
    const priceCLP = await UFService.convertUFToCLP(Number(amount));
    return res.json({ 
      uf: Number(amount), 
      clp: priceCLP,
      ufValue: await UFService.getUFValue()
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error al convertir de UF a CLP' });
  }
});

export default router; 