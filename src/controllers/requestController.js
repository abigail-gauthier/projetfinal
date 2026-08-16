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

// === BLOCK: GET DASHBOARD STATS — START === //
async function getDashboardStats(req, res) {
  try {
    const userId = req.user.userId;

    // StatusIds: 2=Envoyée, 7=En attente, 3=En attente de révision,
    // 4=En attente d'approbation, 5=En cours, 6=Question posée, 9=Complétée
    const enCoursIds = [3, 4, 5, 6];

    const [envoyeeCount, enAttenteCount, enCoursCount, completedCount] = await Promise.all([
      prisma.serviceRequests.count({
        where: { ClientId: userId, StatusId: 2 }
      }),
      prisma.serviceRequests.count({
        where: { ClientId: userId, StatusId: 7 }
      }),
      prisma.serviceRequests.count({
        where: { ClientId: userId, StatusId: { in: enCoursIds } }
      }),
      prisma.serviceRequests.count({
        where: { ClientId: userId, StatusId: 9 }
      }),
    ]);

    res.json({ envoyeeCount, enAttenteCount, enCoursCount, completedCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
// === BLOCK: GET DASHBOARD STATS — END === //


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


// === BLOCK: DELETE (SOFT) A REQUEST — START === //
async function deleteRequest(req, res) {
  try {
    const requestId = Number(req.params.id);

    // Confirm the request exists and belongs to this user
    const existing = await prisma.serviceRequests.findUnique({
      where: { RequestId: requestId }
    });

    if (!existing || existing.ClientId !== req.user.userId) {
      return res.status(404).json({ error: 'Demande introuvable.' });
    }

    // Look up the "Supprimée" status
    const deletedStatus = await prisma.requestStatuses.findUnique({
      where: { StatusName: 'Supprimée' }
    });
    if (!deletedStatus) {
      return res.status(500).json({ error: "Le statut « Supprimée » est introuvable." });
    }

    const updated = await prisma.serviceRequests.update({
      where: { RequestId: requestId },
      data: {
        StatusId: deletedStatus.StatusId,
        LastModifiedAt: new Date()
      },
      include: {
        RequestStatuses: true,
        ServiceTypes: true
      }
    });

    res.json({ message: 'Demande supprimée avec succès', request: updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
// === BLOCK: DELETE (SOFT) A REQUEST — END === //

// === BLOCK: RESTORE A DELETED REQUEST — START === //
async function restoreRequest(req, res) {
  try {
    const requestId = Number(req.params.id);

    const existing = await prisma.serviceRequests.findUnique({
      where: { RequestId: requestId }
    });

    if (!existing || existing.ClientId !== req.user.userId) {
      return res.status(404).json({ error: 'Demande introuvable.' });
    }

    // Confirm the request is actually deleted before restoring
    const currentStatus = await prisma.requestStatuses.findUnique({
      where: { StatusId: existing.StatusId }
    });
    if (currentStatus?.StatusName !== 'Supprimée') {
      return res.status(400).json({ error: 'Cette demande n\'est pas supprimée.' });
    }

    // Look up the "En attente" status
    const waitingStatus = await prisma.requestStatuses.findUnique({
      where: { StatusName: 'En attente' }
    });
    if (!waitingStatus) {
      return res.status(500).json({ error: "Le statut « En attente » est introuvable." });
    }

    const updated = await prisma.serviceRequests.update({
      where: { RequestId: requestId },
      data: {
        StatusId: waitingStatus.StatusId,
        LastModifiedAt: new Date()
      },
      include: {
        RequestStatuses: true,
        ServiceTypes: true
      }
    });

    res.json({ message: 'Demande restaurée avec succès', request: updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
// === BLOCK: RESTORE A DELETED REQUEST — END === //

// === BLOCK: SUBMIT A RESTORED REQUEST — START === //
async function submitRequest(req, res) {
  try {
    const requestId = Number(req.params.id);

    const existing = await prisma.serviceRequests.findUnique({
      where: { RequestId: requestId }
    });

    if (!existing || existing.ClientId !== req.user.userId) {
      return res.status(404).json({ error: 'Demande introuvable.' });
    }

    // Look up the "Envoyée" status
    const sentStatus = await prisma.requestStatuses.findUnique({
      where: { StatusName: 'Envoyée' }
    });
    if (!sentStatus) {
      return res.status(500).json({ error: "Le statut « Envoyée » est introuvable." });
    }

    const updated = await prisma.serviceRequests.update({
      where: { RequestId: requestId },
      data: {
        StatusId: sentStatus.StatusId,
        LastModifiedAt: new Date()
      },
      include: {
        RequestStatuses: true,
        ServiceTypes: true
      }
    });

    res.json({ message: 'Demande envoyée avec succès', request: updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
// === BLOCK: SUBMIT A RESTORED REQUEST — END === //

// === BLOCK: SAVE REQUEST AS DRAFT (En attente) — START === //
async function saveRequestAsDraft(req, res) {
  try {
    const { ServiceTypeId, Title, Description, Cost } = req.body;

    if (!ServiceTypeId || !Title) {
      return res.status(400).json({
        error: 'Le type de service et le titre sont obligatoires.'
      });
    }

    const waitingStatus = await prisma.requestStatuses.findUnique({
      where: { StatusName: 'En attente' }
    });
    if (!waitingStatus) {
      return res.status(500).json({ error: "Le statut « En attente » est introuvable." });
    }

    const requestCode = await generateRequestCode();

    const newRequest = await prisma.serviceRequests.create({
      data: {
        RequestCode: requestCode,
        ClientId: req.user.userId,
        ServiceTypeId: Number(ServiceTypeId),
        StatusId: waitingStatus.StatusId,
        Title,
        Description,
        Cost: Cost !== undefined && Cost !== null && Cost !== '' ? Number(Cost) : null,
        CreatedAt: new Date()
      }
    });

    res.status(201).json({ message: 'Demande sauvegardée avec succès', request: newRequest });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
// === BLOCK: SAVE REQUEST AS DRAFT — END === //


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

module.exports = { createRequest, getMyRequests, getServiceTypes, getRequestById, updateRequest, deleteRequest, restoreRequest, submitRequest, saveRequestAsDraft, getDashboardStats };

