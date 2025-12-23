/**
 * Script para hashear contraseñas en db.json
 * 
 * Este script:
 * 1. Lee el archivo db.json
 * 2. Hashea todas las contraseñas de usuarios usando bcrypt
 * 3. Guarda el archivo actualizado
 * 
 * IMPORTANTE: Ejecutar solo UNA VEZ para actualizar la BD
 * 
 * Uso: node scripts/hash-passwords.js
 */

const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const SALT_ROUNDS = 10;
const DB_PATH = path.join(__dirname, '../db.json');

async function hashPasswords() {
    console.log('🔐 Iniciando proceso de encriptación de contraseñas...\n');

    try {
        // Leer db.json
        const dbContent = fs.readFileSync(DB_PATH, 'utf8');
        const db = JSON.parse(dbContent);

        if (!db.users || !Array.isArray(db.users)) {
            throw new Error('No se encontró el array de usuarios en db.json');
        }

        console.log(`📊 Total de usuarios encontrados: ${db.users.length}\n`);

        // Procesar cada usuario
        for (let i = 0; i < db.users.length; i++) {
            const user = db.users[i];

            // Verificar si ya está hasheada (bcrypt hash empieza con "$2a$" o "$2b$")
            if (user.password && !user.password.startsWith('$2')) {
                const originalPassword = user.password;

                // Generar hash
                const salt = await bcrypt.genSalt(SALT_ROUNDS);
                const hashedPassword = await bcrypt.hash(originalPassword, salt);

                // Actualizar contraseña
                db.users[i].password = hashedPassword;

                console.log(`✅ Usuario ${i + 1}: ${user.email}`);
                console.log(`   Contraseña original: ${originalPassword}`);
                console.log(`   Hash generado: ${hashedPassword.substring(0, 50)}...`);
                console.log(`   ⚠️  GUARDA LA CONTRASEÑA ORIGINAL: "${originalPassword}"\n`);
            } else {
                console.log(`⏭️  Usuario ${i + 1}: ${user.email} (ya hasheado)\n`);
            }
        }

        // Guardar archivo actualizado
        fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf8');

        console.log('✨ ¡Proceso completado exitosamente!');
        console.log(`📝 Archivo actualizado: ${DB_PATH}\n`);

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('⚠️  IMPORTANTE:');
        console.log('   - Las contraseñas han sido encriptadas');
        console.log('   - NO ejecutes este script nuevamente');
        console.log('   - Guarda las contraseñas originales mostradas arriba');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

// Ejecutar
hashPasswords();
