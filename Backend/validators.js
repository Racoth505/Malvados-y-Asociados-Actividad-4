exports.validarNombreProducto = (v) => {
  if (!v || v.length > 50) throw new Error('Nombre inválido');
};

exports.validarMedida = (v) => {
  if (!v || v.length > 30) throw new Error('Medida inválida');
};

exports.validarPrecio = (v) => {
  if (v === undefined || v === null || isNaN(v) || Number(v) <= 0)
    throw new Error('Precio inválido');
};

exports.validarStock = (v) => {
  if (v === undefined || v === null || isNaN(v) || !Number.isInteger(Number(v)) || Number(v) < 0)
    throw new Error('Stock inválido');
};

exports.validarPerecedero = (v) => {
  if (v === true || v === 'true' || v === 1 || v === '1') return true;
  if (v === false || v === 'false' || v === 0 || v === '0') return false;
  throw new Error('Perecedero inválido');
};

exports.validarFechaCaducidad = (f, perecedero) => {
  if (!perecedero) return null;
  if (!f) throw new Error('Fecha de caducidad requerida para perecederos');
  const d = new Date(f);
  if (isNaN(d.getTime())) throw new Error('Fecha de caducidad inválida');
  return f;
};

exports.validarCategoriaProducto = (v) => {
  if (!v || v.length > 50) throw new Error('Categoría inválida');
};

exports.validarFechaCaducidad = (f, perecedero) => {
  if (!perecedero) return null;
  if (!f) throw new Error('Fecha de caducidad requerida para perecederos');

  const d = new Date(f);
  if (isNaN(d.getTime())) throw new Error('Fecha de caducidad inválida');

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0); // normaliza a inicio del día

  if (d < hoy) throw new Error('Fecha de caducidad no puede ser anterior a hoy');

  return f;
};
