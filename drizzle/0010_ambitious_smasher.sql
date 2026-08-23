CREATE TABLE `customerNotificationLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`supportRequestId` int,
	`deliveryReviewId` int,
	`phone` varchar(32),
	`channel` enum('sms','whatsapp') NOT NULL,
	`message` text NOT NULL,
	`status` enum('Planifiée','Simulée','Échouée') NOT NULL DEFAULT 'Planifiée',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `customerNotificationLogs_id` PRIMARY KEY(`id`)
);
