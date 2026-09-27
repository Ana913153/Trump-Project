ALTER TABLE `children` ADD `lockedAmountCents` int NOT NULL DEFAULT 0;
--> statement-breakpoint
ALTER TABLE `children` ADD `lockedAt` timestamp;
