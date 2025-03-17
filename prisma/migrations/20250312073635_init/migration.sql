-- CreateTable
CREATE TABLE "Gadget" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Available',
    "decommissionedAt" DATETIME
);
