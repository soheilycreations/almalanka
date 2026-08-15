-- CreateTable
CREATE TABLE "Booking" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "customerName" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "country" TEXT,
    "tourName" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "endDate" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "participants" INTEGER NOT NULL DEFAULT 1,
    "slot" INTEGER,
    "customLocations" TEXT,
    "customActivities" TEXT,
    "notes" TEXT,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "interest" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "TourPlan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "days" INTEGER NOT NULL,
    "route" TEXT,
    "activities" TEXT,
    "price" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "type" TEXT,
    "feat" BOOLEAN NOT NULL DEFAULT false,
    "overview" TEXT NOT NULL,
    "highlights" TEXT,
    "difficulty" TEXT NOT NULL,
    "guide" TEXT NOT NULL,
    "gallery" TEXT,
    "itinerary" TEXT
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "image" TEXT
);

-- CreateTable
CREATE TABLE "Activity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Location" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Log" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "action" TEXT NOT NULL,
    "details" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Stat" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'current',
    "stat1" TEXT NOT NULL DEFAULT '0',
    "stat2" TEXT NOT NULL DEFAULT '0',
    "stat3" TEXT NOT NULL DEFAULT '0',
    "stat4" TEXT NOT NULL DEFAULT '0'
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
