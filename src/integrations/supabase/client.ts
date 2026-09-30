import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://zrzmbfrcxuohcqhufhfe.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_duZ4VIAxxEdfRzX0l93iKw_YJdmgLY5";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
