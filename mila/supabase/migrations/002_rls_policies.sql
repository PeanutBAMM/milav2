-- Enable RLS on all tables
ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Helper function to check family membership
CREATE OR REPLACE FUNCTION is_family_member(family_id UUID, user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM family_members 
    WHERE family_members.family_id = $1 
    AND family_members.user_id = $2
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check family admin
CREATE OR REPLACE FUNCTION is_family_admin(family_id UUID, user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM family_members 
    WHERE family_members.family_id = $1 
    AND family_members.user_id = $2
    AND family_members.role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- FAMILIES POLICIES
-- Users can see families they belong to
CREATE POLICY "Users can view their families" ON families
  FOR SELECT USING (
    is_family_member(id, auth.uid())
  );

-- Users can create new families
CREATE POLICY "Users can create families" ON families
  FOR INSERT WITH CHECK (
    auth.uid() = created_by
  );

-- Only family admins can update family details
CREATE POLICY "Family admins can update families" ON families
  FOR UPDATE USING (
    is_family_admin(id, auth.uid())
  );

-- Only family admins can delete families
CREATE POLICY "Family admins can delete families" ON families
  FOR DELETE USING (
    is_family_admin(id, auth.uid())
  );

-- FAMILY MEMBERS POLICIES
-- Users can view members of their families
CREATE POLICY "Users can view family members" ON family_members
  FOR SELECT USING (
    is_family_member(family_id, auth.uid())
  );

-- Family admins can add members
CREATE POLICY "Family admins can add members" ON family_members
  FOR INSERT WITH CHECK (
    is_family_admin(family_id, auth.uid())
  );

-- Family admins can update members
CREATE POLICY "Family admins can update members" ON family_members
  FOR UPDATE USING (
    is_family_admin(family_id, auth.uid())
  );

-- Family admins can remove members
CREATE POLICY "Family admins can remove members" ON family_members
  FOR DELETE USING (
    is_family_admin(family_id, auth.uid())
  );

-- SHOPPING LISTS POLICIES
-- Users can view lists from their families
CREATE POLICY "Users can view family shopping lists" ON shopping_lists
  FOR SELECT USING (
    is_family_member(family_id, auth.uid())
  );

-- Family members can create lists
CREATE POLICY "Family members can create lists" ON shopping_lists
  FOR INSERT WITH CHECK (
    is_family_member(family_id, auth.uid())
  );

-- Family members can update lists
CREATE POLICY "Family members can update lists" ON shopping_lists
  FOR UPDATE USING (
    is_family_member(family_id, auth.uid())
  );

-- Family members can delete lists
CREATE POLICY "Family members can delete lists" ON shopping_lists
  FOR DELETE USING (
    is_family_member(family_id, auth.uid())
  );

-- LIST ITEMS POLICIES
-- Users can view items from their family's lists
CREATE POLICY "Users can view list items" ON list_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM shopping_lists
      WHERE shopping_lists.id = list_items.list_id
      AND is_family_member(shopping_lists.family_id, auth.uid())
    )
  );

-- Family members can add items
CREATE POLICY "Family members can add items" ON list_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM shopping_lists
      WHERE shopping_lists.id = list_items.list_id
      AND is_family_member(shopping_lists.family_id, auth.uid())
    )
  );

-- Family members can update items
CREATE POLICY "Family members can update items" ON list_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM shopping_lists
      WHERE shopping_lists.id = list_items.list_id
      AND is_family_member(shopping_lists.family_id, auth.uid())
    )
  );

-- Family members can delete items
CREATE POLICY "Family members can delete items" ON list_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM shopping_lists
      WHERE shopping_lists.id = list_items.list_id
      AND is_family_member(shopping_lists.family_id, auth.uid())
    )
  );

-- CATEGORIES POLICIES
-- Users can view their family's categories
CREATE POLICY "Users can view family categories" ON categories
  FOR SELECT USING (
    is_family_member(family_id, auth.uid())
  );

-- Family members can create categories
CREATE POLICY "Family members can create categories" ON categories
  FOR INSERT WITH CHECK (
    is_family_member(family_id, auth.uid())
  );

-- Family members can update categories
CREATE POLICY "Family members can update categories" ON categories
  FOR UPDATE USING (
    is_family_member(family_id, auth.uid())
  );

-- Family members can delete categories
CREATE POLICY "Family members can delete categories" ON categories
  FOR DELETE USING (
    is_family_member(family_id, auth.uid())
  );