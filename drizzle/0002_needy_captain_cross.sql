ALTER TABLE `currentWeek` MODIFY COLUMN `weekStartDate` varchar(10) NOT NULL;--> statement-breakpoint
ALTER TABLE `earnings` MODIFY COLUMN `date` varchar(10) NOT NULL;--> statement-breakpoint
ALTER TABLE `weekSnapshots` MODIFY COLUMN `weekStartDate` varchar(10) NOT NULL;--> statement-breakpoint
ALTER TABLE `weekSnapshots` MODIFY COLUMN `weekEndDate` varchar(10) NOT NULL;