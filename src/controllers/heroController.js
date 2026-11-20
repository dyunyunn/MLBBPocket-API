import { HeroModel } from "../models/heroModel.js";

export const HeroController = {
  async getAll(req, res) {
    try {
      const heroes = await HeroModel.getAll();
      res.json(heroes);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async getById(req, res) {
    try {
      const hero = await HeroModel.getById(req.params.id);
      res.json(hero);
    } catch (err) {
      res.status(404).json({ error: err.message });
    }
  },

  async create(req, res) {
    try {
      const hero = await HeroModel.create(req.body);
      res.status(201).json(hero);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  async update(req, res) {
    try {
      const hero = await HeroModel.update(req.params.id, req.body);
      res.json(hero);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  async remove(req, res) {
    try {
      const result = await HeroModel.remove(req.params.id);
      res.json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
};