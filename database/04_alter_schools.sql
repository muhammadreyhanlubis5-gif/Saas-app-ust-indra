ALTER TABLE schools
ADD COLUMN payment_method VARCHAR(100),
ADD COLUMN payment_amount DECIMAL(12, 2) DEFAULT 0,
ADD COLUMN address TEXT,
ADD COLUMN contact_number VARCHAR(50);
