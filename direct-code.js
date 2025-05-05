// Backend simplificado para ISanMartin
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const axios = require('axios');

// Crear la aplicación Express
const app = express();
const port = process.env.PORT || 10000;

// Variables de configuración
const JWT_SECRET = process.env.JWT_SECRET || 'isanmartin_secret_key_segura';
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://isanmartin.cl';

// Configuración de la base de datos
const dbConfig = {
  host: process.env.DB_HOST || '193.203.175.234',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'u678089138_sanmartin',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'u678089138_isanmartin'
};

// Valor actual de la UF (se actualizará periódicamente)
let ufValue = 36000; // Valor por defecto
let lastUfUpdate = null;

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [FRONTEND_URL, 'http://localhost:3000'];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`Origen bloqueado por CORS: ${origin}`);
      callback(null, true); // Permitir de todas formas en desarrollo
    }
  },
  credentials: true
}));
app.use(express.json());

// Middleware para logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Función para obtener conexión a la base de datos
async function getConnection() {
  try {
    return await mysql.createConnection(dbConfig);
  } catch (error) {
    console.error('Error al conectar a la base de datos:', error);
    throw error;
  }
}

// Función para actualizar el valor de la UF
async function updateUFValue() {
  try {
    // Solo actualizar si no se ha actualizado en las últimas 12 horas
    const now = new Date();
    if (lastUfUpdate && (now - lastUfUpdate) < 12 * 60 * 60 * 1000) {
      return;
    }

    const response = await axios.get('https://mindicador.cl/api');
    
    if (response.data && response.data.uf && response.data.uf.valor) {
      ufValue = response.data.uf.valor;
      lastUfUpdate = now;
      console.log(`Valor UF actualizado: ${ufValue}`);
    } else {
      console.error('No se pudo obtener el valor de la UF');
    }
  } catch (error) {
    console.error('Error al actualizar el valor de la UF:', error.message);
  }
}

// Middleware de autenticación
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No se proporcionó token de autenticación' });
    }
    
    const token = authHeader.split(' ')[1];
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      
      // Verificar si el usuario existe en la base de datos
      const connection = await getConnection();
      const [users] = await connection.execute(
        'SELECT id, email, name, role, isActive FROM user WHERE id = ?',
        [decoded.id]
      );
      await connection.end();
      
      if (users.length === 0) {
        return res.status(401).json({ message: 'Usuario no encontrado' });
      }
      
      const user = users[0];
      
      if (!user.isActive) {
        return res.status(401).json({ message: 'Usuario desactivado' });
      }
      
      // Añadir información del usuario al request
      req.user = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isActive: user.isActive
      };
      
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expirado', code: 'token_expired' });
      } else {
        return res.status(401).json({ message: 'Token inválido', code: 'invalid_token' });
      }
    }
  } catch (error) {
    console.error('Error en middleware de autenticación:', error);
    return res.status(500).json({ message: 'Error en la autenticación' });
  }
};

// === RUTAS ===

// Ruta de diagnóstico
app.get('/', async (req, res) => {
  const info = {
    status: 'ok',
    message: 'API de ISanMartin funcionando',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    database: {
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      database: dbConfig.database
    }
  };
  
  res.json(info);
});

// Ruta para probar la conexión a la base de datos
app.get('/test-db', async (req, res) => {
  try {
    const connection = await getConnection();
    const [rows] = await connection.execute('SELECT 1 + 1 AS result');
    await connection.end();
    
    res.json({
      status: 'success',
      message: 'Conexión a la base de datos exitosa',
      result: rows[0].result
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error al conectar con la base de datos',
      error: error.message
    });
  }
});

// === RUTAS DE AUTENTICACIÓN ===

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validar entradas
    if (!email || !password) {
      return res.status(400).json({ message: 'Correo y contraseña son requeridos' });
    }
    
    // Buscar usuario
    const connection = await getConnection();
    const [users] = await connection.execute(
      'SELECT * FROM user WHERE email = ?',
      [email]
    );
    
    if (users.length === 0) {
      await connection.end();
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }
    
    const user = users[0];
    
    // Verificar si el usuario está activo
    if (!user.isActive) {
      await connection.end();
      return res.status(401).json({ message: 'Usuario desactivado' });
    }
    
    // Verificar contraseña
    const isValid = await bcrypt.compare(password, user.password);
    
    if (!isValid) {
      await connection.end();
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }
    
    // Generar token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '1d' }
    );
    
    await connection.end();
    
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// Verificar sesión actual
app.get('/api/auth/me', authMiddleware, async (req, res) => {
  try {
    res.json({
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      isActive: req.user.isActive
    });
  } catch (error) {
    console.error('Error al verificar sesión:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// === RUTAS DE PROPIEDADES ===

// Obtener todas las propiedades
app.get('/api/properties', async (req, res) => {
  try {
    // Construir consulta con filtros
    let query = `
      SELECT p.*, 
             CASE WHEN p.priceUF > 0 THEN p.priceUF * ? ELSE p.priceCLP END AS priceCLP
      FROM property p
      WHERE 1=1
    `;
    
    const queryParams = [ufValue];
    
    // Aplicar filtros si existen
    if (req.query.type) {
      query += ' AND p.type = ?';
      queryParams.push(req.query.type);
    }
    
    if (req.query.location) {
      query += ' AND (p.city LIKE ? OR p.district LIKE ?)';
      const locationParam = `%${req.query.location}%`;
      queryParams.push(locationParam, locationParam);
    }
    
    if (req.query.minPrice) {
      const minPrice = parseFloat(req.query.minPrice);
      if (!isNaN(minPrice)) {
        if (req.query.currency === 'CLP') {
          query += ' AND CASE WHEN p.priceUF > 0 THEN p.priceUF * ? ELSE p.priceCLP END >= ?';
          queryParams.push(ufValue, minPrice);
        } else {
          query += ' AND p.priceUF >= ?';
          queryParams.push(minPrice);
        }
      }
    }
    
    if (req.query.maxPrice) {
      const maxPrice = parseFloat(req.query.maxPrice);
      if (!isNaN(maxPrice)) {
        if (req.query.currency === 'CLP') {
          query += ' AND CASE WHEN p.priceUF > 0 THEN p.priceUF * ? ELSE p.priceCLP END <= ?';
          queryParams.push(ufValue, maxPrice);
        } else {
          query += ' AND p.priceUF <= ?';
          queryParams.push(maxPrice);
        }
      }
    }
    
    if (req.query.bedrooms) {
      query += ' AND p.bedrooms >= ?';
      queryParams.push(parseInt(req.query.bedrooms));
    }
    
    if (req.query.bathrooms) {
      query += ' AND p.bathrooms >= ?';
      queryParams.push(parseInt(req.query.bathrooms));
    }
    
    if (req.query.status) {
      query += ' AND p.status = ?';
      queryParams.push(req.query.status);
    }
    
    // Ordenar resultados
    query += ' ORDER BY p.createdAt DESC';
    
    // Ejecutar consulta
    const connection = await getConnection();
    const [properties] = await connection.execute(query, queryParams);
    await connection.end();
    
    // Formatear propiedades
    const formattedProperties = properties.map(p => ({
      id: p.id,
      title: p.title,
      description: p.description,
      type: p.type,
      status: p.status,
      address: p.address,
      city: p.city,
      district: p.district,
      zipCode: p.zipCode,
      country: p.country,
      priceUF: parseFloat(p.priceUF),
      priceCLP: parseInt(p.priceCLP),
      bedrooms: p.bedrooms,
      bathrooms: p.bathrooms,
      parkingSpaces: p.parkingSpaces,
      totalArea: parseFloat(p.totalArea),
      builtArea: parseFloat(p.builtArea),
      yearBuilt: p.yearBuilt,
      floor: p.floor,
      totalFloors: p.totalFloors,
      images: p.images ? JSON.parse(p.images) : [],
      features: p.features ? JSON.parse(p.features) : [],
      isHighlighted: Boolean(p.isHighlighted),
      createdAt: p.createdAt,
      updatedAt: p.updatedAt
    }));
    
    res.json(formattedProperties);
  } catch (error) {
    console.error('Error al obtener propiedades:', error);
    res.status(500).json({ message: 'Error al obtener las propiedades' });
  }
});

// Obtener una propiedad por ID
app.get('/api/properties/:id', async (req, res) => {
  try {
    const connection = await getConnection();
    const [properties] = await connection.execute(
      `SELECT p.*, 
              CASE WHEN p.priceUF > 0 THEN p.priceUF * ? ELSE p.priceCLP END AS priceCLP
       FROM property p 
       WHERE p.id = ?`,
      [ufValue, req.params.id]
    );
    await connection.end();
    
    if (properties.length === 0) {
      return res.status(404).json({ message: 'Propiedad no encontrada' });
    }
    
    const p = properties[0];
    
    // Formatear propiedad
    const formattedProperty = {
      id: p.id,
      title: p.title,
      description: p.description,
      type: p.type,
      status: p.status,
      address: p.address,
      city: p.city,
      district: p.district,
      zipCode: p.zipCode,
      country: p.country,
      priceUF: parseFloat(p.priceUF),
      priceCLP: parseInt(p.priceCLP),
      bedrooms: p.bedrooms,
      bathrooms: p.bathrooms,
      parkingSpaces: p.parkingSpaces,
      totalArea: parseFloat(p.totalArea),
      builtArea: parseFloat(p.builtArea),
      yearBuilt: p.yearBuilt,
      floor: p.floor,
      totalFloors: p.totalFloors,
      images: p.images ? JSON.parse(p.images) : [],
      features: p.features ? JSON.parse(p.features) : [],
      isHighlighted: Boolean(p.isHighlighted),
      createdAt: p.createdAt,
      updatedAt: p.updatedAt
    };
    
    res.json(formattedProperty);
  } catch (error) {
    console.error('Error al obtener propiedad:', error);
    res.status(500).json({ message: 'Error al obtener la propiedad' });
  }
});

// === RUTAS DE VALOR UF ===

// Obtener valor UF actual
app.get('/api/uf/current', async (req, res) => {
  try {
    // Actualizar el valor de la UF si es necesario
    await updateUFValue();
    
    res.json({
      valor: ufValue,
      fecha: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error al obtener valor UF:', error);
    res.status(500).json({ message: 'Error al obtener el valor de la UF' });
  }
});

// === RUTAS DE SIMULADOR DE CRÉDITO ===

// Simular crédito hipotecario
app.post('/api/mortgage/simulate', (req, res) => {
  try {
    const { amountUF, interestRate, years } = req.body;
    
    // Validar entradas
    if (!amountUF || !interestRate || !years) {
      return res.status(400).json({
        message: 'Se requieren monto en UF, tasa de interés y plazo en años'
      });
    }
    
    if (amountUF <= 0 || interestRate <= 0 || years <= 0) {
      return res.status(400).json({
        message: 'Los valores deben ser mayores a cero'
      });
    }
    
    // Calcular cuota mensual
    const monthlyRate = interestRate / 100 / 12;
    const totalPayments = years * 12;
    const monthlyPayment = amountUF * (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) / (Math.pow(1 + monthlyRate, totalPayments) - 1);
    
    // Calcular totales
    const totalAmount = monthlyPayment * totalPayments;
    const totalInterest = totalAmount - amountUF;
    
    // Calcular valores en CLP
    const monthlyCLP = Math.round(monthlyPayment * ufValue);
    const totalCLP = Math.round(totalAmount * ufValue);
    const totalInterestCLP = Math.round(totalInterest * ufValue);
    
    // Generar tabla de amortización (primeros 12 meses)
    const amortizationTable = [];
    let remainingBalance = amountUF;
    
    for (let month = 1; month <= Math.min(12, totalPayments); month++) {
      const interestPayment = remainingBalance * monthlyRate;
      const principalPayment = monthlyPayment - interestPayment;
      remainingBalance -= principalPayment;
      
      amortizationTable.push({
        month,
        payment: monthlyPayment,
        principal: principalPayment,
        interest: interestPayment,
        balance: remainingBalance
      });
    }
    
    const result = {
      input: {
        amountUF,
        interestRate,
        years,
        ufValue
      },
      result: {
        monthlyPaymentUF: monthlyPayment,
        totalAmountUF: totalAmount,
        totalInterestUF: totalInterest,
        monthlyPaymentCLP: monthlyCLP,
        totalAmountCLP: totalCLP,
        totalInterestCLP: totalInterestCLP
      },
      amortizationTable
    };
    
    return res.json(result);
  } catch (error) {
    console.error('Error en simulador hipotecario:', error);
    return res.status(500).json({
      message: 'Error al procesar la simulación'
    });
  }
});

// === INICIALIZACIÓN DEL SERVIDOR ===

// Actualizar el valor UF al iniciar
updateUFValue();

// Programar actualización diaria de la UF (una vez al día a las 09:00)
setInterval(updateUFValue, 24 * 60 * 60 * 1000);

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor ejecutándose en el puerto ${port}`);
}); 