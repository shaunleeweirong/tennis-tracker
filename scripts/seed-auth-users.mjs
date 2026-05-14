#!/usr/bin/env node

/*
 * Idempotently creates the fixed MVP Supabase Auth users and app-owned rows.
 *
 * Required environment variables:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *   PLAYER_EMAIL
 *   PLAYER_PASSWORD
 *   COACH_EMAIL
 *   COACH_PASSWORD
 *
 * Optional:
 *   PLAYER_NAME defaults to "Player"
 *   COACH_NAME defaults to "Coach"
 *
 * Usage:
 *   node scripts/seed-auth-users.mjs
 *
 * This script uses the Supabase Auth Admin API, so it must run only in trusted
 * local/deploy environments with the service-role key available.
 */

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

loadEnvFile(".env.local");
loadEnvFile(".env");

const requiredEnv = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "PLAYER_EMAIL",
  "PLAYER_PASSWORD",
  "COACH_EMAIL",
  "COACH_PASSWORD",
];

for (const key of requiredEnv) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
);

const player = await upsertAuthUser({
  email: process.env.PLAYER_EMAIL,
  password: process.env.PLAYER_PASSWORD,
  name: process.env.PLAYER_NAME || "Player",
  role: "player",
});

const coach = await upsertAuthUser({
  email: process.env.COACH_EMAIL,
  password: process.env.COACH_PASSWORD,
  name: process.env.COACH_NAME || "Coach",
  role: "coach",
});

await upsertProfile({
  id: player.id,
  name: process.env.PLAYER_NAME || "Player",
  role: "player",
  equipped_character_id: null,
});

await upsertProfile({
  id: coach.id,
  name: process.env.COACH_NAME || "Coach",
  role: "coach",
  equipped_character_id: null,
});

await assertNoError(
  supabase
    .from("coach_player_links")
    .upsert(
      { coach_id: coach.id, player_id: player.id },
      { onConflict: "coach_id,player_id" },
    ),
  "link coach to player",
);

await assertNoError(
  supabase
    .from("player_collection")
    .upsert(
      { player_id: player.id, character_id: "rookie", earned_via: "default" },
      { onConflict: "player_id,character_id" },
    ),
  "seed rookie collection ownership",
);

await assertNoError(
  supabase
    .from("profiles")
    .update({ equipped_character_id: "rookie" })
    .eq("id", player.id),
  "equip Rookie for player",
);

console.log("Seeded Supabase Auth users, profiles, coach link, and Rookie ownership.");

async function upsertAuthUser({ email, password, name, role }) {
  const existing = await findAuthUserByEmail(email);

  if (existing) {
    const { data, error } = await supabase.auth.admin.updateUserById(existing.id, {
      password,
      email_confirm: true,
      user_metadata: { name, role },
      app_metadata: { role },
    });

    if (error) {
      throw new Error(`Failed to update auth user ${email}: ${error.message}`);
    }

    return data.user;
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name, role },
    app_metadata: { role },
  });

  if (error) {
    throw new Error(`Failed to create auth user ${email}: ${error.message}`);
  }

  return data.user;
}

async function upsertProfile(profile) {
  await assertNoError(
    supabase
      .from("profiles")
      .upsert(profile, { onConflict: "id" }),
    `upsert ${profile.role} profile`,
  );
}

async function findAuthUserByEmail(email) {
  const normalizedEmail = email.toLowerCase();
  let page = 1;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage: 1000,
    });

    if (error) {
      throw new Error(`Failed to list auth users: ${error.message}`);
    }

    const user = data.users.find((candidate) => {
      return candidate.email?.toLowerCase() === normalizedEmail;
    });

    if (user) {
      return user;
    }

    if (data.users.length < 1000) {
      return null;
    }

    page += 1;
  }
}

async function assertNoError(request, action) {
  const { error } = await request;

  if (error) {
    throw new Error(`Failed to ${action}: ${error.message}`);
  }
}

function loadEnvFile(fileName) {
  const filePath = resolve(process.cwd(), fileName);

  if (!existsSync(filePath)) {
    return;
  }

  for (const line of readFileSync(filePath, "utf8").split("\n")) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const rawValue = trimmed.slice(separatorIndex + 1).trim();

    if (!key || process.env[key] !== undefined) {
      continue;
    }

    process.env[key] = rawValue.replace(/^["']|["']$/g, "");
  }
}
