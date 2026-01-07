const fs = require('fs');
const { Pool } = require('pg');
require('dotenv').config();

// Konfigurasi koneksi database
const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'pokedex_db',
    password: process.env.DB_PASSWORD || 'password_anda', // Ganti nanti di .env
    port: process.env.DB_PORT || 5432,
});

// Baca file JSON
const rawData = fs.readFileSync('./pokemon.json');
const pokemons = JSON.parse(rawData);

const createTableQuery = `
  CREATE TABLE IF NOT EXISTS pokemon (
    id INTEGER PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    type_1 VARCHAR(20) NOT NULL,
    type_2 VARCHAR(20),
    hp INTEGER,
    attack INTEGER,
    defense INTEGER,
    special_attack INTEGER,
    special_defense INTEGER,
    speed INTEGER,
    sprite_front TEXT,
    artwork TEXT
  );

  CREATE TABLE IF NOT EXISTS votes (
    id SERIAL PRIMARY KEY,
    pokemon_id INTEGER REFERENCES pokemon(id),
    visitor_id VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(pokemon_id, visitor_id)
  );
`;

const seedData = async () => {
    try {
        console.log('🔄 Menghubungkan ke database...');
        await pool.query(createTableQuery);
        console.log('✅ Tabel berhasil dibuat/dipastikan ada.');

        console.log('🔄 Mulai memasukkan data Pokemon...');

        // Loop data dan insert satu per satu
        for (const p of pokemons) {
            const insertQuery = `
        INSERT INTO pokemon (id, name, type_1, type_2, hp, attack, defense, special_attack, special_defense, speed, sprite_front, artwork)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        ON CONFLICT (id) DO NOTHING;
      `;

            const values = [
                p.id, p.name, p.type_1, p.type_2 || null,
                p.hp, p.attack, p.defense, p.special_attack, p.special_defense, p.speed,
                p.sprite_front, p.artwork
            ];

            await pool.query(insertQuery, values);
        }

        console.log(`🎉 Berhasil memasukkan ${pokemons.length} Pokemon ke database!`);
    } catch (err) {
        console.error('❌ Terjadi Error:', err);
    } finally {
        pool.end();
    }
};

seedData();