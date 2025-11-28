import React, { useState, useEffect } from 'react';

const MOCK_USER_DATA = {
    nama: 'Budi Santoso (Mock)',
    role: 'mahasiswa',
    isLoggedIn: true,
};

// Asumsi pengguna selalu masuk, karena tidak ada logic login
const getMockUser = () => MOCK_USER_DATA;


function App() {
    const [coords, setCoords] = useState(null);
    const [userName, setUserName] = useState('Pengguna');
    const [userRole, setUserRole] = useState('');
    const [error, setError] = useState(null);
    const [message, setMessage] = useState('');
    const [isViewReport, setIsViewReport] = useState(false); // Mengganti useNavigate

    // Menggantikan logic auth/token
    useEffect(() => {
        const user = getMockUser();
        if (user.isLoggedIn) {
            setUserName(user.nama);
            setUserRole(user.role);
            // Panggil getLocation saat komponen dimuat
            getLocation(); 
        } else {
            // Dalam aplikasi nyata, ini akan mengarahkan ke halaman login
            setUserName('Tamu');
            setUserRole('');
        }
    }, []);

    const getLocation = () => {
        setError(null);
        setMessage('Mencari lokasi dengan akurasi tinggi...');
        
        if (navigator.geolocation) {
            // Objek Opsi untuk getCurrentPosition
            const options = {
                // *** PERBAIKAN AKURASI: Aktifkan akurasi tinggi ***
                enableHighAccuracy: true, 
                // Maksimal 5 detik untuk mendapatkan lokasi
                timeout: 5000, 
                // Tidak menggunakan cache lokasi lama
                maximumAge: 0 
            };
            
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setCoords({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                        accuracy: position.coords.accuracy // Tambahkan data akurasi
                    });
                    setMessage(`Lokasi ditemukan! Akurasi: ±${position.coords.accuracy.toFixed(2)} meter.`);
                },
                (error) => {
                    if (error.code === error.PERMISSION_DENIED) {
                        setError("Akses lokasi ditolak. Mohon izinkan akses lokasi di browser Anda.");
                    } else if (error.code === error.POSITION_UNAVAILABLE) {
                        setError("Informasi lokasi tidak tersedia.");
                    } else if (error.code === error.TIMEOUT) {
                        setError("Pencarian lokasi timeout. Coba refresh lokasi lagi.");
                    } else {
                        setError("Gagal mendapatkan lokasi: " + error.message);
                    }
                    setCoords(null);
                    setMessage(null);
                },
                options // Pass options
            );
        } else {
            setError("Geolocation tidak didukung oleh browser ini.");
            setCoords(null);
            setMessage(null);
        }
    };

    const showTempMessage = (msg, isError = false) => {
        if (isError) {
            setError(msg);
            setTimeout(() => setError(null), 5000);
        } else {
            setMessage(msg);
            setTimeout(() => setMessage(null), 5000);
        }
    };

    // Fungsi Mock Check-In (Menggantikan axios POST)
    const handleCheckIn = (e) => {
        e.preventDefault();
        setError(null);
        setMessage(null);
        
        if (!coords) {
            showTempMessage("Lokasi belum didapatkan. Mohon coba refresh lokasi.", true);
            return;
        }

        // Simulasikan panggilan API yang berhasil
        setTimeout(() => {
            showTempMessage(`[MOCK SUCCESS] Check-in Berhasil pada ${new Date().toLocaleTimeString()}!`);
        }, 800);
    };

    // Fungsi Mock Check-Out (Menggantikan axios POST)
    const handleCheckOut = (e) => {
        e.preventDefault();
        setError(null);
        setMessage(null);
        
        // Simulasikan panggilan API yang berhasil
        setTimeout(() => {
            showTempMessage(`[MOCK SUCCESS] Check-out Berhasil pada ${new Date().toLocaleTimeString()}!`);
        }, 800);
    };

    const handleViewPresensi = (e) => {
        e.preventDefault();
        setIsViewReport(true); // Ganti view
    };

    const handleLogout = () => {
        // Dalam aplikasi nyata, ini akan menghapus token dan mengarahkan ke login
        setUserName('Tamu');
        setUserRole('');
        setIsViewReport(false);
        // Mengganti alert() dengan pesan di konsol atau custom modal
        console.log("Logout berhasil (simulasi).");
    }
    
    // Tampilan Halaman Laporan (Sederhana)
    if (isViewReport) {
        return (
            <div className="min-h-screen bg-gray-50 p-4">
                <div className="max-w-xl mx-auto bg-white p-6 rounded-xl shadow-2xl space-y-4">
                    <h1 className="text-3xl font-extrabold text-purple-700">Laporan Presensi (Admin View)</h1>
                    <p className="text-gray-600">Ini adalah tampilan simulasi untuk data presensi yang akan diisi oleh API.</p>
                    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 space-y-2">
                        <h4 className="font-semibold">Data Contoh Hari Ini:</h4>
                        <ul className="text-sm space-y-1">
                            <li>- User A: Check-in 07:45, Check-out Belum</li>
                            <li>- User B: Check-in 08:05, Check-out 16:30</li>
                            <li>- User C: Check-in 07:58, Check-out 17:01</li>
                        </ul>
                    </div>
                    <button
                        onClick={() => setIsViewReport(false)}
                        className="w-full py-2 px-4 bg-purple-600 text-white font-semibold rounded-lg shadow-md hover:bg-purple-700 transition"
                    >
                        &larr; Kembali ke Halaman Presensi
                    </button>
                </div>
            </div>
        );
    }

    return (    
        <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4 font-sans">
            <style>
                {`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap');
                .font-sans { font-family: 'Inter', sans-serif; }
                .map-container-iframe { 
                    border-radius: 0.75rem; /* rounded-xl */
                    height: 400px; 
                    width: 100%;
                    border: none;
                }
                `}
            </style>
            
            {/* Header / Navigasi Cepat */}
            <header className="w-full max-w-xl flex justify-between items-center py-4 px-2 mb-4">
                <h1 className="text-2xl font-extrabold text-green-700">Absensi App ⏰</h1>
                <button
                    onClick={handleLogout}
                    className="py-1 px-4 text-sm bg-red-500 text-white font-semibold rounded-full shadow hover:bg-red-600 transition duration-200 ease-in-out"
                >
                    Keluar
                </button>
            </header>
            
            {/* Main Content Card */}
            <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-xl space-y-6">
                
                {/* Info Pengguna */}
                <div className="border-b pb-4 border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-800">Halo, {userName}!</h2>
                    <p className="text-sm text-gray-500 capitalize">Role: {userRole}</p>
                </div>

                {/* Status dan Feedback */}
                {message && (
                    <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-3 rounded-md" role="alert">
                        <p className="text-sm font-medium">{message}</p>
                    </div>
                )}
                {error && (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 rounded-md" role="alert">
                        <p className="text-sm font-medium">{error}</p>
                    </div>
                )}

                {/* Status Lokasi dan Peta */}
                <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                        Lokasi Saat Ini 📍
                        <button 
                            onClick={getLocation} 
                            className="ml-3 text-sm text-blue-500 hover:text-blue-700 font-normal underline transition"
                        >
                            {message && message.includes('Mencari lokasi') ? 'Mencari...' : '(Refresh Lokasi)'}
                        </button>
                    </h3>
                    
                    {coords ? (
                        <>
                            <p className="text-sm text-green-600 font-medium bg-green-50 p-2 rounded-md border border-green-200">
                                Status: Lokasi ditemukan. 
                                Lat: {coords.lat.toFixed(6)}, 
                                Lng: {coords.lng.toFixed(6)}
                                {coords.accuracy && <span className="block mt-1 text-xs text-gray-700">Akurasi Perkiraan: ±{coords.accuracy.toFixed(2)} meter.</span>}
                            </p>
                            {/* Visualisasi Peta menggunakan Google Maps Iframe */}
                            <div className="rounded-xl overflow-hidden shadow-lg border-4 border-blue-200">
                                <iframe
                                    className="map-container-iframe"
                                    loading="lazy"
                                    allowFullScreen
                                    referrerPolicy="no-referrer-when-downgrade"
                                    // URL Google Maps Embed dengan marker di lokasi pengguna
                                    src={`https://maps.google.com/maps?q=${coords.lat},${coords.lng}&z=17&output=embed`}
                                    title="Peta Lokasi Anda"
                                ></iframe>
                            </div>
                        </>
                    ) : (
                        <p className="text-sm text-red-500 font-medium bg-red-50 p-2 rounded-md border border-red-200">
                            Status: Lokasi belum ditemukan atau akses ditolak.
                        </p>
                    )}
                </div>

                {/* Aksi Presensi */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                    <button
                        onClick={handleCheckIn}
                        disabled={!coords || message.includes('Mencari lokasi')} 
                        className={`py-3 px-4 text-white font-bold rounded-lg shadow-xl transition duration-200 ease-in-out transform hover:scale-105 ${
                            (coords && !message.includes('Mencari lokasi')) ? 'bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300' : 'bg-gray-400 cursor-not-allowed'
                        }`}
                    >
                        Check In Masuk 🟢
                    </button>
                    <button
                        onClick={handleCheckOut}
                        disabled={!coords || message.includes('Mencari lokasi')}
                        className={`py-3 px-4 text-white font-bold rounded-lg shadow-xl transition duration-200 ease-in-out transform hover:scale-105 ${
                            (coords && !message.includes('Mencari lokasi')) ? 'bg-orange-600 hover:bg-orange-700 focus:ring-4 focus:ring-orange-300' : 'bg-gray-400 cursor-not-allowed'
                        }`}
                    >
                        Check Out Keluar 🔴
                    </button>
                </div>
                
                {/* Tombol Admin (Lihat Data) */}
                {userRole === 'admin' && (
                    <div className="pt-2">
                        <button
                            onClick={handleViewPresensi}
                            className="w-full py-3 px-4 bg-purple-600 text-white font-semibold rounded-lg shadow-lg hover:bg-purple-700 transition duration-200 ease-in-out"
                        >
                            Lihat Riwayat & Data Presensi 📊
                        </button>
                    </div> 
                )}

            </div>
        </div>
    );
}

export default App;