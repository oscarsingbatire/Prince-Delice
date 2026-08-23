CREATE TABLE `deliveryReviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`userId` int NOT NULL,
	`driverId` int,
	`userName` varchar(255) NOT NULL,
	`rating` int NOT NULL,
	`comment` text NOT NULL,
	`status` enum('Nouveau','En cours','Traité') NOT NULL DEFAULT 'Nouveau',
	`adminNotes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `deliveryReviews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `supportRequests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`userName` varchar(255) NOT NULL,
	`phone` varchar(32),
	`message` text NOT NULL,
	`status` enum('Nouveau','En cours','Traité') NOT NULL DEFAULT 'Nouveau',
	`adminNotes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `supportRequests_id` PRIMARY KEY(`id`)
);
