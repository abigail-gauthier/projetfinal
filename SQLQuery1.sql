CREATE TABLE Roles (
    RoleId    INT             IDENTITY(1,1)  PRIMARY KEY,
    RoleName  NVARCHAR(50)    NOT NULL       UNIQUE
);

CREATE TABLE ServiceTypes (
    ServiceTypeId  INT             IDENTITY(1,1)  PRIMARY KEY,
    TypeName       NVARCHAR(100)   NOT NULL       UNIQUE
);

CREATE TABLE RequestStatuses (
    StatusId    INT             IDENTITY(1,1)  PRIMARY KEY,
    StatusName  NVARCHAR(50)    NOT NULL       UNIQUE
);

CREATE TABLE DocumentTypes (
    DocumentTypeId  INT             IDENTITY(1,1)  PRIMARY KEY,
    TypeName        NVARCHAR(100)   NOT NULL       UNIQUE
);

CREATE TABLE ActionTypes (
    ActionTypeId  INT            IDENTITY(1,1)  PRIMARY KEY,
    ActionName    NVARCHAR(100)  NOT NULL       UNIQUE
);

CREATE TABLE ContractTypes (
    ContractTypeId  INT            IDENTITY(1,1)  PRIMARY KEY,
    TypeName        NVARCHAR(100)  NOT NULL       UNIQUE
);

CREATE TABLE Users (
    UserId         INT             IDENTITY(1,1)  PRIMARY KEY,
    FirstName      NVARCHAR(100)   NOT NULL,
    LastName       NVARCHAR(100)   NOT NULL,
    Email          NVARCHAR(255)   NOT NULL       UNIQUE,
    PasswordHash   NVARCHAR(255)   NOT NULL,
    Phone          NVARCHAR(30)    NULL,
    RoleId         INT             NOT NULL,
    CreatedById    INT             NULL,
    CreatedAt      DATETIME2       NOT NULL       DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_Users_Roles        FOREIGN KEY (RoleId)      REFERENCES Roles(RoleId),
    CONSTRAINT FK_Users_CreatedBy    FOREIGN KEY (CreatedById) REFERENCES Users(UserId)
);

CREATE TABLE Packages (
    PackageId    INT             IDENTITY(1,1)  PRIMARY KEY,
    ClientId     INT             NOT NULL,
    PackageName  NVARCHAR(200)   NOT NULL,
    Description  NVARCHAR(MAX)   NULL,
    CreatedAt    DATETIME2       NOT NULL       DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_Packages_Client FOREIGN KEY (ClientId) REFERENCES Users(UserId)
);

CREATE TABLE ServiceRequests (
    RequestId       INT             IDENTITY(1,1)  PRIMARY KEY,
    RequestCode     NVARCHAR(50)    NOT NULL       UNIQUE,
    ClientId        INT             NOT NULL,
    ServiceTypeId   INT             NOT NULL,
    StatusId        INT             NOT NULL,
    PackageId       INT             NULL,
    Title           NVARCHAR(255)   NOT NULL,
    Description     NVARCHAR(MAX)   NULL,
    Cost            DECIMAL(12,2)   NULL,
    CreatedAt       DATETIME2       NOT NULL       DEFAULT SYSUTCDATETIME(),
    LastModifiedAt  DATETIME2       NULL,
    CONSTRAINT FK_Requests_Client       FOREIGN KEY (ClientId)      REFERENCES Users(UserId),
    CONSTRAINT FK_Requests_ServiceType  FOREIGN KEY (ServiceTypeId) REFERENCES ServiceTypes(ServiceTypeId),
    CONSTRAINT FK_Requests_Status       FOREIGN KEY (StatusId)      REFERENCES RequestStatuses(StatusId),
    CONSTRAINT FK_Requests_Package      FOREIGN KEY (PackageId)     REFERENCES Packages(PackageId)
);

CREATE TABLE RequestSteps (
    StepId       INT             IDENTITY(1,1)  PRIMARY KEY,
    RequestId    INT             NOT NULL,
    StepName     NVARCHAR(200)   NOT NULL,
    IsCompleted  BIT             NOT NULL       DEFAULT 0,
    StepOrder    INT             NOT NULL,
    CONSTRAINT FK_Steps_Request FOREIGN KEY (RequestId) REFERENCES ServiceRequests(RequestId)
);

CREATE TABLE RequestNotes (
    NoteId     INT             IDENTITY(1,1)  PRIMARY KEY,
    RequestId  INT             NOT NULL,
    StepId     INT             NULL,
    AuthorId   INT             NOT NULL,
    Content    NVARCHAR(MAX)   NOT NULL,
    CreatedAt  DATETIME2       NOT NULL       DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_Notes_Request FOREIGN KEY (RequestId) REFERENCES ServiceRequests(RequestId),
    CONSTRAINT FK_Notes_Step    FOREIGN KEY (StepId)    REFERENCES RequestSteps(StepId),
    CONSTRAINT FK_Notes_Author  FOREIGN KEY (AuthorId)  REFERENCES Users(UserId)
);

CREATE TABLE RequestShares (
    ShareId      INT       IDENTITY(1,1)  PRIMARY KEY,
    RequestId    INT       NOT NULL,
    UserId       INT       NOT NULL,
    SharedById   INT       NOT NULL,
    SharedAt     DATETIME2 NOT NULL       DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_Shares_Request   FOREIGN KEY (RequestId)  REFERENCES ServiceRequests(RequestId),
    CONSTRAINT FK_Shares_User      FOREIGN KEY (UserId)     REFERENCES Users(UserId),
    CONSTRAINT FK_Shares_SharedBy  FOREIGN KEY (SharedById) REFERENCES Users(UserId),
    CONSTRAINT UQ_Shares_Unique    UNIQUE (RequestId, UserId)
);

CREATE TABLE Documents (
    DocumentId      INT             IDENTITY(1,1)  PRIMARY KEY,
    RequestId       INT             NULL,
    DocumentTypeId  INT             NOT NULL,
    Title           NVARCHAR(255)   NOT NULL,
    FilePath        NVARCHAR(500)   NULL,
    CreatedBy       INT             NOT NULL,
    CreatedByAI     BIT             NOT NULL       DEFAULT 0,
    CreatedAt       DATETIME2       NOT NULL       DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_Docs_Request   FOREIGN KEY (RequestId)      REFERENCES ServiceRequests(RequestId),
    CONSTRAINT FK_Docs_Type      FOREIGN KEY (DocumentTypeId) REFERENCES DocumentTypes(DocumentTypeId),
    CONSTRAINT FK_Docs_CreatedBy FOREIGN KEY (CreatedBy)      REFERENCES Users(UserId)
);

CREATE TABLE RequestActions (
    ActionId      INT             IDENTITY(1,1)  PRIMARY KEY,
    RequestId     INT             NOT NULL,
    DocumentId    INT             NOT NULL,
    ActionTypeId  INT             NOT NULL,
    ClientId      INT             NOT NULL,
    Note          NVARCHAR(MAX)   NULL,
    CreatedAt     DATETIME2       NOT NULL       DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_Actions_Request    FOREIGN KEY (RequestId)    REFERENCES ServiceRequests(RequestId),
    CONSTRAINT FK_Actions_Document   FOREIGN KEY (DocumentId)   REFERENCES Documents(DocumentId),
    CONSTRAINT FK_Actions_Type       FOREIGN KEY (ActionTypeId) REFERENCES ActionTypes(ActionTypeId),
    CONSTRAINT FK_Actions_Client     FOREIGN KEY (ClientId)     REFERENCES Users(UserId)
);

CREATE TABLE Contracts (
    ContractId      INT             IDENTITY(1,1)  PRIMARY KEY,
    ContractTypeId  INT             NOT NULL,
    ClientId        INT             NOT NULL,
    RequestId       INT             NULL,
    AgentId         INT             NULL,
    WitnessName     NVARCHAR(200)   NULL,
    Content         NVARCHAR(MAX)   NOT NULL,
    SignedDate      DATETIME2       NULL,
    IsAccepted      BIT             NOT NULL       DEFAULT 0,
    CreatedAt       DATETIME2       NOT NULL       DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_Contracts_Type     FOREIGN KEY (ContractTypeId) REFERENCES ContractTypes(ContractTypeId),
    CONSTRAINT FK_Contracts_Client   FOREIGN KEY (ClientId)       REFERENCES Users(UserId),
    CONSTRAINT FK_Contracts_Request  FOREIGN KEY (RequestId)      REFERENCES ServiceRequests(RequestId),
    CONSTRAINT FK_Contracts_Agent    FOREIGN KEY (AgentId)        REFERENCES Users(UserId)
);

CREATE TABLE Messages (
    MessageId  INT             IDENTITY(1,1)  PRIMARY KEY,
    RequestId  INT             NOT NULL,
    SenderId   INT             NOT NULL,
    Content    NVARCHAR(MAX)   NOT NULL,
    SentAt     DATETIME2       NOT NULL       DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_Messages_Request FOREIGN KEY (RequestId) REFERENCES ServiceRequests(RequestId),
    CONSTRAINT FK_Messages_Sender  FOREIGN KEY (SenderId)  REFERENCES Users(UserId)
);

CREATE TABLE Notifications (
    NotificationId  INT             IDENTITY(1,1)  PRIMARY KEY,
    RecipientId     INT             NOT NULL,
    RequestId       INT             NULL,
    Type            NVARCHAR(50)    NOT NULL,
    Message         NVARCHAR(500)   NOT NULL,
    IsRead          BIT             NOT NULL       DEFAULT 0,
    CreatedAt       DATETIME2       NOT NULL       DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_Notif_Recipient FOREIGN KEY (RecipientId) REFERENCES Users(UserId),
    CONSTRAINT FK_Notif_Request   FOREIGN KEY (RequestId)   REFERENCES ServiceRequests(RequestId)
);

SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE';

-- Roles
INSERT INTO Roles (RoleName) VALUES 
    ('Client'),
    ('Admin');

-- ServiceTypes
INSERT INTO ServiceTypes (TypeName) VALUES 
    ('Voyage'),
    ('Réservation'),
    ('Recherche'),
    ('Tâche administrative'),
    ('Autre');

-- RequestStatuses
INSERT INTO RequestStatuses (StatusName) VALUES 
    ('Brouillon'),
    ('Envoyée'),
    ('En attente de révision'),
    ('En attente d''approbation'),
    ('En cours'),
    ('Question posée'),
    ('En attente'),
    ('Annulée'),
    ('Complétée');

-- DocumentTypes
INSERT INTO DocumentTypes (TypeName) VALUES 
    ('Recommandation d''hôtels'),
    ('Recommandation de vols'),
    ('Recherche'),
    ('Réservation'),
    ('Billet'),
    ('Itinéraire'),
    ('Autre');

-- ActionTypes
INSERT INTO ActionTypes (ActionName) VALUES 
    ('Réserver'),
    ('Demander une option similaire'),
    ('Demander une réservation'),
    ('Poser une question'),
    ('Refuser');

-- ContractTypes
INSERT INTO ContractTypes (TypeName) VALUES 
    ('Contrat'),
    ('Conditions d''utilisation'),
    ('Confirmation de paiement'),
    ('Approbation');

    SELECT * FROM Roles;
SELECT * FROM RequestStatuses;