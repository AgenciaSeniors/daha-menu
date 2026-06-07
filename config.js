// =========================================================
// DAHA — Configuración
// =========================================================
// IMPORTANTE: Reemplaza estos valores con los de tu proyecto Supabase.
// SUPABASE_KEY debe ser la publishable / anon key (NUNCA la service_role).
//
// Cómo obtenerlos:
// 1) Ve a https://supabase.com/dashboard → Project Settings → API
// 2) Copia "Project URL" → SUPABASE_URL
// 3) Copia la "publishable key" o "anon public key" → SUPABASE_KEY
// 4) RESTAURANT_ID es el UUID que identifica este restaurante en tu tabla
//    multi-tenant. Si solo tienes un negocio, créalo en Supabase y copia el id.
// =========================================================

const CONFIG = {
    SUPABASE_URL: 'https://TU-PROYECTO.supabase.co',
    SUPABASE_KEY: 'TU_PUBLISHABLE_KEY',
    RESTAURANT_ID: 'TU-UUID-DAHA'
};

// Cliente global de Supabase
const supabaseClient = (typeof supabase !== 'undefined')
    ? supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_KEY)
    : null;
