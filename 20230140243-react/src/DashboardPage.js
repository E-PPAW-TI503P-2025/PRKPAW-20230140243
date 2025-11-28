import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

// Import ikon dan CSS Leaflet
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import 'leaflet/dist/leaflet.css'; 

// Workaround untuk memperbaiki ikon Leaflet yang hilang
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const API_URL = 'http://localhost:3001/api/presensi';

function PresensiPage() {
    const [coords, setCoords] = useState(null);
    const [userName, setUserName] = useState('Pengguna');
    const [userRole, setUserRole] = useState('');
    const [error, setError] = useState(null);
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    // Pastikan handleLogout didefinisikan dengan useCallback karena akan digunakan di useEffect
    const handleLogout = useCallback(() => {
        localStorage.removeItem('token');
        navigate('/login'); 
    }, [navigate]);

    const getLocation = () => {
        setError(null);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setCoords({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                (error) => {
                    if (error.code === error.PERMISSION_DENIED) {
                        setError("Akses lokasi ditolak. Mohon izinkan akses lokasi.");
                    } else if (error.code === error.POSITION_UNAVAILABLE) {
                        setError("Informasi lokasi tidak tersedia.");
                    } else {
                        setError("Gagal mendapatkan lokasi: " + error.message);
                    }
                    setCoords(null); 
                }
            );
        } else {
            setError("Geolocation tidak didukung oleh browser ini.");
            setCoords(null);
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

    const handleCheckIn = async (e) => {
        e.preventDefault();
        setError(null);
        setMessage(null);
        
        if (!coords) {
            showTempMessage("Lokasi belum didapatkan. Mohon izinkan akses lokasi dan coba lagi.", true);
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `${API_URL}/checkin`,
                {
                    // Wajib kirim lokasi
                    latitude: coords.lat, 
                    longitude: coords.lng 
                },
                {headers: {
                    Authorization: `Bearer ${token}`,
                }} 
            );
            showTempMessage(response.data.message || 'Check-in Berhasil!');
        } catch (err) {
            showTempMessage(err.response ? err.response.data.message : 'Check-in gagal. Coba lagi.', true);
        }
    };

    const handleCheckOut = async (e) => {
        e.preventDefault();
        setError(null);
        setMessage(null);

        if (!coords) {
            showTempMessage("Lokasi belum didapatkan. Mohon refresh lokasi.", true);
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `${API_URL}/checkout`,
                {
                    // Wajib kirim lokasi check out
                    latitude: coords.lat, 
                    longitude: coords.lng 
                },
                {
                    headers: {  
                        Authorization: `Bearer ${token}`,
                    },
                } 
            );
            showTempMessage(response.data.message || 'Check-out Berhasil!');
        } catch (err) {
            showTempMessage(err.response ? err.response.data.message : 'Check-out gagal. Coba lagi.', true);
        }
    };

    const handleViewPresensi = (e) => {
        e.preventDefault();
        // Route yang benar ke halaman laporan
        navigate('/laporan'); 
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            handleLogout();
            return;
        }
        
        try {
            const decoded = jwtDecode(token);
            setUserName(decoded.nama || 'Pengguna');
            setUserRole(decoded.role || 'mahasiswa');

            if (decoded.exp * 1000 < Date.now()) {
                handleLogout();
            }

        } catch (err) { 
            console.error('Token tidak valid:', err);
            handleLogout();
        }

        getLocation(); 
    }, [handleLogout]); // Tambahkan handleLogout sebagai dependency


    return (    
        <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4">
            
            {/* Header / Navigasi Cepat */}
            <header className="w-full max-w-xl flex justify-between items-center py-4 px-2 mb-4">
                <h1 className="text-2xl font-extrabold text-green-700">Absensi App ⏰</h1>
                <button
                    onClick={handleLogout}
                    className="py-1 px-4 text-sm bg-red-500 text-white font-semibold rounded-full shadow hover:bg-red-600 transition"
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
                    <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-3" role="alert">
                        <p className="text-sm font-medium">{message}</p>
                    </div>
                )}
                {error && (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3" role="alert">
                        <p className="text-sm font-medium">{error}</p>
                    </div>
                )}

                {/* Status Lokasi dan Peta */}
                <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                        Lokasi Saat Ini 📍
                        <button onClick={getLocation} className="ml-3 text-sm text-blue-500 hover:text-blue-700 font-normal">
                            (Refresh Lokasi)
                        </button>
                    </h3>
                    
                    {coords ? (
                        <p className="text-sm text-green-600 font-medium">
                            Status: Lokasi ditemukan. Lat: {coords.lat.toFixed(4)}, Lng: {coords.lng.toFixed(4)}
                        </p>
                    ) : (
                        <p className="text-sm text-red-500 font-medium">
                            Status: Lokasi belum ditemukan atau akses ditolak.
                        </p>
                    )}

                    {/* Visualisasi Peta OSM (Gradien + Ukuran seperti gambar) */}
                    {coords && (
                        <div className="p-1.5 rounded-xl shadow-2xl overflow-hidden" 
                             style={{ 
                                 // Gradien yang meniru efek ungu/biru di gambar
                                 background: 'linear-gradient(to right, #8a2be2, #4169e1, #dda0dd)', 
                                 boxShadow: '0 4px 10px rgba(0,0,0,0.2)' 
                             }}>
                            
                            <div className="rounded-lg overflow-hidden border border-gray-100">
                                <MapContainer 
                                    key={`${coords.lat}-${coords.lng}`} 
                                    center={[coords.lat, coords.lng]} 
                                    zoom={17} 
                                    scrollWheelZoom={false} 
                                    style={{ height: '200px', width: '100%' }}> 
                                    
                                    <TileLayer 
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                                    />
                                    
                                    <Marker position={[coords.lat, coords.lng]}>
                                        <Popup>Lokasi Anda</Popup>
                                    </Marker>
                                </MapContainer>
                            </div>
                        </div>
                    )}

                </div>

                {/* Aksi Presensi */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                    <button
                        onClick={handleCheckIn}
                        disabled={!coords} 
                        className={`py-3 px-4 text-white font-bold rounded-lg shadow-md transition ${
                            coords ? 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500' : 'bg-gray-400 cursor-not-allowed'
                        }`}
                    >
                        Check In Masuk 🟢
                    </button>
                    <button
                        onClick={handleCheckOut}
                        disabled={!coords}
                        className={`py-3 px-4 text-white font-bold rounded-lg shadow-md transition ${
                            coords ? 'bg-orange-600 hover:bg-orange-700 focus:ring-orange-500' : 'bg-gray-400 cursor-not-allowed'
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
                            className="w-full py-2 px-4 bg-purple-600 text-white font-semibold rounded-lg shadow-md hover:bg-purple-700 transition"
                        >
                            Lihat Riwayat & Data Presensi 📊
                        </button>
                    </div>   
                )}

            </div>
        </div>
    );
}

export default PresensiPage;