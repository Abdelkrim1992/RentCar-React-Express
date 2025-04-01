CREATE TABLE "bookings" (
	"id" serial PRIMARY KEY NOT NULL,
	"pickup_location" text NOT NULL,
	"return_location" text NOT NULL,
	"pickup_date" text NOT NULL,
	"return_date" text NOT NULL,
	"car_type" text NOT NULL,
	"car_id" integer,
	"user_id" integer,
	"name" text,
	"email" text,
	"phone" text,
	"status" text DEFAULT 'pending',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "cars" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"seats" integer NOT NULL,
	"power" text NOT NULL,
	"rating" text NOT NULL,
	"price" text NOT NULL,
	"image" text NOT NULL,
	"special" text,
	"special_color" text,
	"description" text,
	"features" text[],
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "site_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"site_name" text DEFAULT 'Ether',
	"logo_color" text DEFAULT '#6843EC',
	"accent_color" text DEFAULT '#D2FF3A',
	"logo_text" text DEFAULT 'ETHER',
	"custom_logo" text,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"is_admin" boolean DEFAULT false,
	"full_name" text,
	"email" text,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
