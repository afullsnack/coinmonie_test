import { relations } from "drizzle-orm";
import { pgTable, serial, text, timestamp, boolean, numeric, index, jsonb } from "drizzle-orm/pg-core";

export const todos = pgTable("todos", {
	id: serial().primaryKey(),
	title: text().notNull(),
	createdAt: timestamp("created_at").defaultNow(),
});

export const user = pgTable("user", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	emailVerified: boolean("email_verified").default(false).notNull(),
	image: text("image"),
	mustChangePassword: boolean("must_change_password").default(false).notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => new Date())
		.notNull(),
});

export const session = pgTable(
	"session",
	{
		id: text("id").primaryKey(),
		expiresAt: timestamp("expires_at").notNull(),
		token: text("token").notNull().unique(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.$onUpdate(() => new Date())
			.notNull(),
		ipAddress: text("ip_address"),
		userAgent: text("user_agent"),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
	},
	(table) => [index("session_userId_idx").on(table.userId)],
);

export const account = pgTable(
	"account",
	{
		id: text("id").primaryKey(),
		accountId: text("account_id").notNull(),
		providerId: text("provider_id").notNull(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		accessToken: text("access_token"),
		refreshToken: text("refresh_token"),
		idToken: text("id_token"),
		accessTokenExpiresAt: timestamp("access_token_expires_at"),
		refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
		scope: text("scope"),
		password: text("password"),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [index("account_userId_idx").on(table.userId)],
);

export const verification = pgTable(
	"verification",
	{
		id: text("id").primaryKey(),
		identifier: text("identifier").notNull(),
		value: text("value").notNull(),
		expiresAt: timestamp("expires_at").notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [index("verification_identifier_idx").on(table.identifier)],
);

export const userRelations = relations(user, ({ many }) => ({
	sessions: many(session),
	accounts: many(account),
}));

export const sessionRelations = relations(session, ({ one }) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id],
	}),
}));

export const accountRelations = relations(account, ({ one }) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id],
	}),
}));

export const transactions = pgTable(
	"transactions",
	{
		id: serial().primaryKey(),
		reference: text("reference").notNull().unique(),
		depositAddress: text("deposit_address").notNull(),
		asset: text("asset").notNull(),
		sourceAmount: numeric("source_amount").notNull(),
		sourceCurrency: text("source_currency").notNull(),
		destAmount: numeric("dest_amount").notNull(),
		destCurrency: text("dest_currency").notNull(),
		channel: text("channel").notNull().default("BANK"),
		accountName: text("account_name").notNull(),
		accountNumber: text("account_number"),
		bankCode: text("bank_code"),
		bankName: text("bank_name"),
		mobileNumber: text("mobile_number"),
		mobileNetwork: text("mobile_network"),
		transactionHash: text("transaction_hash"),
		status: text("status").notNull().default("PENDING"),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [index("transactions_reference_idx").on(table.reference)],
);

export const webhookEvents = pgTable(
	"webhook_events",
	{
		id: serial().primaryKey(),
		source: text("source").notNull().default("switch"),
		eventType: text("event_type").notNull(),
		reference: text("reference"),
		depositAddress: text("deposit_address"),
		transactionHash: text("transaction_hash"),
		signatureValid: boolean("signature_valid").notNull(),
		payload: jsonb("payload").notNull(),
		receivedAt: timestamp("received_at").defaultNow().notNull(),
	},
	(table) => [
		index("webhook_events_reference_idx").on(table.reference),
		index("webhook_events_deposit_address_idx").on(table.depositAddress),
	],
);

export const waitlistSignups = pgTable("waitlist_signups", {
	id: serial().primaryKey(),
	email: text("email").notNull().unique(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});
