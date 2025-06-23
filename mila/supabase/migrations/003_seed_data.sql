-- Default categories that will be copied for each new family
CREATE TABLE IF NOT EXISTS default_categories (
  name VARCHAR(50) PRIMARY KEY,
  icon VARCHAR(50),
  color VARCHAR(7)
);

INSERT INTO default_categories (name, icon, color) VALUES
  ('Groente & Fruit', 'nutrition', '#34D186'),
  ('Vlees & Vis', 'restaurant', '#FF6B6B'),
  ('Zuivel', 'water', '#4ECDC4'),
  ('Brood & Gebak', 'cafe', '#FFE66D'),
  ('Dranken', 'wine', '#95E1D3'),
  ('Schoonmaak', 'clean-hands', '#A8E6CF'),
  ('Verzorging', 'fitness', '#C7CEEA'),
  ('Huisdieren', 'paw', '#FFDAB9'),
  ('Baby', 'child', '#FFB6C1'),
  ('Overig', 'apps', '#D3D3D3');

-- Function to create default categories for new family
CREATE OR REPLACE FUNCTION create_default_categories_for_family()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO categories (family_id, name, icon, color, is_default)
  SELECT NEW.id, name, icon, color, true
  FROM default_categories;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically create categories when family is created
CREATE TRIGGER create_family_default_categories
  AFTER INSERT ON families
  FOR EACH ROW
  EXECUTE FUNCTION create_default_categories_for_family();

-- Function to automatically add creator as admin member
CREATE OR REPLACE FUNCTION add_creator_as_admin()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO family_members (family_id, user_id, name, role, member_type)
  SELECT NEW.id, NEW.created_by, 
    COALESCE(auth.users.raw_user_meta_data->>'full_name', auth.users.email),
    'admin', 'person'
  FROM auth.users
  WHERE auth.users.id = NEW.created_by;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to add family creator as admin
CREATE TRIGGER add_family_creator_as_admin
  AFTER INSERT ON families
  FOR EACH ROW
  EXECUTE FUNCTION add_creator_as_admin();

-- Function to auto-generate invite code
CREATE OR REPLACE FUNCTION set_invite_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.invite_code IS NULL THEN
    NEW.invite_code := generate_invite_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to set invite code
CREATE TRIGGER set_family_invite_code
  BEFORE INSERT ON families
  FOR EACH ROW
  EXECUTE FUNCTION set_invite_code();