// =========================================================
// SCHOLARTRACK
// Supabase Configuration
// =========================================================

import {
    createClient
} from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";


// =========================================================
// SUPABASE PROJECT
// =========================================================

const SUPABASE_URL =
    "https://reillijwbxrlrfjyjfhs.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_BL47lzBHEh4yXemBMwknUQ_VVO28mhv";


// =========================================================
// SUPABASE CLIENT
// =========================================================

export const supabase =
    createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );