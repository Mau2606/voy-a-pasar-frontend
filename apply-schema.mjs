import pg from 'pg';
const { Client } = pg;

const password = "JMJas4VPqR6bsOc6";
const projectRef = "uevyarchaqwjlobfmfen";

async function run() {
    console.log("Conectando a bdd...");
    const client = new Client({
        host: `aws-1-sa-east-1.pooler.supabase.com`,
        port: 6543,
        user: `postgres.${projectRef}`,
        password: password,
        database: "postgres",
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log("Conectado. Ejecutando query...");
        
        await client.query(`
        CREATE TABLE IF NOT EXISTS question_reports (
            id SERIAL PRIMARY KEY,
            user_id BIGINT NOT NULL,
            question_id BIGINT NOT NULL,
            description TEXT NOT NULL,
            status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
            admin_notes TEXT,
            created_at TIMESTAMP NOT NULL,
            resolved_at TIMESTAMP,
            CONSTRAINT fk_reports_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
            CONSTRAINT fk_reports_question FOREIGN KEY (question_id) REFERENCES questions (id) ON DELETE CASCADE
        );
        `);
        console.log("Query ejecutada exitosamente.");
    } catch (e) {
        console.error("Error ejecutando:", e);
    } finally {
        await client.end();
        console.log("Cerrado.");
        process.exit(0);
    }
}

run();
