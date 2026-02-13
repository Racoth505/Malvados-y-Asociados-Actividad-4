jest.mock('../db', () => ({
  query: jest.fn()
}));

jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn()
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn()
}));

const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../auth');

function createRes() {
  return {
    json: jest.fn(),
    status: jest.fn().mockReturnThis()
  };
}

describe('auth.register', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('falla si faltan campos', async () => {
    const req = { body: { nombre: '', password: '' } };
    const res = createRes();
    const next = jest.fn();

    await auth.register(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next.mock.calls[0][0].message).toBe('Campos obligatorios');
  });

  test('falla si el usuario ya existe', async () => {
    db.query.mockResolvedValueOnce([[{ id: 1 }]]);

    const req = { body: { nombre: 'admin', password: '1234' } };
    const res = createRes();
    const next = jest.fn();

    await auth.register(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next.mock.calls[0][0].message).toBe('Usuario duplicado');
  });

  test('registra usuario correctamente', async () => {
    db.query
      .mockResolvedValueOnce([[]])
      .mockResolvedValueOnce([{ affectedRows: 1 }]);
    bcrypt.hash.mockResolvedValueOnce('hash-seguro');

    const req = { body: { nombre: 'nuevo', password: '1234' } };
    const res = createRes();
    const next = jest.fn();

    await auth.register(req, res, next);

    expect(bcrypt.hash).toHaveBeenCalledWith('1234', 10);
    expect(db.query).toHaveBeenNthCalledWith(
      2,
      'INSERT INTO Usuarios (nombre, password) VALUES (?, ?)',
      ['nuevo', 'hash-seguro']
    );
    expect(res.json).toHaveBeenCalledWith({ message: 'Usuario registrado' });
    expect(next).not.toHaveBeenCalled();
  });
});

describe('auth.login', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('falla si faltan datos', async () => {
    const req = { body: { nombre: '', password: '' } };
    const res = createRes();
    const next = jest.fn();

    await auth.login(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next.mock.calls[0][0].message).toBe('Datos incompletos');
  });

  test('falla con usuario inexistente', async () => {
    db.query.mockResolvedValueOnce([[]]);

    const req = { body: { nombre: 'nadie', password: '1234' } };
    const res = createRes();
    const next = jest.fn();

    await auth.login(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next.mock.calls[0][0].message).toBe('Credenciales inv\u00e1lidas');
  });

  test('falla con password incorrecta', async () => {
    db.query.mockResolvedValueOnce([[{ id: 2, password: 'hash-db' }]]);
    bcrypt.compare.mockResolvedValueOnce(false);

    const req = { body: { nombre: 'user', password: 'wrong' } };
    const res = createRes();
    const next = jest.fn();

    await auth.login(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next.mock.calls[0][0].message).toBe('Credenciales inv\u00e1lidas');
  });

  test('retorna token con credenciales correctas', async () => {
    db.query.mockResolvedValueOnce([[{ id: 2, password: 'hash-db' }]]);
    bcrypt.compare.mockResolvedValueOnce(true);
    jwt.sign.mockReturnValueOnce('token-mock');

    const req = { body: { nombre: 'user', password: 'ok' } };
    const res = createRes();
    const next = jest.fn();

    await auth.login(req, res, next);

    expect(jwt.sign).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({ token: 'token-mock' });
    expect(next).not.toHaveBeenCalled();
  });
});

