import { useEffect, useState } from 'react';
import axios from 'axios';
import { BrowserRouter, Routes, Route, Link, useParams, useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

// --- KOMPONEN KECIL: SEARCH BAR (UKURAN DIPERBAIKI) ---
const SearchBar = ({ onSearch }) => (
  // UBAHAN 1: Lebar saya kunci manual di 500px agar tidak raksasa
  <div className="relative mx-auto mb-8" style={{ width: '500px' }}>
    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
      <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    </div>
    <input
      type="text"
      className="block w-full p-3 pl-10 text-sm text-gray-900 border border-gray-300 rounded-full bg-white/90 backdrop-blur-sm focus:ring-blue-500 focus:border-blue-500 shadow-lg"
      placeholder="Search Pokemon..."
      onChange={(e) => onSearch(e.target.value)}
    />
  </div>
);

// --- KOMPONEN KECIL: PAGINATION BAR ---
const Pagination = ({ page, totalPages, setPage }) => (
  <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t p-4 flex justify-center items-center gap-6 shadow-[0_-5px_20px_rgba(0,0,0,0.1)] z-10">
    <button
      disabled={page === 1}
      onClick={() => setPage(p => p - 1)}
      className="flex items-center px-4 py-2 bg-slate-800 text-white rounded-lg disabled:bg-gray-300 hover:bg-slate-700 transition"
    >
      ← Prev
    </button>

    <span className="font-bold text-slate-800 bg-white px-4 py-1 rounded shadow">
      Page {page} / {totalPages}
    </span>

    <button
      disabled={page === totalPages}
      onClick={() => setPage(p => p + 1)}
      className="flex items-center px-4 py-2 bg-slate-800 text-white rounded-lg disabled:bg-gray-300 hover:bg-slate-700 transition"
    >
      Next →
    </button>
  </div>
);

// --- HALAMAN UTAMA: LIST POKEMON ---
function PokemonList() {
  const [pokemons, setPokemons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchPokemons = async () => {
      try {
        setLoading(true);
        // Mengambil 21 pokemon agar pas dibagi 3 (7 baris)
        const response = await axios.get(`/api/pokemon?page=${page}&limit=21&search=${searchTerm}`, {
          withCredentials: true
        });
        setPokemons(response.data.data);
        setTotalPages(response.data.meta.totalPages);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }

    };
    // Debounce search requests agar tidak flooding server
    const timeoutId = setTimeout(() => {
      fetchPokemons();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [page, searchTerm]);

  // Fungsi handle search biar reset page ke 1 setiap kali ngetik
  const handleSearch = (term) => {
    setSearchTerm(term);
    setPage(1);
  };

  return (
    // Background Gelap Solid (Aman dari error gambar)
    <div className="min-h-screen bg-slate-800 pb-24">
      <div className="min-h-screen p-6">

        <h1 className="text-5xl font-extrabold text-center mb-6 text-white drop-shadow-lg tracking-wider">
          POKÉDEX <span className="text-yellow-400">FAVORITES</span>
        </h1>

        <SearchBar onSearch={handleSearch} />

        {loading ? (
          <div className="text-center text-white text-2xl mt-20 font-bold animate-pulse">Loading...</div>
        ) : (
          <div className="max-w-6xl mx-auto"> {/* Container diperlebar sedikit */}

            {/* UBAHAN 2: Saya paksa grid-cols-3 (tanpa md:) agar selalu 3 kolom */}
            <div className="grid grid-cols-3 gap-8">
              {pokemons.map((p) => (
                <Link to={`/pokemon/${p.id}`} key={p.id} className="group relative">
                  <div className="bg-white/90 rounded-2xl p-6 shadow-xl transform transition duration-300 hover:-translate-y-2 hover:shadow-2xl flex flex-col items-center border border-white/50">

                    <span className="absolute top-3 right-3 text-xs font-bold text-gray-400">#{String(p.id).padStart(3, '0')}</span>

                    <div className="bg-gray-100 rounded-full p-4 mb-4 group-hover:bg-blue-50 transition">
                      <img src={p.sprite_front} alt={p.name} className="w-28 h-28 object-contain drop-shadow-md" />
                    </div>

                    <h2 className="capitalize font-bold text-2xl text-slate-800 mb-2">{p.name}</h2>

                    <div className="flex gap-2 mb-4">
                      <span className="px-3 py-1 rounded-full text-xs font-bold text-white bg-green-500 uppercase">{p.type_1}</span>
                      {p.type_2 && <span className="px-3 py-1 rounded-full text-xs font-bold text-white bg-purple-500 uppercase">{p.type_2}</span>}
                    </div>

                    <div className="flex items-center gap-2 text-gray-600 font-semibold bg-gray-100 px-4 py-1 rounded-full">
                      <span className="text-red-500">❤️</span> {p.vote_count} Favorites
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {pokemons.length === 0 && (
              <div className="text-center text-white text-xl mt-10 bg-white/10 p-4 rounded-lg">
                No Pokemon found.
              </div>
            )}
          </div>
        )}
      </div>

      <Pagination page={page} totalPages={totalPages} setPage={setPage} />
    </div>
  );
}

// --- HALAMAN DETAIL ---
function PokemonDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pokemon, setPokemon] = useState(null);
  const [isVoted, setIsVoted] = useState(false);

  useEffect(() => {
    axios.get(`/api/pokemon/${id}`, { withCredentials: true })
      .then(res => {
        setPokemon(res.data);
        setIsVoted(res.data.is_voted);
      })
      .catch(err => console.error(err));
  }, [id]);

  const handleVote = async () => {
    try {
      const res = await axios.post(`/api/pokemon/${id}/vote`, {}, { withCredentials: true });
      setIsVoted(res.data.is_voted);
      setPokemon(prev => ({
        ...prev,
        vote_count: res.data.is_voted ? prev.vote_count + 1 : prev.vote_count - 1
      }));
    } catch (err) {
      alert("Failed to vote!");
    }
  };

  if (!pokemon) return <div className="text-center mt-20 text-2xl font-bold text-white">Loading Data...</div>;

  const statsData = [
    { name: 'HP', value: pokemon.hp, fill: '#ff6384' },
    { name: 'Attack', value: pokemon.attack, fill: '#36a2eb' },
    { name: 'Defense', value: pokemon.defense, fill: '#ffcd56' },
    { name: 'Sp. Atk', value: pokemon.special_attack, fill: '#4bc0c0' },
    { name: 'Sp. Def', value: pokemon.special_defense, fill: '#9966ff' },
    { name: 'Speed', value: pokemon.speed, fill: '#ff9f40' },
  ];

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden max-w-5xl w-full flex flex-col md:flex-row">

        <div className="md:w-1/2 bg-gradient-to-br from-blue-500 to-cyan-400 p-10 flex flex-col items-center justify-center text-white relative">
          <button onClick={() => navigate('/')} className="absolute top-6 left-6 bg-white text-blue-600 hover:bg-gray-100 px-6 py-2 rounded-full font-bold shadow-lg transition transform hover:scale-105 z-10">
            ← Back
          </button>
          <img src={pokemon.artwork} alt={pokemon.name} className="w-80 h-80 object-contain drop-shadow-2xl" />
          <h1 className="text-5xl font-black capitalize mt-6">{pokemon.name}</h1>
          <div className="flex gap-3 mt-4">
            <span className="bg-white/20 px-4 py-1 rounded-full font-bold uppercase tracking-wide">{pokemon.type_1}</span>
            {pokemon.type_2 && <span className="bg-white/20 px-4 py-1 rounded-full font-bold uppercase tracking-wide">{pokemon.type_2}</span>}
          </div>
        </div>

        <div className="md:w-1/2 p-10 bg-slate-50">
          <div className="flex justify-between items-center mb-8 border-b pb-4">
            <h2 className="text-2xl font-bold text-slate-800">Base Statistics</h2>
            <div className="text-right">
              <p className="text-sm text-gray-500">Community Favorites</p>
              <p className="text-3xl font-bold text-blue-600">{pokemon.vote_count}</p>
            </div>
          </div>

          <div style={{ width: '100%', height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statsData} layout="vertical" margin={{ left: 20 }}>
                <XAxis type="number" hide domain={[0, 150]} />
                <YAxis dataKey="name" type="category" width={60} tick={{ fontSize: 12, fontWeight: 'bold' }} />
                <Tooltip cursor={{ fill: 'transparent' }} />
                <Bar dataKey="value" radius={[0, 5, 5, 0]}>
                  {statsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <button
            onClick={handleVote}
            className={`w-full mt-8 py-4 rounded-xl font-bold text-lg shadow-lg transform transition active:scale-95 flex justify-center items-center gap-3 ${isVoted
              ? 'bg-red-50 text-red-600 border-2 border-red-500 hover:bg-red-100'
              : 'bg-slate-800 text-white hover:bg-slate-900'
              }`}
          >
            {isVoted ? (
              <><span>❤️</span> Voted as Favorite</>
            ) : (
              <><span>🤍</span> Vote for {pokemon.name}</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PokemonList />} />
        <Route path="/pokemon/:id" element={<PokemonDetail />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;