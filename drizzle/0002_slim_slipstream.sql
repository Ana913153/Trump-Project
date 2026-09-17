CREATE TABLE `contentArticles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(160) NOT NULL,
	`body` text NOT NULL,
	`imageUrl` varchar(500),
	`linkUrl` varchar(500),
	`sortOrder` int NOT NULL DEFAULT 0,
	`active` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `contentArticles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `faqs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`question` varchar(255) NOT NULL,
	`answer` text NOT NULL,
	`sortOrder` int NOT NULL DEFAULT 0,
	`active` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `faqs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `siteSettings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`btcAddress` varchar(128) NOT NULL,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `siteSettings_id` PRIMARY KEY(`id`)
);
