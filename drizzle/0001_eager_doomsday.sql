ALTER TABLE `users` ADD `phone` varchar(32);--> statement-breakpoint
ALTER TABLE `users` ADD `city` varchar(120);--> statement-breakpoint
ALTER TABLE `users` ADD `state` varchar(2);--> statement-breakpoint
ALTER TABLE `users` ADD `gender` enum('female','male','non_binary','prefer_not_to_say','other');--> statement-breakpoint
ALTER TABLE `users` ADD `appRole` enum('deaf_person','interpreter','establishment') DEFAULT 'deaf_person' NOT NULL;