CREATE DATABASE Stocko;

USE Stocko;

CREATE TABLE Usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Productos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL,
  medida VARCHAR(30) NOT NULL,
  precio DECIMAL(10,2) NOT NULL,
  stock INT NOT NULL,
  perecedero BOOLEAN NOT NULL,
  Fecha_caducidad DATE,
  Categoria VARCHAR(50) NOT NULL,
  usuario_id INT,
  FOREIGN KEY (usuario_id) REFERENCES Usuarios(id)
)
