import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

function DashboardPage() {
  const [userName, setUserName] = useState('Pengguna');
  const navigate = useNavigate();

  // 1. ADDED: handleLogout function definition (Was missing)
  const handleLogout = () => {
    localStorage.removeItem('token'); // Clear the token
    navigate('/login'); // Redirect to login page
  };
  
  // Fungsi untuk mengambil data dari token JWT yang disimpan
  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (token) {
      try {
        const decoded = jwtDecode(token);
        
        // Fix for server-side 'nama' payload:
        if (decoded.nama) { 
          setUserName(decoded.nama);
        } else {
          setUserName('Pengguna (Nama Tidak Ditemukan)');
        }
      } catch (error) {
        console.error("Token tidak valid:", error);
        localStorage.removeItem('token');
        navigate('/login');
      }
    } else {
      navigate('/login');
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-8">
      <div className="bg-white p-10 rounded-lg shadow-xl text-center border-t-4 border-blue-500">
        <h1 className="text-4xl font-extrabold text-blue-600 mb-2">
          Dashboard Aplikasi
        </h1>
        
        <p className="text-2xl text-gray-800 mb-6">
          Selamat Datang, <span className="text-blue-500 font-bold">{userName}</span>!
        </p>
        
        <p className="text-lg text-gray-600 mb-10">
          Anda berhasil login dan memiliki akses ke halaman ini.
        </p>

        {/* Tombol Logout */}
        <button
          onClick={handleLogout} // Now correctly references the function above
          className="py-2 px-6 bg-red-500 text-white font-semibold rounded-lg shadow-md hover:bg-red-600 transition duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-red-300"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default DashboardPage;