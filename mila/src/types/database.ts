export interface Database {
  public: {
    Tables: {
      families: {
        Row: {
          id: string;
          name: string;
          created_by: string | null;
          invite_code: string | null;
          created_at: string | null;
          updated_at?: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          created_by?: string | null;
          invite_code?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          created_by?: string | null;
          invite_code?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      family_members: {
        Row: {
          id: string;
          family_id: string | null;
          user_id: string | null;
          name: string;
          member_type: 'person' | 'pet' | null;
          pet_type: string | null;
          role: 'admin' | 'member' | null;
          avatar_url: string | null;
          color: string | null;
          created_at: string | null;
          updated_at?: string | null;
        };
        Insert: {
          id?: string;
          family_id?: string | null;
          user_id?: string | null;
          name: string;
          member_type?: 'person' | 'pet' | null;
          pet_type?: string | null;
          role?: 'admin' | 'member' | null;
          avatar_url?: string | null;
          color?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          family_id?: string | null;
          user_id?: string | null;
          name?: string;
          member_type?: 'person' | 'pet' | null;
          pet_type?: string | null;
          role?: 'admin' | 'member' | null;
          avatar_url?: string | null;
          color?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      shopping_lists: {
        Row: {
          id: string;
          family_id: string | null;
          name: string;
          is_active: boolean | null;
          is_template: boolean | null;
          created_by: string | null;
          created_at: string | null;
          completed_at: string | null;
          updated_at?: string | null;
        };
        Insert: {
          id?: string;
          family_id?: string | null;
          name: string;
          is_active?: boolean | null;
          is_template?: boolean | null;
          created_by?: string | null;
          created_at?: string | null;
          completed_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          family_id?: string | null;
          name?: string;
          is_active?: boolean | null;
          is_template?: boolean | null;
          created_by?: string | null;
          created_at?: string | null;
          completed_at?: string | null;
          updated_at?: string | null;
        };
      };
      list_items: {
        Row: {
          id: string;
          list_id: string | null;
          name: string;
          category: string | null;
          quantity: number | null;
          unit: string | null;
          is_checked: boolean | null;
          checked_by: string | null;
          checked_at: string | null;
          price: number | null;
          assigned_to: string | null;
          notes: string | null;
          position: number | null;
          created_by: string | null;
          created_at: string | null;
          updated_at?: string | null;
        };
        Insert: {
          id?: string;
          list_id?: string | null;
          name: string;
          category?: string | null;
          quantity?: number | null;
          unit?: string | null;
          is_checked?: boolean | null;
          checked_by?: string | null;
          checked_at?: string | null;
          price?: number | null;
          assigned_to?: string | null;
          notes?: string | null;
          position?: number | null;
          created_by?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          list_id?: string | null;
          name?: string;
          category?: string | null;
          quantity?: number | null;
          unit?: string | null;
          is_checked?: boolean | null;
          checked_by?: string | null;
          checked_at?: string | null;
          price?: number | null;
          assigned_to?: string | null;
          notes?: string | null;
          position?: number | null;
          created_by?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      categories: {
        Row: {
          id: string;
          family_id: string | null;
          name: string;
          icon: string | null;
          color: string | null;
          budget_limit: number | null;
          is_default: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Insert: {
          id?: string;
          family_id?: string | null;
          name: string;
          icon?: string | null;
          color?: string | null;
          budget_limit?: number | null;
          is_default?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          family_id?: string | null;
          name?: string;
          icon?: string | null;
          color?: string | null;
          budget_limit?: number | null;
          is_default?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      expenses: {
        Row: {
          id: string;
          family_id: string | null;
          list_id: string | null;
          amount: number;
          category: string;
          store_name: string | null;
          date: string;
          notes: string | null;
          receipt_url: string | null;
          created_by: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          family_id?: string | null;
          list_id?: string | null;
          amount: number;
          category: string;
          store_name?: string | null;
          date?: string;
          notes?: string | null;
          receipt_url?: string | null;
          created_by?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          family_id?: string | null;
          list_id?: string | null;
          amount?: number;
          category?: string;
          store_name?: string | null;
          date?: string;
          notes?: string | null;
          receipt_url?: string | null;
          created_by?: string | null;
          created_at?: string | null;
        };
      };
    };
  };
}

// Helper types
export type Family = Database['public']['Tables']['families']['Row'];
export type FamilyMember = Database['public']['Tables']['family_members']['Row'];
export type ShoppingList = Database['public']['Tables']['shopping_lists']['Row'];
export type ListItem = Database['public']['Tables']['list_items']['Row'];
export type Category = Database['public']['Tables']['categories']['Row'];
export type Expense = Database['public']['Tables']['expenses']['Row'];

// Input types
export type FamilyInsert = Database['public']['Tables']['families']['Insert'];
export type FamilyMemberInsert = Database['public']['Tables']['family_members']['Insert'];
export type ShoppingListInsert = Database['public']['Tables']['shopping_lists']['Insert'];
export type ListItemInsert = Database['public']['Tables']['list_items']['Insert'];
export type CategoryInsert = Database['public']['Tables']['categories']['Insert'];
export type ExpenseInsert = Database['public']['Tables']['expenses']['Insert'];

// Update types
export type FamilyUpdate = Database['public']['Tables']['families']['Update'];
export type FamilyMemberUpdate = Database['public']['Tables']['family_members']['Update'];
export type ShoppingListUpdate = Database['public']['Tables']['shopping_lists']['Update'];
export type ListItemUpdate = Database['public']['Tables']['list_items']['Update'];
export type CategoryUpdate = Database['public']['Tables']['categories']['Update'];
export type ExpenseUpdate = Database['public']['Tables']['expenses']['Update'];
