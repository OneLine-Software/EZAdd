-- Feature Requests Table
CREATE TABLE feature_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  email TEXT,
  status TEXT DEFAULT 'new',
  votes INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Feedback/Testimonials Table
CREATE TABLE feedback (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  email TEXT,
  message TEXT NOT NULL,
  rating INTEGER CHECK(rating >= 1 AND rating <= 5),
  approved BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- App Usage Stats (optional - anonymous analytics)
CREATE TABLE app_stats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_type TEXT NOT NULL,
  metadata TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for common queries
CREATE INDEX idx_feature_requests_status ON feature_requests(status);
CREATE INDEX idx_feedback_approved ON feedback(approved);
CREATE INDEX idx_app_stats_event_type ON app_stats(event_type);
