const express = require("express");
const router = express.Router();
const Lead = require("../server/models/Lead");

/**
 * GET /leads
 * Listar todos os leads
 */
router.get("/", async (req, res) => {
  try {
    const leads = await Lead.find().sort({ createdAt: -1 });
    res.status(200).json(leads);
  } catch (err) {
    console.error("Erro ao buscar leads:", err);
    res.status(500).json({ error: "Erro ao buscar leads" });
  }
});

/**
 * GET /leads/:id
 * Buscar lead por ID
 */
router.get("/:id", async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ error: "Lead não encontrado" });
    }
    res.status(200).json(lead);
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar lead" });
  }
});

/**
 * POST /leads
 * Criar novo lead
 */
router.post("/", async (req, res) => {
  try {
    const lead = await Lead.create(req.body);
    res.status(201).json(lead);
  } catch (err) {
    console.error("Erro ao criar lead:", err);
    res.status(400).json({ error: "Erro ao criar lead" });
  }
});

/**
 * PUT /leads/:id
 * Atualizar lead
 */
router.put("/:id", async (req, res) => {
  try {
    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!lead) {
      return res.status(404).json({ error: "Lead não encontrado" });
    }
    res.status(200).json(lead);
  } catch (err) {
    res.status(400).json({ error: "Erro ao atualizar lead" });
  }
});

/**
 * DELETE /leads/:id
 * Deletar lead
 */
router.delete("/:id", async (req, res) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);
    if (!lead) {
      return res.status(404).json({ error: "Lead não encontrado" });
    }
    res.status(200).json({ message: "Lead removido com sucesso" });
  } catch (err) {
    res.status(500).json({ error: "Erro ao deletar lead" });
  }
});

/**
 * GET /leads/phone/:phone
 * Buscar lead por telefone
 */
router.get("/phone/:phone", async (req, res) => {
  try {
    const lead = await Lead.findOne({ phone: req.params.phone });
    if (!lead) {
      return res.status(404).json({ error: "Lead não encontrado" });
    }
    res.status(200).json(lead);
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar lead" });
  }
});

/**
 * GET /leads/stats/count
 * Contagem total de leads
 */
router.get("/stats/count", async (req, res) => {
  try {
    const total = await Lead.countDocuments();
    res.status(200).json({ total });
  } catch (err) {
    res.status(500).json({ error: "Erro ao contar leads" });
  }
});

module.exports = router;
