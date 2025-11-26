CREATE TABLE Productos (
  Id INT IDENTITY(1,1) PRIMARY KEY,
  Nombre NVARCHAR(100),
  Precio DECIMAL(10,2),
  CreadoEn DATETIME DEFAULT GETDATE()
);
INSERT INTO Productos (Nombre, Precio) VALUES ('Camiseta', 12.50), ('Gorra', 8.00);
