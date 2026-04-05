import pg from 'pg';
import fs from 'fs';
const { Client } = pg;

const password = "JMJas4VPqR6bsOc6";
const projectRef = "uevyarchaqwjlobfmfen";

let logBuffer = "";
function log(msg) {
    logBuffer += msg + "\n";
    console.log(msg);
}

async function testConnection(name, config) {
    log(`\n\n========== [ Prueba: ${name} ] ==========`);
    log(`Host: ${config.host}:${config.port}`);
    log(`User: ${config.user}`);
    
    const client = new Client({
        ...config,
        password: password,
        database: "postgres",
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        log(`✅ [EXITO] Conexion establecida correctamente!`);
        await client.end();
        return true;
    } catch (err) {
        log(`❌ [FALLO] Error de conexion: ${err.message}`);
        return false;
    }
}

async function runTests() {
    const success1 = await testConnection("Conexion Directa (Puerto 5432)", {
        host: `db.${projectRef}.supabase.co`,
        port: 5432,
        user: "postgres"
    });

    const success2 = await testConnection("Pooler IPv4 / PgBouncer (Puerto 6543)", {
        host: `aws-0-sa-east-1.pooler.supabase.com`,
        port: 6543,
        user: `postgres.${projectRef}`
    });

    const success3 = await testConnection("Pooler Global Moderno (Puerto 6543)", {
        host: `${projectRef}.pooler.supabase.com`,
        port: 6543,
        user: `postgres.${projectRef}`
    });

    log("\n=======================================================");
    log("RESUMEN:");
    if (success1) log("=> Usa Conexion Directa (DB_HOST=db.uevyarchaqwjlobfmfen.supabase.co, Puerto 5432, Usuario postgres)");
    if (success2) log("=> Usa Pooler IPv4 (aws-0-sa-east-1.pooler.supabase.com, puerto 6543, Usuario postgres.uevyarchaqwjlobfmfen)");
    if (success3) log("=> Usa Pooler Global (uevyarchaqwjlobfmfen.pooler.supabase.com, puerto 6543, Usuario postgres.uevyarchaqwjlobfmfen)");
    
    if (!success1 && !success2 && !success3) {
        log("\n❗ NINGUNA PRUEBA FUNCIONO.");
        log("❗ POSIBLES RAZONES:");
        log("   1. Tu proyecto de Supabase esta PAUSADO en el dashboard de Supabase (por inactividad).");
        log("   2. Has cambiado o escrito mal la contrasena.");
        log("   3. Tu Project ID (uevyarchaqwjlobfmfen) es incorrecto.");
    }
    
    fs.writeFileSync("report.log", logBuffer, 'utf8');
    process.exit(0);
}

runTests();
