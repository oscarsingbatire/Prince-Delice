ALTER TABLE `orders` ADD `driverId` int;--> statement-breakpoint
ALTER TABLE `supportRequests` ADD `requiresExpert` boolean DEFAULT false NOT NULL;