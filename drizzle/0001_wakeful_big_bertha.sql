CREATE TABLE `deliveryZones` (
	`id` int AUTO_INCREMENT NOT NULL,
	`arrondissement` varchar(100) NOT NULL,
	`neighborhood` varchar(100) NOT NULL,
	`fee` decimal(10,2) NOT NULL,
	`estimatedTime` varchar(100) NOT NULL,
	CONSTRAINT `deliveryZones_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orderItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`productId` int NOT NULL,
	`productName` varchar(255) NOT NULL,
	`price` decimal(10,2) NOT NULL,
	`quantity` int NOT NULL,
	CONSTRAINT `orderItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`customerName` varchar(255) NOT NULL,
	`customerPhone` varchar(32) NOT NULL,
	`deliveryAddress` text NOT NULL,
	`arrondissement` varchar(100) NOT NULL,
	`neighborhood` varchar(100) NOT NULL,
	`totalAmount` decimal(10,2) NOT NULL,
	`deliveryFee` decimal(10,2) NOT NULL,
	`paymentMethod` enum('orange_money','visa_mastercard','cash_on_delivery') NOT NULL,
	`paymentStatus` enum('pending','paid','failed') NOT NULL DEFAULT 'pending',
	`status` enum('Validée','En préparation','En cours de livraison','Livrée') NOT NULL DEFAULT 'Validée',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`category` varchar(100) NOT NULL,
	`description` text,
	`price` decimal(10,2) NOT NULL,
	`unit` varchar(50) NOT NULL,
	`stock` int NOT NULL DEFAULT 0,
	`lowStockThreshold` int NOT NULL DEFAULT 10,
	`freshnessStatus` enum('Fraîcheur optimale','Arrivage du jour','Dernières unités') NOT NULL DEFAULT 'Fraîcheur optimale',
	`imageUrl` text NOT NULL,
	`featured` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `products_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `returns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`userId` int NOT NULL,
	`reason` text NOT NULL,
	`photoUrl` text NOT NULL,
	`status` enum('En attente','Approuvée','Rejetée') NOT NULL DEFAULT 'En attente',
	`compensationType` enum('avoir','remboursement','remplacement'),
	`adminNotes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `returns_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `phone` varchar(32);--> statement-breakpoint
ALTER TABLE `users` ADD `mfaEnabled` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `mfaSecret` varchar(64);--> statement-breakpoint
ALTER TABLE `users` ADD `mfaMethod` enum('sms','app') DEFAULT 'app' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `mfaPhoneCode` varchar(8);