CREATE TABLE Productos (
  Id INT IDENTITY(1,1) PRIMARY KEY,
  Nombre NVARCHAR(100),
  Precio DECIMAL(10,2),
  CreadoEn DATETIME DEFAULT GETDATE()
);
INSERT INTO Productos (Nombre, Precio) VALUES ('Camiseta', 12.50), ('Gorra', 8.00);

-- mi scrip para login id, usuario, contra, rol
-- database/users_schema.sql
CREATE TABLE Users (
  Id INT IDENTITY(1,1) PRIMARY KEY,
  Username NVARCHAR(100) NOT NULL UNIQUE,
  PasswordHash NVARCHAR(255) NOT NULL,
  Role NVARCHAR(50) NOT NULL DEFAULT 'usuario',
  CreatedAt DATETIME DEFAULT GETDATE()
);