-- Crear tipos enum para métodos de pago y manicuristas
CREATE TYPE payment_method AS ENUM ('efectivo', 'tarjeta', 'transferencia', 'bizum');
CREATE TYPE manicurist AS ENUM ('Maria', 'Carmen', 'Sofia', 'Ana');

-- Actualizar las tablas existentes para usar los nuevos tipos
ALTER TABLE income_records 
ALTER COLUMN payment_method TYPE payment_method USING payment_method::text::payment_method,
ALTER COLUMN manicurist TYPE manicurist USING manicurist::text::manicurist;

ALTER TABLE expense_records 
ALTER COLUMN payment_method TYPE payment_method USING payment_method::text::payment_method;