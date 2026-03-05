CREATE TYPE "public"."patient_sex" AS ENUM('male', 'female', 'other');--> statement-breakpoint
CREATE TABLE "appointments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" text NOT NULL,
	"patient_id" uuid NOT NULL,
	"dentist_user_id" text NOT NULL,
	"starts_at" timestamp with time zone NOT NULL,
	"ends_at" timestamp with time zone NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "appointments_time_check" CHECK ("appointments"."ends_at" > "appointments"."starts_at")
);
--> statement-breakpoint
CREATE TABLE "patients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" text NOT NULL,
	"name" text NOT NULL,
	"sex" "patient_sex" NOT NULL,
	"birth_date" date NOT NULL,
	"rg" varchar(20) NOT NULL,
	"cpf" varchar(20) NOT NULL,
	"phone" varchar(20) NOT NULL,
	"email" text,
	"zip_code" varchar NOT NULL,
	"street" text NOT NULL,
	"street_number" varchar(20) NOT NULL,
	"neighborhood" text NOT NULL,
	"city" text NOT NULL,
	"state" varchar(2) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "appointments_org_id_idx" ON "appointments" USING btree ("org_id");--> statement-breakpoint
CREATE INDEX "appointments_org_dentist_starts_at_idx" ON "appointments" USING btree ("org_id","dentist_user_id","starts_at");--> statement-breakpoint
CREATE INDEX "appointments_org_patient_starts_at_idx" ON "appointments" USING btree ("org_id","patient_id","starts_at");--> statement-breakpoint
CREATE UNIQUE INDEX "patients_org_cpf_unique" ON "patients" USING btree ("org_id","cpf");--> statement-breakpoint
CREATE UNIQUE INDEX "patients_org_rg_unique" ON "patients" USING btree ("org_id","rg");--> statement-breakpoint
CREATE UNIQUE INDEX "patients_id_org_unique" ON "patients" USING btree ("id","org_id");--> statement-breakpoint
CREATE INDEX "patients_org_id_idx" ON "patients" USING btree ("org_id");--> statement-breakpoint
CREATE INDEX "patients_org_name_idx" ON "patients" USING btree ("org_id","name");