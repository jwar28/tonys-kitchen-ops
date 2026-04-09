import { createBrowserClient } from "@supabase/ssr";
import { supabasePublishableKey, supabaseUrl } from "@/lib/utils";

export const createClient = () =>
  createBrowserClient(
    supabaseUrl!,
    supabasePublishableKey!,
  );
