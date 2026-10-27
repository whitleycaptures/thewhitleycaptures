CREATE TABLE IF NOT EXISTS consent_daily (
  day TEXT PRIMARY KEY,
  accepted INTEGER NOT NULL DEFAULT 0 CHECK (accepted >= 0),
  declined INTEGER NOT NULL DEFAULT 0 CHECK (declined >= 0)
) STRICT;
