CREATE TABLE `withdrawalRequests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`amountCents` int NOT NULL,
	`destination` varchar(255) NOT NULL,
	`note` varchar(500),
	`status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`reviewedAt` timestamp,
	CONSTRAINT `withdrawalRequests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `children` MODIFY COLUMN `accountType` varchar(80) NOT NULL DEFAULT 'Child Growth Account';--> statement-breakpoint
ALTER TABLE `siteSettings` MODIFY COLUMN `defaultCurrencyCode` varchar(12) NOT NULL DEFAULT 'BTC';--> statement-breakpoint
ALTER TABLE `siteSettings` MODIFY COLUMN `contactEmail` varchar(320) NOT NULL DEFAULT 'support@example.com';--> statement-breakpoint
ALTER TABLE `siteSettings` MODIFY COLUMN `contactName` varchar(100) NOT NULL DEFAULT 'Support Team';--> statement-breakpoint
ALTER TABLE `siteSettings` ADD `usdcAddress` varchar(128) DEFAULT '0x0000000000000000000000000000000000000000' NOT NULL;