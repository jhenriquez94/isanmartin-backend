// Servidor Express simple para diagnóstico
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

// Crear la aplicación Express
const app = express();
const port = process.env.PORT || 10000;

// Middleware
app.use(cors());
app.use(express.json());

// Mostrar información del entorno
console.log('Variables de entorno:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_NAME:', process.env.DB_NAME);

// Ruta de inicio
app.get('/', async (req, res) => {
  const info = {
    status: 'ok',
    message: 'Servidor de diagnóstico funcionando',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    database: {
      host: process.env.DB_HOST || '193.203.175.234',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'usuario_no_configurado',
      database: process.env.DB_NAME || 'db_no_configurada'
    }
  };
  
  res.json(info);
});

// Ruta para probar la conexión a la base de datos
app.get('/test-db', async (req, res) => {
  try {
    // Intentar conectar a la base de datos
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || '193.203.175.234',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });
    
    // Ejecutar una consulta simple
    const [rows] = await connection.execute('SELECT 1 + 1 AS result');
    
    // Cerrar la conexión
    await connection.end();
    
    // Responder con éxito
    res.json({
      status: 'success',
      message: 'Conexión a la base de datos exitosa',
      result: rows[0].result
    });
  } catch (error) {
    // Responder con error
    res.status(500).json({
      status: 'error',
      message: 'Error al conectar con la base de datos',
      error: error.message
    });
  }
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor de diagnóstico ejecutándose en el puerto ${port}`);
}); 