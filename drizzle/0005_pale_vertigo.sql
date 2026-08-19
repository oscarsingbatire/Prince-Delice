CREATE TABLE `drivers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`phone` varchar(32) NOT NULL,
	`vehicle` varchar(50) NOT NULL DEFAULT 'Moto Honda',
	`arrondissement` varchar(100) NOT NULL DEFAULT '3e Arrondissement',
	`status` enum('Disponible','En tournée','De retour') NOT NULL DEFAULT 'Disponible',
	`currentLocation` varchar(100) NOT NULL DEFAULT 'Dépôt PK0 / Centre',
	`assignedOrderId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `drivers_id` PRIMARY KEY(`id`)
);
