const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// === 1. KONFIGURASI DATABASE ===
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// === 2. MIDDLEWARE (Perantara) ===
// Agar frontend (port 5173 nanti) boleh akses backend ini
app.use(cors({
    origin: 'http://localhost:5173', // Alamat React nanti
    credentials: true // Izinkan kirim cookie
}));
app.use(express.json()); // Agar bisa baca JSON dari request body
app.use(cookieParser()); // Agar bisa baca cookie dari browser

// === 3. HELPER FUNCTION: TRACKING VISITOR ===
// Fungsi ini akan dijalankan di setiap request untuk mengecek identitas user
const getVisitorId = (req, res) => {
    let visitorId = req.cookies.visitor_id;

    // Jika user belum punya ID, kita buatkan ID baru (random)
    if (!visitorId) {
        visitorId = crypto.randomUUID();
        // Simpan ID ini di browser user sebagai cookie (berlaku 1 tahun)
        res.cookie('visitor_id', visitorId, { maxAge: 31536000000, httpOnly: true });
    }
    return visitorId;
};

// === 4. ROUTE API ===

// GET /api/pokemon -> Mengambil daftar Pokemon (Pagination)
app.get('/api/pokemon', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const search = req.query.search || '';
        const offset = (page - 1) * limit;

        // Query params array (Limit dan Offset selalu ada di index 0 dan 1)
        const queryParams = [limit, offset];

        // Jika ada search, tambahkan parameter ke-3
        if (search) {
            queryParams.push(`%${search}%`);
        }

        const query = `
      SELECT p.id, p.name, p.type_1, p.type_2, p.sprite_front, p.artwork,
             COUNT(v.id)::int as vote_count
      FROM pokemon p
      LEFT JOIN votes v ON p.id = v.pokemon_id
      ${search ? 'WHERE p.name ILIKE $3' : ''}
      GROUP BY p.id
      ORDER BY p.id ASC
      LIMIT $1 OFFSET $2
    `;

        const result = await pool.query(query, queryParams);

        // Hitung total pokemon (dengan filter search jika ada)
        let countQuery = 'SELECT COUNT(*) FROM pokemon p';
        let countParams = [];

        if (search) {
            countQuery += ' WHERE p.name ILIKE $1';
            countParams.push(`%${search}%`);
        }

        const totalResult = await pool.query(countQuery, countParams);
        const totalItems = parseInt(totalResult.rows[0].count);

        res.json({
            data: result.rows,
            meta: {
                currentPage: page,
                totalPages: Math.ceil(totalItems / limit),
                totalItems
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server Error' });
    }
});

// GET /api/pokemon/:id -> Detail satu Pokemon + Status Vote User
app.get('/api/pokemon/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const visitorId = getVisitorId(req, res); // Ambil ID user dari cookie

        // Ambil detail pokemon + total vote
        const pokemonQuery = `
      SELECT p.*, COUNT(v.id)::int as vote_count
      FROM pokemon p
      LEFT JOIN votes v ON p.id = v.pokemon_id
      WHERE p.id = $1
      GROUP BY p.id
    `;

        // Cek apakah user ini (visitorId) sudah vote pokemon ini?
        const userVoteQuery = `
      SELECT 1 FROM votes WHERE pokemon_id = $1 AND visitor_id = $2
    `;

        const pokemonResult = await pool.query(pokemonQuery, [id]);
        const voteResult = await pool.query(userVoteQuery, [id, visitorId]);

        if (pokemonResult.rows.length === 0) {
            return res.status(440).json({ error: 'Pokemon not found' });
        }

        const pokemon = pokemonResult.rows[0];
        // Tambahkan field 'is_voted' (true/false) agar frontend tahu tombolnya harus merah/abu
        pokemon.is_voted = voteResult.rows.length > 0;

        res.json(pokemon);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server Error' });
    }
});

// POST /api/pokemon/:id/vote -> Toggle Vote (Like/Unlike)
app.post('/api/pokemon/:id/vote', async (req, res) => {
    try {
        const { id } = req.params;
        const visitorId = getVisitorId(req, res); // Penting: Identifikasi siapa yang nge-vote

        // Cek dulu, sudah vote belum?
        const checkVote = await pool.query(
            'SELECT * FROM votes WHERE pokemon_id = $1 AND visitor_id = $2',
            [id, visitorId]
        );

        if (checkVote.rows.length > 0) {
            // Kalau sudah ada -> Hapus (UNVOTE)
            await pool.query(
                'DELETE FROM votes WHERE pokemon_id = $1 AND visitor_id = $2',
                [id, visitorId]
            );
            res.json({ message: 'Unvoted', is_voted: false });
        } else {
            // Kalau belum ada -> Tambah (VOTE)
            await pool.query(
                'INSERT INTO votes (pokemon_id, visitor_id) VALUES ($1, $2)',
                [id, visitorId]
            );
            res.json({ message: 'Voted', is_voted: true });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server Error' });
    }
});

// Jalankan Server
app.listen(port, () => {
    console.log(`🚀 Server berjalan di http://localhost:${port}`);
});


module.exports = app;