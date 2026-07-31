const prisma = require('../config/prisma');

// ─── Generate a unique request code like LX-2026-001 ────
async function generateRequestCode() {
  const year = new Date().getFullYear();
  const count = await prisma.serviceRequests.count();
  const sequence = String(count + 1).padStart(3, '0');
  return `LX-${year}-${sequence}`;
}

// ─── Create a new service request for the logged-in user ─
async function createRequest(req, res) {
  try {
    const { ServiceTypeId, Title, Description, Cost } = req.body;

    if (!ServiceTypeId || !Title || !Description) {
      return res.status(400).json({
        error: 'Les champs Type de service, Titre et Description sont obligatoires.'
      });
    }

    // Look up the "Envoyée" status
    const sentStatus = await prisma.requestStatuses.findUnique({
      where: { StatusName: 'Envoyée' }
    });
    if (!sentStatus) {
      return res.status(500).json({ error: "Le statut « Envoyée » est introuvable." });
    }

    const requestCode = await generateRequestCode();

    const newRequest = await prisma.serviceRequests.create({
      data: {
        RequestCode: requestCode,
        ClientId: req.user.userId,
        ServiceTypeId: Number(ServiceTypeId),
        StatusId: sentStatus.StatusId,
        Title,
        Description,
        Cost: Cost !== undefined && Cost !== null && Cost !== '' ? Number(Cost) : null,
        CreatedAt: new Date()
      }
    });

    res.status(201).json({ message: 'Demande créée avec succès', request: newRequest });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// ─── Get all requests belonging to the logged-in user ───
async function getMyRequests(req, res) {
  try {
    const requests = await prisma.serviceRequests.findMany({
      where: { ClientId: req.user.userId },
      include: {
        RequestStatuses: true,
        ServiceTypes: true
      },
      orderBy: { CreatedAt: 'desc' }
    });

    res.json({ message: 'Demandes récupérées avec succès', requests });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// ─── Get a single request belonging to the logged-in user ─
async function getRequestById(req, res) {
  try {
    const requestId = Number(req.params.id);

    const request = await prisma.serviceRequests.findUnique({
      where: { RequestId: requestId },
      include: {
        RequestStatuses: true,
        ServiceTypes: true
      }
    });

    if (!request) {
      return res.status(404).json({ error: 'Demande introuvable.' });
    }

    // Make sure this request actually belongs to the logged-in user
    if (request.ClientId !== req.user.userId) {
      return res.status(404).json({ error: 'Demande introuvable.' });
    }

    res.json({ message: 'Demande récupérée avec succès', request });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}


// ─── Update a request belonging to the logged-in user ───
async function updateRequest(req, res) {
  try {
    const requestId = Number(req.params.id);
    const { ServiceTypeId, Title, Description, Cost } = req.body;

    if (!ServiceTypeId || !Title || !Description) {
      return res.status(400).json({
        error: 'Les champs Type de service, Titre et Description sont obligatoires.'
      });
    }

    // First confirm the request exists and belongs to this user
    const existing = await prisma.serviceRequests.findUnique({
      where: { RequestId: requestId }
    });

    if (!existing || existing.ClientId !== req.user.userId) {
      return res.status(404).json({ error: 'Demande introuvable.' });
    }

    const updated = await prisma.serviceRequests.update({
      where: { RequestId: requestId },
      data: {
        ServiceTypeId: Number(ServiceTypeId),
        Title,
        Description,
        Cost: Cost !== undefined && Cost !== null && Cost !== '' ? Number(Cost) : null,
        LastModifiedAt: new Date()
      },
      include: {
        RequestStatuses: true,
        ServiceTypes: true
      }
    });

    res.json({ message: 'Demande mise à jour avec succès', request: updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}


// ─── List available service types (for the dropdown) ────
async function getServiceTypes(req, res) {
  try {
    const serviceTypes = await prisma.serviceTypes.findMany({
      orderBy: { TypeName: 'asc' }
    });
    res.json({ message: 'Types de service récupérés avec succès', serviceTypes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = { createRequest, getMyRequests, getServiceTypes, getRequestById, updateRequest };