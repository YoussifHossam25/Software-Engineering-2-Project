-- MySQL initialization script
-- Creates all service databases and grants privileges to the ecommerce user

CREATE DATABASE IF NOT EXISTS auth_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS user_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS product_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS order_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS inventory_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS delivery_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Grant all privileges on each database to the ecommerce user
GRANT ALL PRIVILEGES ON auth_db.*      TO 'ecommerce'@'%';
GRANT ALL PRIVILEGES ON user_db.*      TO 'ecommerce'@'%';
GRANT ALL PRIVILEGES ON product_db.*   TO 'ecommerce'@'%';
GRANT ALL PRIVILEGES ON order_db.*     TO 'ecommerce'@'%';
GRANT ALL PRIVILEGES ON inventory_db.* TO 'ecommerce'@'%';
GRANT ALL PRIVILEGES ON delivery_db.*  TO 'ecommerce'@'%';

FLUSH PRIVILEGES;
