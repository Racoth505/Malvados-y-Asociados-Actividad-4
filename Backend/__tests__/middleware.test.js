const jwt = require('jsonwebtoken');
const { auth, errorHandler, SECRET } = require('../middleware');

describe('middleware.auth', () => {
  test('responde 401 cuando no hay token', () => {
    const req = { headers: {} };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    auth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'No autorizado' });
    expect(next).not.toHaveBeenCalled();
  });

  test('responde 401 cuando el token es invalido', () => {
    const req = { headers: { authorization: 'Bearer token-invalido' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    auth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Token inv\u00e1lido' });
    expect(next).not.toHaveBeenCalled();
  });

  test('permite continuar con token valido', () => {
    const token = jwt.sign({ id: 123 }, SECRET, { expiresIn: '1d' });
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    auth(req, res, next);

    expect(req.user).toBeDefined();
    expect(req.user.id).toBe(123);
    expect(next).toHaveBeenCalledTimes(1);
  });
});

describe('middleware.errorHandler', () => {
  test('responde 400 con mensaje del error', () => {
    const err = new Error('Fallo de validacion');
    const req = {};
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Fallo de validacion' });
  });
});

