ALTER TABLE schools 
ADD COLUMN headmaster_name VARCHAR(100),
ADD COLUMN vice_headmaster_name VARCHAR(100),
ADD COLUMN schedule_date DATE,
ADD COLUMN academic_year VARCHAR(20),
ADD COLUMN semester VARCHAR(20),
ADD COLUMN active_days JSONB DEFAULT '["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"]'::jsonb;
