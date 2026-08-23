ALTER TABLE `users` MODIFY COLUMN `role` enum('admin','user') NOT NULL DEFAULT 'user';--> statement-breakpoint
ALTER TABLE `deliveryReviews` ADD `dataOrigin` enum('live','demo') DEFAULT 'live' NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` ADD `dataOrigin` enum('live','demo') DEFAULT 'live' NOT NULL;--> statement-breakpoint
ALTER TABLE `returns` ADD `dataOrigin` enum('live','demo') DEFAULT 'live' NOT NULL;--> statement-breakpoint
ALTER TABLE `reviews` ADD `dataOrigin` enum('live','demo') DEFAULT 'live' NOT NULL;--> statement-breakpoint
ALTER TABLE `supportMessages` ADD `dataOrigin` enum('live','demo') DEFAULT 'live' NOT NULL;--> statement-breakpoint
ALTER TABLE `supportRequests` ADD `dataOrigin` enum('live','demo') DEFAULT 'live' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `dataOrigin` enum('live','demo') DEFAULT 'live' NOT NULL;