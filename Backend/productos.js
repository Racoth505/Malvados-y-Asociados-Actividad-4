const db = require('./db');
const {
  validarNombreProducto,
  validarMedida,
  validarPrecio,
  validarStock,
  validarPerecedero,
  validarFechaCaducidad,
  validarCategoriaProducto
} = require('./validators');

// Crear producto
exports.crear = async (req, res, next) => {
  try {
    let { nombre, medida, precio, stock, perecedero, fecha_caducidad, categoria } = req.body;

    validarNombreProducto(nombre);
    validarMedida(medida);
    validarPrecio(precio);
    validarStock(stock);
    perecedero = validarPerecedero(perecedero);
    fecha_caducidad = validarFechaCaducidad(fecha_caducidad, perecedero);
    validarCategoriaProducto(categoria);

    await db.query(
      `INSERT INTO Productos
       (nombre, medida, precio, stock, perecedero, Fecha_caducidad, Categoria, usuario_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [nombre, medida, precio, stock, perecedero, fecha_caducidad, categoria, req.user.id]
    );

    res.json({ message: 'Producto agregado' });
  } catch (err) {
    next(err);
  }
};

// Listar productos
exports.listar = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      `SELECT
         id,
         nombre,
         medida,
         precio,
         stock,
         perecedero,
         Fecha_caducidad AS fecha_caducidad,
         Categoria AS categoria
       FROM Productos
       WHERE usuario_id = ?`,
      [req.user.id]
    );

    res.json(rows);
  } catch (err) {
    next(err);
  }
};

// Actualizar producto
exports.actualizar = async (req, res, next) => {
  try {
    const { id } = req.params;
    let { nombre, medida, precio, stock, perecedero, fecha_caducidad, categoria } = req.body;

    validarNombreProducto(nombre);
    validarMedida(medida);
    validarPrecio(precio);
    validarStock(stock);
    perecedero = validarPerecedero(perecedero);
    fecha_caducidad = validarFechaCaducidad(fecha_caducidad, perecedero);
    validarCategoriaProducto(categoria);

    const [result] = await db.query(
      `UPDATE Productos
       SET nombre = ?,
           medida = ?,
           precio = ?,
           stock = ?,
           perecedero = ?,
           Fecha_caducidad = ?,
           Categoria = ?
       WHERE id = ? AND usuario_id = ?`,
      [nombre, medida, precio, stock, perecedero, fecha_caducidad, categoria, id, req.user.id]
    );

    if (result.affectedRows === 0) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json({ message: 'Producto actualizado' });
  } catch (err) {
    next(err);
  }
};

// Eliminar producto
exports.eliminar = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [result] = await db.query(
      'DELETE FROM Productos WHERE id = ? AND usuario_id = ?',
      [id, req.user.id]
    );

    if (result.affectedRows === 0) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json({ message: 'Producto eliminado' });
  } catch (err) {
    next(err);
  }
};
