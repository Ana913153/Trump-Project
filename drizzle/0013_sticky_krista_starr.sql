CREATE TABLE `userMessages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(160) NOT NULL,
	`body` text NOT NULL,
	`readAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `userMessages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `footerLinks` MODIFY COLUMN `body` text;