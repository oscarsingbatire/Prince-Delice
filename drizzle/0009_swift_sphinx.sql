CREATE TABLE `supportMessages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`supportRequestId` int NOT NULL,
	`senderType` enum('client','support') NOT NULL,
	`senderId` int,
	`senderName` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`readAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `supportMessages_id` PRIMARY KEY(`id`)
);
