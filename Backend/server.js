const express = require('express');
const app = express();
const cors = require('cors');
require('./env');

app.use(cors());
app.use(express.json());

const auth = require('./auth');
const productos = require('./productos');
const { auth: authMiddleware, errorHandler } = require('./middleware');

app.get('/', (req, res) => {
  res.send('API STOCKO funcionando');
});


// Auth
app.post('/api/auth/register', auth.register);
app.post('/api/auth/login', auth.login);

// Productos
app.post('/api/productos', authMiddleware, productos.crear);
app.get('/api/productos', authMiddleware, productos.listar);
app.delete('/api/productos/:id', authMiddleware, productos.eliminar);
app.put('/api/productos/:id', authMiddleware, productos.actualizar);

// Errores
app.use(errorHandler);

const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}. http://localhost:${PORT}/`);
});
