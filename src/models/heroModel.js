import { supabase } from "../config/supabaseClient.js";

export const HeroModel = {
  async getAll() {
    const { data, error } = await supabase.from("heroes").select("*").order("name", { ascending: true });
    if (error) throw error;
    return data;
  },

  async getById(id) {
    const { data, error } = await supabase.from("heroes").select("*").eq("id", id).single();
    if (error) throw error;
    return data;
  },

  async create(payload) {
    const { data, error } = await supabase.from("heroes").insert([payload]).select().single();
    if (error) throw error;
    return data;
  },

  async update(id, payload) {
    const { data, error } = await supabase.from("heroes").update(payload).eq("id", id).select().single();
    if (error) throw error;
    return data;
  },

  async remove(id) {
    const { error } = await supabase.from("heroes").delete().eq("id", id);
    if (error) throw error;
    return { message: "Hero deleted successfully" };
  },
};