CREATE TABLE `project_milestones` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(160) NOT NULL,
	`description` text NOT NULL,
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `project_milestones_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `project_people` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(120) NOT NULL,
	`role` varchar(160) NOT NULL,
	`bio` text NOT NULL,
	`imageUrl` varchar(500),
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `project_people_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `project_progress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(160) NOT NULL,
	`description` text NOT NULL,
	`imageUrl` varchar(500),
	`targetAmountCents` int NOT NULL DEFAULT 0,
	`raisedAmountCents` int NOT NULL DEFAULT 0,
	`currencyCode` varchar(12) NOT NULL DEFAULT 'USD',
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `project_progress_id` PRIMARY KEY(`id`)
);
