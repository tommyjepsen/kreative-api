CREATE TABLE "companies" (
	"id" text PRIMARY KEY NOT NULL,
	"companyName" varchar(255) NOT NULL,
	"companyDescription" text,
	"companyImageUrl" text,
	"companyUrl" varchar(512) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "companies_companyUrl_unique" UNIQUE("companyUrl")
);
--> statement-breakpoint
CREATE TABLE "projectToCompany" (
	"id" text PRIMARY KEY NOT NULL,
	"projectId" text NOT NULL,
	"companyId" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"projectName" varchar(255) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "userToProject" (
	"userId" text NOT NULL,
	"projectId" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"projectSelectedId" text,
	"email" varchar(255) NOT NULL,
	"stripeCustomerId" varchar(255),
	"stripePaymentLink" varchar(255),
	"testUser" boolean DEFAULT true NOT NULL,
	"subscription" varchar(255) DEFAULT 'free' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "workflowNodeRuns" (
	"id" text PRIMARY KEY NOT NULL,
	"workflowNodeId" text NOT NULL,
	"workflowId" text NOT NULL,
	"runId" varchar(255) NOT NULL,
	"status" varchar(255) DEFAULT 'pending' NOT NULL,
	"output" jsonb,
	"error" varchar(255),
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workflowNodes" (
	"id" text PRIMARY KEY NOT NULL,
	"workflowId" text NOT NULL,
	"title" varchar(255),
	"type" varchar(255) DEFAULT 'prompt' NOT NULL,
	"data" jsonb,
	"inputWorkflowNodeId" text,
	"output" jsonb,
	"position" integer DEFAULT 0,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workflows" (
	"id" text PRIMARY KEY NOT NULL,
	"cloudflareWorkflowId" varchar(255),
	"title" varchar(255) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "projectToCompany" ADD CONSTRAINT "projectToCompany_projectId_projects_id_fk" FOREIGN KEY ("projectId") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projectToCompany" ADD CONSTRAINT "projectToCompany_companyId_companies_id_fk" FOREIGN KEY ("companyId") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "userToProject" ADD CONSTRAINT "userToProject_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "userToProject" ADD CONSTRAINT "userToProject_projectId_projects_id_fk" FOREIGN KEY ("projectId") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_projectSelectedId_projects_id_fk" FOREIGN KEY ("projectSelectedId") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflowNodeRuns" ADD CONSTRAINT "workflowNodeRuns_workflowNodeId_workflowNodes_id_fk" FOREIGN KEY ("workflowNodeId") REFERENCES "public"."workflowNodes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflowNodeRuns" ADD CONSTRAINT "workflowNodeRuns_workflowId_workflows_id_fk" FOREIGN KEY ("workflowId") REFERENCES "public"."workflows"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflowNodes" ADD CONSTRAINT "workflowNodes_workflowId_workflows_id_fk" FOREIGN KEY ("workflowId") REFERENCES "public"."workflows"("id") ON DELETE no action ON UPDATE no action;