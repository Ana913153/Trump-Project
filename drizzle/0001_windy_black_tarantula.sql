CREATE TABLE `children` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(80) NOT NULL,
	`accountType` varchar(80) NOT NULL DEFAULT '儿童成长账户',
	`targetYears` int NOT NULL DEFAULT 18,
	`annualReturnBps` int NOT NULL DEFAULT 600,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `children_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `contributionPlans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`childId` int NOT NULL,
	`monthlyAmountCents` int NOT NULL,
	`frequency` enum('monthly') NOT NULL DEFAULT 'monthly',
	`active` int NOT NULL DEFAULT 1,
	`nextContributionAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `contributionPlans_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `fundingEntries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`childId` int NOT NULL,
	`type` enum('treasury','deposit','contribution') NOT NULL,
	`amountCents` int NOT NULL,
	`note` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `fundingEntries_id` PRIMARY KEY(`id`)
);
