-- Foodlist — schéma MySQL
-- Idempotent : sûr à rejouer sur une base existante

SET NAMES utf8mb4;
SET foreign_key_checks = 0;

-- -----------------------------------------------------------------------------
-- users
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id            INT          NOT NULL AUTO_INCREMENT,
  email         VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NULL,
  google_id     VARCHAR(255) NULL,
  name          VARCHAR(100) NOT NULL,
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email     (email),
  UNIQUE KEY uq_users_google_id (google_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- categories
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
  id         INT          NOT NULL AUTO_INCREMENT,
  name       VARCHAR(100) NOT NULL,
  is_default TINYINT(1)   NOT NULL DEFAULT 0,
  sort_order INT          NOT NULL DEFAULT 0,
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_categories_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- households
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS households (
  id           INT         NOT NULL AUTO_INCREMENT,
  name         VARCHAR(255) NOT NULL,
  created_by   INT         NOT NULL,
  invite_token VARCHAR(64) NOT NULL,
  created_at   DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_households_invite_token (invite_token),
  KEY idx_households_created_by (created_by),
  CONSTRAINT fk_households_created_by FOREIGN KEY (created_by) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- household_members
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS household_members (
  household_id INT                      NOT NULL,
  user_id      INT                      NOT NULL,
  role         ENUM('admin', 'member')  NOT NULL DEFAULT 'member',
  joined_at    DATETIME                 NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (household_id, user_id),
  KEY idx_household_members_user_id (user_id),
  CONSTRAINT fk_hm_household FOREIGN KEY (household_id) REFERENCES households (id),
  CONSTRAINT fk_hm_user      FOREIGN KEY (user_id)      REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- products
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
  id           INT           NOT NULL AUTO_INCREMENT,
  name         VARCHAR(255)  NOT NULL,
  category_id  INT           NOT NULL,
  ref_unit     VARCHAR(50)   NOT NULL,
  ref_quantity DECIMAL(10,3) NOT NULL DEFAULT 1.000,
  icon_ref     VARCHAR(500)  NULL,
  created_by   INT           NOT NULL,
  created_at   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_products_name (name),
  KEY idx_products_category_id (category_id),
  KEY idx_products_created_by  (created_by),
  CONSTRAINT fk_products_category   FOREIGN KEY (category_id) REFERENCES categories (id),
  CONSTRAINT fk_products_created_by FOREIGN KEY (created_by)  REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- stock
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS stock (
  id           INT                                                    NOT NULL AUTO_INCREMENT,
  product_id   INT                                                    NOT NULL,
  household_id INT                                                    NOT NULL,
  quantity     INT UNSIGNED                                           NOT NULL DEFAULT 0,
  unit         VARCHAR(20)                                            NOT NULL DEFAULT 'unité',
  status       ENUM('in_stock','low','out_of_stock','shopping_list')  NOT NULL DEFAULT 'in_stock',
  updated_by   INT                                                    NOT NULL,
  updated_at   DATETIME                                               NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_stock_product_household (product_id, household_id),
  KEY idx_stock_household_id (household_id),
  KEY idx_stock_updated_by   (updated_by),
  CONSTRAINT fk_stock_product    FOREIGN KEY (product_id)   REFERENCES products   (id),
  CONSTRAINT fk_stock_household  FOREIGN KEY (household_id) REFERENCES households (id),
  CONSTRAINT fk_stock_updated_by FOREIGN KEY (updated_by)   REFERENCES users      (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- recipes
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS recipes (
  id             INT           NOT NULL AUTO_INCREMENT,
  name           VARCHAR(255)  NOT NULL,
  description    TEXT          NULL,
  steps_markdown LONGTEXT      NULL,
  photo_url      VARCHAR(500)  NULL,
  base_servings  INT           NOT NULL DEFAULT 4,
  created_by     INT           NOT NULL,
  created_at     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_recipes_created_by (created_by),
  CONSTRAINT fk_recipes_created_by FOREIGN KEY (created_by) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- recipe_ingredients
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS recipe_ingredients (
  id         INT           NOT NULL AUTO_INCREMENT,
  recipe_id  INT           NOT NULL,
  product_id INT           NOT NULL,
  quantity   DECIMAL(10,3) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_ri_recipe_product (recipe_id, product_id),
  KEY idx_ri_product_id (product_id),
  CONSTRAINT fk_ri_recipe   FOREIGN KEY (recipe_id)  REFERENCES recipes  (id) ON DELETE CASCADE,
  CONSTRAINT fk_ri_product  FOREIGN KEY (product_id) REFERENCES products (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- shopping_recipes
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS shopping_recipes (
  id           INT          NOT NULL AUTO_INCREMENT,
  household_id INT          NOT NULL,
  recipe_id    INT          NOT NULL,
  multiplier   DECIMAL(5,2) NOT NULL DEFAULT 1.00,
  added_by     INT          NOT NULL,
  added_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_sr_household_id (household_id),
  KEY idx_sr_recipe_id    (recipe_id),
  KEY idx_sr_added_by     (added_by),
  CONSTRAINT fk_sr_household FOREIGN KEY (household_id) REFERENCES households (id),
  CONSTRAINT fk_sr_recipe    FOREIGN KEY (recipe_id)    REFERENCES recipes    (id),
  CONSTRAINT fk_sr_added_by  FOREIGN KEY (added_by)     REFERENCES users      (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- Catégories par défaut
-- -----------------------------------------------------------------------------
INSERT IGNORE INTO categories (name, is_default, sort_order) VALUES
  ('Fruits & Légumes',      1,  1),
  ('Viandes & Poissons',    1,  2),
  ('Produits laitiers',     1,  3),
  ('Épicerie / Conserves',  1,  4),
  ('Surgelés',              1,  5),
  ('Boissons',              1,  6),
  ('Apéro',                 1,  7),
  ('Boulangerie',           1,  8),
  ('Desserts / Pâtisserie', 1,  9),
  ('Condiments & Sauces',   1, 10),
  ('Hygiène / Entretien',   1, 11),
  ('Autre',                 1, 12);

SET foreign_key_checks = 1;
