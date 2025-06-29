-- Create training_menus table
CREATE TABLE training_menus (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    scheduled_days TEXT NOT NULL, -- JSON array of days
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- Create training_records table
CREATE TABLE training_records (
    id TEXT PRIMARY KEY,
    menu_id TEXT NOT NULL,
    date TEXT NOT NULL, -- YYYY-MM-DD format
    comment TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (menu_id) REFERENCES training_menus(id) ON DELETE CASCADE
);

-- Create training_sets table
CREATE TABLE training_sets (
    id TEXT PRIMARY KEY,
    record_id TEXT NOT NULL,
    weight REAL NOT NULL,
    reps INTEGER NOT NULL,
    duration INTEGER, -- seconds
    rest_time INTEGER, -- seconds
    set_order INTEGER NOT NULL, -- order within the record
    FOREIGN KEY (record_id) REFERENCES training_records(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_training_records_menu_id ON training_records(menu_id);
CREATE INDEX idx_training_records_date ON training_records(date);
CREATE INDEX idx_training_sets_record_id ON training_sets(record_id);
CREATE INDEX idx_training_sets_order ON training_sets(record_id, set_order);