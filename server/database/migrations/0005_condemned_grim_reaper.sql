CREATE TABLE `waitlist` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`referrer` text,
	`created_at` integer,
	`updated_at` integer
);
