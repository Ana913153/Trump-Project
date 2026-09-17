CREATE TABLE `currencies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(12) NOT NULL,
	`name` varchar(80) NOT NULL,
	`symbol` varchar(8) NOT NULL,
	`active` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `currencies_id` PRIMARY KEY(`id`),
	CONSTRAINT `currencies_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
ALTER TABLE `fundingEntries` MODIFY COLUMN `type` enum('treasury','deposit','contribution','withdrawal') NOT NULL;--> statement-breakpoint
ALTER TABLE `fundingEntries` ADD `currencyCode` varchar(12) DEFAULT 'USD' NOT NULL;--> statement-breakpoint
ALTER TABLE `siteSettings` ADD `defaultCurrencyCode` varchar(12) DEFAULT 'USD' NOT NULL;--> statement-breakpoint
ALTER TABLE `siteSettings` ADD `contactEmail` varchar(320) DEFAULT 'support@nest.example' NOT NULL;