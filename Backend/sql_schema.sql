-- === Grundelemente ===
CREATE TABLE assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT CHECK (type IN ('ground', 'air')) NOT NULL,
    status TEXT,
    battery FLOAT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE asset_components (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
    type TEXT CHECK (type IN ('camera', 'sensor', 'actor')) NOT NULL,
    model TEXT,
    position TEXT,
    data JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- === Taskverwaltung ===
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    priority INTEGER CHECK (priority BETWEEN 1 AND 5),
    created_at TIMESTAMP DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

CREATE TABLE asset_task_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP DEFAULT NOW(),
    state TEXT CHECK (state IN ('assigned', 'in_progress', 'done')) DEFAULT 'assigned'
);

-- === Kartierung / Grid ===
CREATE TABLE environment_map (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    width INTEGER,
    height INTEGER,
    grid JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- === Bewegungsdaten / Log ===
CREATE TABLE asset_log (
    id SERIAL PRIMARY KEY,
    asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
    pos_x INTEGER,
    pos_y INTEGER,
    orientation TEXT,
    timestamp TIMESTAMP DEFAULT NOW(),
    source TEXT
);
