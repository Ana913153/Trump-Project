CREATE TABLE IF NOT EXISTS `children` (
  `id` int AUTO_INCREMENT NOT NULL,
  `userId` int NOT NULL,
  `name` varchar(80) NOT NULL,
  `accountType` varchar(80) NOT NULL DEFAULT 'Child Growth Account',
  `targetYears` int NOT NULL DEFAULT 18,
  `annualReturnBps` int NOT NULL DEFAULT 600,
  `balanceOverrideCents` int,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `children_id` PRIMARY KEY (`id`)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `contributionPlans` (
  `id` int AUTO_INCREMENT NOT NULL,
  `childId` int NOT NULL,
  `monthlyAmountCents` int NOT NULL,
  `frequency` enum('monthly') NOT NULL DEFAULT 'monthly',
  `active` int NOT NULL DEFAULT 1,
  `nextContributionAt` timestamp NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `contributionPlans_id` PRIMARY KEY (`id`)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `fundingEntries` (
  `id` int AUTO_INCREMENT NOT NULL,
  `childId` int NOT NULL,
  `type` enum('treasury','deposit','contribution','withdrawal') NOT NULL,
  `amountCents` int NOT NULL,
  `currencyCode` varchar(12) NOT NULL DEFAULT 'USD',
  `note` varchar(255),
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fundingEntries_id` PRIMARY KEY (`id`)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `contentArticles` (
  `id` int AUTO_INCREMENT NOT NULL,
  `title` varchar(160) NOT NULL,
  `body` text NOT NULL,
  `imageUrl` varchar(500),
  `linkUrl` varchar(500),
  `catalog` varchar(120),
  `placement` varchar(20) NOT NULL DEFAULT 'carousel',
  `sortOrder` int NOT NULL DEFAULT 0,
  `active` int NOT NULL DEFAULT 1,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `contentArticles_id` PRIMARY KEY (`id`)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `faqs` (
  `id` int AUTO_INCREMENT NOT NULL,
  `question` varchar(255) NOT NULL,
  `answer` text NOT NULL,
  `sortOrder` int NOT NULL DEFAULT 0,
  `active` int NOT NULL DEFAULT 1,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `faqs_id` PRIMARY KEY (`id`)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `siteSettings` (
  `id` int AUTO_INCREMENT NOT NULL,
  `btcAddress` varchar(128) NOT NULL,
  `usdcAddress` varchar(128) NOT NULL DEFAULT '0x0000000000000000000000000000000000000000',
  `defaultCurrencyCode` varchar(12) NOT NULL DEFAULT 'BTC',
  `contactEmail` varchar(320) NOT NULL DEFAULT 'support@example.com',
  `contactName` varchar(100) NOT NULL DEFAULT 'Support Team',
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `siteSettings_id` PRIMARY KEY (`id`)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `currencies` (
  `id` int AUTO_INCREMENT NOT NULL,
  `code` varchar(12) NOT NULL,
  `name` varchar(80) NOT NULL,
  `symbol` varchar(8) NOT NULL,
  `active` int NOT NULL DEFAULT 1,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `currencies_id` PRIMARY KEY (`id`),
  CONSTRAINT `currencies_code_unique` UNIQUE (`code`)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `contactSubmissions` (
  `id` int AUTO_INCREMENT NOT NULL,
  `email` varchar(320) NOT NULL,
  `userId` int,
  `status` enum('new','contacted','closed') NOT NULL DEFAULT 'new',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `contactSubmissions_id` PRIMARY KEY (`id`)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `btcTransfers` (
  `id` int AUTO_INCREMENT NOT NULL,
  `userId` int,
  `childId` int,
  `email` varchar(320),
  `txHash` varchar(160) NOT NULL,
  `amount` varchar(64),
  `status` enum('pending','confirmed','rejected') NOT NULL DEFAULT 'pending',
  `note` varchar(255),
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `btcTransfers_id` PRIMARY KEY (`id`)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `withdrawalRequests` (
  `id` int AUTO_INCREMENT NOT NULL,
  `userId` int NOT NULL,
  `amountCents` int NOT NULL,
  `destination` varchar(255) NOT NULL,
  `note` varchar(500),
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `reviewedAt` timestamp NULL,
  CONSTRAINT `withdrawalRequests_id` PRIMARY KEY (`id`)
);
