CREATE TABLE `reviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`userName` varchar(255) NOT NULL,
	`productId` int,
	`rating` int NOT NULL,
	`comment` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `reviews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `salesReports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reportDate` varchar(50) NOT NULL,
	`totalOrders` int NOT NULL,
	`totalRevenue` decimal(12,2) NOT NULL,
	`summary` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `salesReports_id` PRIMARY KEY(`id`)
);
