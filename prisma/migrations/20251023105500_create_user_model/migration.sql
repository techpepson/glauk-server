-- CreateEnum
CREATE TYPE "Role" AS ENUM ('STUDENT', 'LECTURER', 'ADMIN');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "level" INTEGER DEFAULT 1,
    "phone" TEXT NOT NULL,
    "xp" INTEGER DEFAULT 0,
    "totalXp" INTEGER DEFAULT 100,
    "targetGpa" DOUBLE PRECISION DEFAULT 4.0,
    "major" TEXT,
    "averageScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "profileImage" TEXT,
    "isFirstTimeUser" BOOLEAN NOT NULL DEFAULT true,
    "isUserRemembered" BOOLEAN NOT NULL DEFAULT false,
    "preferEmailNotification" BOOLEAN NOT NULL DEFAULT true,
    "preferPushNotification" BOOLEAN NOT NULL DEFAULT true,
    "preferQuizReminders" BOOLEAN NOT NULL DEFAULT true,
    "preferLeaderboardUpdates" BOOLEAN NOT NULL DEFAULT true,
    "role" "Role" NOT NULL DEFAULT 'STUDENT',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
