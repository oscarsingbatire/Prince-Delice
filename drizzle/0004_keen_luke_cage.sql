CREATE TABLE `smsGatewayLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`phone` varchar(32) NOT NULL,
	`message` text NOT NULL,
	`otpCode` varchar(8),
	`status` enum('Envoyé','Livré','Échoué') NOT NULL DEFAULT 'Envoyé',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `smsGatewayLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `userLoyalty` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`points` int NOT NULL DEFAULT 150,
	`tier` varchar(50) NOT NULL DEFAULT 'VIP Or',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `userLoyalty_id` PRIMARY KEY(`id`),
	CONSTRAINT `userLoyalty_userId_unique` UNIQUE(`userId`)
);
