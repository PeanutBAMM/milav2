import { supabase } from './supabase';
import type { FamilyInsert, FamilyMember, FamilyMemberInsert } from '../types/database';

export const familyService = {
  // Create a new family
  async createFamily(data: FamilyInsert) {
    const { data: family, error } = await supabase.from('families').insert(data).select().single();

    if (error) throw error;
    return family;
  },

  // Get user's families
  async getUserFamilies() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: families, error } = await supabase
      .from('families')
      .select(
        `
        *,
        family_members!inner(
          user_id
        )
      `,
      )
      .eq('family_members.user_id', user.id);

    if (error) throw error;
    return families;
  },

  // Get family by ID with members
  async getFamilyById(familyId: string) {
    const { data: family, error } = await supabase
      .from('families')
      .select(
        `
        *,
        family_members(*)
      `,
      )
      .eq('id', familyId)
      .single();

    if (error) throw error;
    return family;
  },

  // Join family by invite code
  async joinFamilyByCode(inviteCode: string) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Find family by invite code
    const { data: family, error: familyError } = await supabase
      .from('families')
      .select('id')
      .eq('invite_code', inviteCode.toUpperCase())
      .single();

    if (familyError) throw new Error('Invalid invite code');

    // Check if already member
    const { data: existingMember } = await supabase
      .from('family_members')
      .select('id')
      .eq('family_id', family.id)
      .eq('user_id', user.id)
      .single();

    if (existingMember) {
      throw new Error('Already a member of this family');
    }

    // Add user as member
    const memberData: FamilyMemberInsert = {
      family_id: family.id,
      user_id: user.id,
      name: user.user_metadata?.full_name || user.email || 'Unknown',
      member_type: 'person',
      role: 'member',
    };

    const { data: member, error: memberError } = await supabase
      .from('family_members')
      .insert(memberData)
      .select()
      .single();

    if (memberError) throw memberError;
    return { family, member };
  },

  // Add family member (including pets)
  async addFamilyMember(data: FamilyMemberInsert) {
    const { data: member, error } = await supabase
      .from('family_members')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return member;
  },

  // Update family member
  async updateFamilyMember(memberId: string, updates: Partial<FamilyMember>) {
    const { data: member, error } = await supabase
      .from('family_members')
      .update(updates)
      .eq('id', memberId)
      .select()
      .single();

    if (error) throw error;
    return member;
  },

  // Remove family member
  async removeFamilyMember(memberId: string) {
    const { error } = await supabase.from('family_members').delete().eq('id', memberId);

    if (error) throw error;
  },

  // Get family categories
  async getFamilyCategories(familyId: string) {
    const { data: categories, error } = await supabase
      .from('categories')
      .select('*')
      .eq('family_id', familyId)
      .order('name');

    if (error) throw error;
    return categories;
  },
};
