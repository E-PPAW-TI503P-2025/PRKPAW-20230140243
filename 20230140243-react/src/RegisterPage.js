import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom'; // Import Link

function RegisterPage() {
  // KOREKSI: Ganti 'name' menjadi 'nama'
  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('mahasiswa'); // Default role: mahasiswa
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null); // State untuk pesan sukses
  const navigate = useNavigate();

  const showMessage = (msg, type = 'error') => {
    if (type === 'success') {
      setSuccess(msg);
      setError(null);
      setTimeout(() => setSuccess(null), 5000);
    } else {
      setError(msg);
      setSuccess(null);
      setTimeout(() => setError(null), 5000);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      // Endpoint POST /api/auth/register
      const response = await axios.post('http://localhost:3001/api/auth/register', {
        // KOREKSI: Kirim 'nama' ke backend
        nama: nama, 
        email: email,
        password: password,
        role: role,
      });

      // Jika berhasil, tampilkan pesan sukses dan arahkan ke halaman login
      showMessage(response.data.message || 'Registrasi Berhasil! Anda akan diarahkan ke halaman Login.', 'success');
      setTimeout(() => {
        navigate('/login');
      }, 2000); // Tunggu 2 detik sebelum redirect
      
    } catch (err) {
      // Tangani error dari server
      const errorMessage = err.response && err.response.data && err.response.data.message 
        ? err.response.data.message 
        : 'Registrasi gagal. Coba lagi nanti.';
      showMessage(errorMessage, 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md transform transition-all hover:shadow-xl"> {/* Shadow lebih kuat, rounded lebih besar */}
        
        <h2 className="text-3xl font-extrabold text-center mb-6 text-gray-800 tracking-tight"> {/* Font lebih tebal */}
          Daftar Akun Baru 📝
        </h2>

        {/* Pesan Sukses */}
        {success && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4 transition duration-300 ease-in-out" role="alert">
            <p className="font-bold">Berhasil!</p>
            <p>{success}</p>
          </div>
        )}

        {/* Pesan Error */}
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 transition duration-300 ease-in-out" role="alert">
            <p className="font-bold">Gagal!</p>
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5"> {/* Jarak antar form field lebih baik */}
          
          {/* Input Nama */}
          <div>
            <label htmlFor="nama" className="block text-sm font-semibold text-gray-700 mb-1">Nama Lengkap</label> {/* Label lebih jelas */}
            <input
              id="nama"
              type="text"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              required
              placeholder="Masukkan nama lengkap Anda"
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 transition duration-150 ease-in-out"
            />
          </div>

          {/* Input Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="contoh@domain.com"
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 transition duration-150 ease-in-out"
            />
          </div>

          {/* Input Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Minimal 6 karakter"
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 transition duration-150 ease-in-out"
            />
          </div>

          {/* Input Role */}
          <div>
            <label htmlFor="role" className="block text-sm font-semibold text-gray-700 mb-1">Daftar Sebagai:</label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="mt-1 w-full px-4 py-2 border border-gray-300 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 appearance-none transition duration-150 ease-in-out"
            >
              <option value="mahasiswa">Mahasiswa</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-4 bg-green-600 text-white font-bold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-500 focus:ring-opacity-50 transition duration-200 ease-in-out transform hover:scale-[1.01]"
          >
            🚀 Daftarkan Akun
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Sudah punya akun? 
            <Link to="/login" className="text-green-600 hover:text-green-800 font-semibold ml-1 transition duration-150">
              Login di sini.
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}

export default RegisterPage;