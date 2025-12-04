import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom'; 

const API_URL = 'http://localhost:3001/api/auth/login';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await axios.post(API_URL, {
        email: email,
        password: password
      });

      const token = response.data.token;
      // Simpan token ke localStorage
      localStorage.setItem('token', token);

      // Arahkan ke dashboard
      navigate('/dashboard');

    } catch (err) {
      // Tangani error dan tampilkan di UI
      setError(err.response && err.response.data && err.response.data.message 
        ? err.response.data.message 
        : 'Login gagal. Periksa kembali email dan password Anda.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      {/* Container Card Login */}
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md transform transition-all hover:shadow-xl">
        
        <h2 className="text-3xl font-extrabold text-center mb-8 text-gray-800 tracking-tight">
          Masuk ke Akun Anda 🔑
        </h2>
        
        {/* Pesan Error */}
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-5 transition duration-300 ease-in-out" role="alert">
            <p className="font-bold">Error!</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* INPUT EMAIL */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-gray-700 mb-1"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="contoh@domain.com"
              // Warna focus ring diubah menjadi GREEN (konsisten dengan Register)
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 transition duration-150 ease-in-out"
            />
          </div>

          {/* INPUT PASSWORD */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-semibold text-gray-700 mb-1"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Masukkan password Anda"
              // Warna focus ring diubah menjadi GREEN (konsisten dengan Register)
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 transition duration-150 ease-in-out"
            />
          </div>

          {/* TOMBOL LOGIN */}
          <button
            type="submit"
            // Warna tombol LOGIN tetap BLUE untuk membedakan aksi utama (misal: Aksi sekunder menggunakan Green)
            className="w-full py-2.5 px-4 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 transition duration-200 ease-in-out transform hover:scale-[1.01]"
          >
            Masuk
          </button>
        </form>

        {/* Tombol/Link Register di bawah form */}
        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-600 mb-3">
            Belum punya akun?
          </p>
          <Link 
            to="/register" 
            // Menggunakan warna GREEN yang kuat untuk konsistensi dengan branding Register
            className="inline-block py-2 px-8 bg-green-600 text-white font-bold rounded-full shadow-lg hover:bg-green-700 transition duration-150 transform hover:scale-105"
          >
            DAFTAR SEKARANG
          </Link>
        </div>
        
      </div>
    </div>
  );
}

export default LoginPage;