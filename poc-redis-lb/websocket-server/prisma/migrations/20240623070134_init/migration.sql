-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('USER', 'GROUP', 'BROADCAST');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Group" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserGroup" (
    "user_id" INTEGER NOT NULL,
    "group_id" INTEGER NOT NULL,

    CONSTRAINT "UserGroup_pkey" PRIMARY KEY ("user_id","group_id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "notification_id" SERIAL NOT NULL,
    "sender_id" INTEGER,
    "content" TEXT NOT NULL,
    "notification_type" "NotificationType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("notification_id")
);

-- CreateTable
CREATE TABLE "UserNotification" (
    "notification_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "UserNotification_pkey" PRIMARY KEY ("notification_id","user_id")
);

-- CreateTable
CREATE TABLE "GroupNotification" (
    "notification_id" INTEGER NOT NULL,
    "group_id" INTEGER NOT NULL,

    CONSTRAINT "GroupNotification_pkey" PRIMARY KEY ("notification_id","group_id")
);

-- CreateTable
CREATE TABLE "BroadcastNotification" (
    "notification_id" INTEGER NOT NULL,

    CONSTRAINT "BroadcastNotification_pkey" PRIMARY KEY ("notification_id")
);

-- AddForeignKey
ALTER TABLE "UserGroup" ADD CONSTRAINT "UserGroup_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserGroup" ADD CONSTRAINT "UserGroup_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserNotification" ADD CONSTRAINT "UserNotification_notification_id_fkey" FOREIGN KEY ("notification_id") REFERENCES "Notification"("notification_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserNotification" ADD CONSTRAINT "UserNotification_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupNotification" ADD CONSTRAINT "GroupNotification_notification_id_fkey" FOREIGN KEY ("notification_id") REFERENCES "Notification"("notification_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupNotification" ADD CONSTRAINT "GroupNotification_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BroadcastNotification" ADD CONSTRAINT "BroadcastNotification_notification_id_fkey" FOREIGN KEY ("notification_id") REFERENCES "Notification"("notification_id") ON DELETE CASCADE ON UPDATE CASCADE;
