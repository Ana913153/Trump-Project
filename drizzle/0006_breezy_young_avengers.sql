CREATE TABLE `btcTransfers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`childId` int,
	`email` varchar(320),
	`txHash` varchar(160) NOT NULL,
	`amount` varchar(64),
	`status` enum('pending','confirmed','rejected') NOT NULL DEFAULT 'pending',
	`note` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `btcTransfers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `siteSettings` ADD `contactName` varchar(100) DEFAULT 'Nest 客服' NOT NULL;