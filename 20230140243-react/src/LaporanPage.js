import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const API_URL = 'http://localhost:3001/api/presensi';

function LaporanPage() {
    const [laporan, setLaporan] = useState([]);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    // Fungsi untuk memformat tanggal
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString('id-ID', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
    };

    const fetchLaporan = async () => {
        setError(null);
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token'); 
            
            // Verifikasi role (opsional, tapi disarankan untuk halaman admin)
            if (!token) {
                 navigate('/login');
                 return;
            }
            const decoded = jwtDecode(token);
            if (decoded.role !== 'admin') {
                setError('Akses ditolak. Anda bukan Administrator.');
                setIsLoading(false);
                return;
            }

            const response = await axios.get(
                API_URL,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                } 
            );
            setLaporan(response.data.presensi); 
            setError(null);
        } catch (err) {
            setError(err.response ? err.response.data.message : 'Gagal mengambil laporan presensi');
            setLaporan([]);
        } finally {
            setIsLoading(false);
        }
    };
    
    // Auto-fetch data saat halaman dimuat
    useEffect(() => {
        // Cek token dan fetch data saat komponen dimuat
        const token = localStorage.getItem('token');
        if (token) {
            fetchLaporan();
        } else {
            navigate('/login');
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps


    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10 px-4">
            
            {/* Header dan Navigasi */}
            <header className="w-full max-w-5xl flex justify-between items-center mb-6">
                <h2 className="text-3xl font-extrabold text-gray-800 tracking-wide">
                    Laporan Presensi 📊
                </h2>
                <Link 
                    to="/dashboard"
                    className="py-2 px-4 bg-gray-500 text-white font-semibold rounded-lg shadow-md hover:bg-gray-600 transition"
                >
                    &larr; Kembali ke Dashboard
                </Link>
            </header>

            {/* Kontrol Aksi dan Feedback */}
            <div className="w-full max-w-5xl mb-6 flex justify-between items-center">
                <button 
                    onClick={fetchLaporan} 
                    disabled={isLoading}
                    className={`px-6 py-2 font-bold text-white rounded-lg shadow-md transition ${
                        isLoading ? 'bg-gray-400 cursor-wait' : 'bg-green-600 hover:bg-green-700'
                    }`}
                >
                    {isLoading ? 'Memuat Data...' : 'Segarkan Data Laporan'}
                </button>
                {error && (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3" role="alert">
                        <p className="text-sm font-medium">{error}</p>
                    </div>
                )}
            </div>

            {/* Container Tabel Laporan */}
            <div className="w-full max-w-5xl bg-white p-8 rounded-xl shadow-2xl overflow-x-auto">
                {laporan.length === 0 && !isLoading && !error ? (
                    <p className="text-center text-gray-500 py-10">Tidak ada data presensi yang ditemukan.</p>
                ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                        {/* Header Tabel */}
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                    ID
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                    Nama Pengguna
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                    Check In (Masuk)
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                    Check Out (Keluar)
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                    Status
                                </th>
                            </tr>
                        </thead>
                        
                        {/* Isi Tabel */}
                        <tbody className="bg-white divide-y divide-gray-100">
                            {laporan.map((item, index) => (
                                <tr key={item.id} className="hover:bg-gray-50 transition duration-100">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {index + 1}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {item.User ? item.User.nama : 'Pengguna Dihapus'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                                        {formatDate(item.checkIn)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        {item.checkOut ? (
                                            <span className="text-red-600">{formatDate(item.checkOut)}</span>
                                        ) : (
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                                Active
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {item.checkOut ? 'Selesai' : 'Berjalan'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
                
            </div>
            
        </div>
    );
}

export default LaporanPage;