ALTER TABLE `children` ADD `stakingAmountCents` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `children` ADD `stakingDays` int DEFAULT 30 NOT NULL;--> statement-breakpoint
ALTER TABLE `children` ADD `stakingStartedAt` timestamp;--> statement-breakpoint
ALTER TABLE `project_progress` ADD `eyebrow` varchar(120) DEFAULT '项目透明度' NOT NULL;--> statement-breakpoint
ALTER TABLE `project_progress` ADD `sectionTitle` varchar(160) DEFAULT '社区项目进展' NOT NULL;--> statement-breakpoint
ALTER TABLE `project_progress` ADD `milestonesLabel` varchar(120) DEFAULT '阶段结果' NOT NULL;--> statement-breakpoint
ALTER TABLE `project_progress` ADD `milestonesTitle` varchar(120) DEFAULT '里程碑' NOT NULL;--> statement-breakpoint
ALTER TABLE `project_progress` ADD `peopleLabel` varchar(120) DEFAULT '人物' NOT NULL;--> statement-breakpoint
ALTER TABLE `project_progress` ADD `peopleTitle` varchar(120) DEFAULT '项目团队' NOT NULL;