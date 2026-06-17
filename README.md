\# Lexy Executive Service

Plateforme web de gestion de services de conciergerie. Les clients peuvent soumettre des demandes (voyages, réservations, recherches, tâches administratives, etc.), suivre leur progression et consulter les livrables. L'administrateur traite les demandes, téléverse les livrables et gère les utilisateurs.

Ce projet est réalisé dans le cadre du projet de fin d'études.

\## Stack technique

- Frontend : React (JavaScript)
- Backend : Node.js + Express
- ORM : Prisma v6
- Base de données : SQL Server (local) / Azure SQL Database (hébergement)
- Authentification : JWT (JSON Web Tokens)
- Intelligence artificielle : API Claude (Anthropic)

\## Structure du projet

ProjetFinal/
├── prisma/schema.prisma       (Modèle de base de données — 17 tables)
├── node_modules/              (Dépendances — ne pas modifier)
├── server.js                  (Point d'entrée du serveur Express)
├── .env                       (Variables d'environnement)
├── package.json               (Liste des dépendances)
└── README.md                  (Ce fichier)

\## Installation

Prérequis : Node.js (LTS), SQL Server Express, SSMS.

1. Cloner le dépôt et entrer dans le dossier.
2. Lancer `npm install`.
3. Créer un fichier `.env` à la racine avec la ligne suivante :
   DATABASE_URL="sqlserver://localhost:1433;database=LexyExecutiveService;trustServerCertificate=true;integratedSecurity=true"
4. Lancer `npx prisma generate`.
5. Lancer `node server.js`. Le serveur démarre sur http://localhost:3000.

\## Routes API disponibles

- GET / — Vérifie que l'API fonctionne
- GET /api/test — Teste la connexion à la base de données
- POST /api/register — Crée un nouveau compte client
- POST /api/login — Connecte un utilisateur et retourne un JWT

\## Base de données

Le modèle compte 17 tables : 6 tables de référence, 10 tables de données et 1 table d'association. La documentation complète se trouve dans Lexy_Database_Schema_Reference.pdf.

\## Auteur

Abigail Gauthier — Projet de fin d'études encadré par Raoul Elouga.
