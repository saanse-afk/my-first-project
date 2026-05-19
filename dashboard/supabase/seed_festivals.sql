-- ============================================================
-- Hindu Festival Calendar Seed Data (2025-2027)
-- Run after schema.sql
-- ============================================================

-- Seed default organization for "Ancient India by SAANSE"
INSERT INTO organizations (name, slug) VALUES
  ('Ancient India by SAANSE', 'ancient-india-saanse')
ON CONFLICT (slug) DO NOTHING;

-- 2025 Festivals
INSERT INTO festivals (name, date, deity, related_topics, content_suggestions, days_before_to_post) VALUES
('Makar Sankranti', '2025-01-14', 'Surya', ARRAY['Surya', 'Sun worship', 'Harvest'], ARRAY['Surya Dev stories', 'Regional traditions across India', 'Uttarayan meaning'], 14),
('Vasant Panchami', '2025-02-02', 'Saraswati', ARRAY['Saraswati', 'Knowledge', 'Arts', 'Education'], ARRAY['Saraswati origin story', 'Vidya symbolism', 'Goddess of learning'], 14),
('Maha Shivratri', '2025-02-26', 'Shiva', ARRAY['Shiva', 'Tandav', 'Linga', 'Marriage'], ARRAY['Shiva-Parvati love story', 'Cosmic dance of Tandav', 'Night vigil meaning'], 14),
('Holi', '2025-03-14', 'Krishna', ARRAY['Krishna/Vishnu', 'Prahlada', 'Holika'], ARRAY['Color symbolism in mythology', 'Prahlada and Holika story', 'Radha-Krishna Holi'], 14),
('Chaitra Navratri Start', '2025-03-30', 'Durga', ARRAY['Devi/Shakti', 'Navdurga'], ARRAY['9 forms of Durga series', 'Shakti rising', 'Navratri significance'], 14),
('Ram Navami', '2025-04-06', 'Rama', ARRAY['Ramayana', 'Rama'], ARRAY['Ram birth story', 'Ayodhya significance', 'Dharma of Ram'], 7),
('Hanuman Jayanti', '2025-04-12', 'Hanuman', ARRAY['Ramayana', 'Hanuman', 'Devotion'], ARRAY['Sanjeevani story', 'Hanuman childhood', 'Devotion without ego'], 7),
('Akshaya Tritiya', '2025-04-30', 'Vishnu', ARRAY['Krishna/Vishnu', 'Lakshmi', 'Prosperity'], ARRAY['Sudama-Krishna friendship', 'Meaning of inexhaustible', 'Charity stories'], 14),
('Guru Purnima', '2025-07-10', 'Vyasa', ARRAY['Mahabharata', 'Vedas/Philosophy', 'Guru'], ARRAY['Vyasa role in Mahabharata', 'Guru tradition in India', 'Importance of teacher'], 7),
('Raksha Bandhan', '2025-08-09', 'Krishna', ARRAY['Krishna/Vishnu', 'Protection', 'Bonds'], ARRAY['Krishna-Draupadi thread story', 'Meaning of Raksha', 'Sibling bonds in mythology'], 7),
('Krishna Janmashtami', '2025-08-16', 'Krishna', ARRAY['Krishna/Vishnu', 'Childhood', 'Birth'], ARRAY['Butter thief stories', 'Mathura escape drama', 'Krishna prophecy'], 14),
('Ganesh Chaturthi', '2025-08-27', 'Ganesha', ARRAY['Ganesha', 'Wisdom', 'Beginnings'], ARRAY['Ganesha head story', 'Vyasa-Ganesha Mahabharata', 'Modak symbolism'], 14),
('Navratri Start', '2025-10-02', 'Durga', ARRAY['Devi/Shakti', 'Mahishasura', 'Nine nights'], ARRAY['Nine nights mythology', 'Durga vs Mahishasura', '9 forms in 9 posts'], 14),
('Dussehra', '2025-10-02', 'Rama', ARRAY['Ramayana', 'Rama', 'Victory'], ARRAY['Lanka battle finale', 'Ravana symbolism', 'Victory of dharma'], 7),
('Diwali', '2025-10-20', 'Rama', ARRAY['Ramayana', 'Lakshmi', 'Light'], ARRAY['Ram homecoming story', 'Lakshmi wealth wisdom', 'Light over darkness'], 14),
('Kartik Purnima', '2025-11-15', 'Shiva', ARRAY['Shiva', 'Vishnu', 'Tripurasura'], ARRAY['Tripura destruction story', 'Dev Diwali significance', 'Kartik month stories'], 7),

-- 2026 Festivals
('Makar Sankranti', '2026-01-14', 'Surya', ARRAY['Surya', 'Sun worship', 'Harvest'], ARRAY['Surya Dev stories', 'Regional traditions across India', 'Uttarayan meaning'], 14),
('Vasant Panchami', '2026-02-02', 'Saraswati', ARRAY['Saraswati', 'Knowledge', 'Arts', 'Education'], ARRAY['Saraswati origin story', 'Vidya symbolism', 'Goddess of learning'], 14),
('Maha Shivratri', '2026-02-15', 'Shiva', ARRAY['Shiva', 'Tandav', 'Linga', 'Marriage'], ARRAY['Shiva-Parvati love story', 'Cosmic dance of Tandav', 'Night vigil meaning'], 14),
('Holi', '2026-03-03', 'Krishna', ARRAY['Krishna/Vishnu', 'Prahlada', 'Holika'], ARRAY['Color symbolism in mythology', 'Prahlada and Holika story', 'Radha-Krishna Holi'], 14),
('Chaitra Navratri Start', '2026-03-18', 'Durga', ARRAY['Devi/Shakti', 'Navdurga'], ARRAY['9 forms of Durga series', 'Shakti rising', 'Navratri significance'], 14),
('Ram Navami', '2026-04-06', 'Rama', ARRAY['Ramayana', 'Rama'], ARRAY['Ram birth story', 'Ayodhya significance', 'Dharma of Ram'], 7),
('Hanuman Jayanti', '2026-04-15', 'Hanuman', ARRAY['Ramayana', 'Hanuman', 'Devotion'], ARRAY['Sanjeevani story', 'Hanuman childhood', 'Devotion without ego'], 7),
('Akshaya Tritiya', '2026-05-06', 'Vishnu', ARRAY['Krishna/Vishnu', 'Lakshmi', 'Prosperity'], ARRAY['Sudama-Krishna friendship', 'Meaning of inexhaustible', 'Charity stories'], 14),
('Guru Purnima', '2026-07-13', 'Vyasa', ARRAY['Mahabharata', 'Vedas/Philosophy', 'Guru'], ARRAY['Vyasa role in Mahabharata', 'Guru tradition in India', 'Importance of teacher'], 7),
('Raksha Bandhan', '2026-08-19', 'Krishna', ARRAY['Krishna/Vishnu', 'Protection', 'Bonds'], ARRAY['Krishna-Draupadi thread story', 'Meaning of Raksha', 'Sibling bonds in mythology'], 7),
('Krishna Janmashtami', '2026-08-27', 'Krishna', ARRAY['Krishna/Vishnu', 'Childhood', 'Birth'], ARRAY['Butter thief stories', 'Mathura escape drama', 'Krishna prophecy'], 14),
('Ganesh Chaturthi', '2026-09-05', 'Ganesha', ARRAY['Ganesha', 'Wisdom', 'Beginnings'], ARRAY['Ganesha head story', 'Vyasa-Ganesha Mahabharata', 'Modak symbolism'], 14),
('Navratri Start', '2026-09-22', 'Durga', ARRAY['Devi/Shakti', 'Mahishasura', 'Nine nights'], ARRAY['Nine nights mythology', 'Durga vs Mahishasura', '9 forms in 9 posts'], 14),
('Dussehra', '2026-10-02', 'Rama', ARRAY['Ramayana', 'Rama', 'Victory'], ARRAY['Lanka battle finale', 'Ravana symbolism', 'Victory of dharma'], 7),
('Diwali', '2026-10-21', 'Rama', ARRAY['Ramayana', 'Lakshmi', 'Light'], ARRAY['Ram homecoming story', 'Lakshmi wealth wisdom', 'Light over darkness'], 14),
('Kartik Purnima', '2026-11-19', 'Shiva', ARRAY['Shiva', 'Vishnu', 'Tripurasura'], ARRAY['Tripura destruction story', 'Dev Diwali significance', 'Kartik month stories'], 7),

-- 2027 Festivals
('Makar Sankranti', '2027-01-14', 'Surya', ARRAY['Surya', 'Sun worship', 'Harvest'], ARRAY['Surya Dev stories', 'Regional traditions across India', 'Uttarayan meaning'], 14),
('Vasant Panchami', '2027-01-22', 'Saraswati', ARRAY['Saraswati', 'Knowledge', 'Arts', 'Education'], ARRAY['Saraswati origin story', 'Vidya symbolism', 'Goddess of learning'], 14),
('Maha Shivratri', '2027-03-06', 'Shiva', ARRAY['Shiva', 'Tandav', 'Linga', 'Marriage'], ARRAY['Shiva-Parvati love story', 'Cosmic dance of Tandav', 'Night vigil meaning'], 14),
('Holi', '2027-03-22', 'Krishna', ARRAY['Krishna/Vishnu', 'Prahlada', 'Holika'], ARRAY['Color symbolism in mythology', 'Prahlada and Holika story', 'Radha-Krishna Holi'], 14),
('Krishna Janmashtami', '2027-08-16', 'Krishna', ARRAY['Krishna/Vishnu', 'Childhood', 'Birth'], ARRAY['Butter thief stories', 'Mathura escape drama', 'Krishna prophecy'], 14),
('Ganesh Chaturthi', '2027-08-25', 'Ganesha', ARRAY['Ganesha', 'Wisdom', 'Beginnings'], ARRAY['Ganesha head story', 'Vyasa-Ganesha Mahabharata', 'Modak symbolism'], 14),
('Diwali', '2027-11-09', 'Rama', ARRAY['Ramayana', 'Lakshmi', 'Light'], ARRAY['Ram homecoming story', 'Lakshmi wealth wisdom', 'Light over darkness'], 14)
ON CONFLICT DO NOTHING;
