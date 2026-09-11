/**
 * Creates the private `resumes` storage bucket on a remote Supabase project.
 * Requires SUPABASE_SERVICE_ROLE_KEY in .env.local (Project Settings → API).
 *
 *   pnpm exec tsx scripts/ensure-resumes-bucket.ts
 *
 * After the bucket exists, also run supabase/migrations/0002_resumes_bucket.sql
 * in the SQL editor so upload/select RLS policies are in place (the JS
 * createBucket call alone does not install those policies).
 */
import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

config({ path: ".env.local" });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local.\n" +
      "Copy the service_role (secret) key from Supabase → Project Settings → API."
  );
  process.exit(1);
}

const admin = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function main() {
  const { data: buckets, error: listError } = await admin.storage.listBuckets();
  if (listError) throw listError;

  const exists = (buckets ?? []).some((b) => b.id === "resumes");
  if (!exists) {
    const { error } = await admin.storage.createBucket("resumes", {
      public: false,
      fileSizeLimit: 10 * 1024 * 1024,
      allowedMimeTypes: ["application/pdf"],
    });
    if (error) throw error;
    console.log("Created bucket: resumes");
  } else {
    console.log("Bucket already exists: resumes");
  }

  console.log(
    "\nNext: open the SQL editor and run supabase/migrations/0002_resumes_bucket.sql\n" +
      "(safe to re-run — bucket insert is ON CONFLICT DO NOTHING).\n" +
      "Dashboard → SQL → New query"
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
