import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function ReportPage() {
  const [reports, setReports] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  // State untuk menyimpan URL foto yang dipilih untuk ditampilkan di modal
  const [selectedImage, setSelectedImage] = useState(null);

  /**
   * Mengambil data laporan presensi dari backend
   * @param {string} query - Nama yang digunakan untuk filter
   */
  const fetchReports = async (query) => {
    const token = localStorage.getItem("token");
    if (!token) {
      // Pindahkan ke halaman login jika tidak ada token
      navigate("/login");
      return;
    }

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      // Catatan: endpoint harus sesuai dengan backend Express Anda (misalnya /api/reports/daily)
      const baseUrl = "http://localhost:3001/api/reports/daily";
      const url = query ? `${baseUrl}?nama=${query}` : baseUrl;

      const response = await axios.get(url, config);
      setReports(response.data.data);
      setError(null);
    } catch (err) {
      setReports([]);
      setError(
        err.response ? err.response.data.message : "Gagal mengambil data"
      );
    }
  };

  useEffect(() => {
    fetchReports("");
  }, [navigate]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchReports(searchTerm);
  };

  /**
   * Mengonversi path file dari database menjadi URL yang dapat diakses publik.
   * Path contoh: uploads\1-123456.jpg -> http://localhost:3001/uploads/1-123456.jpg
   * @param {string} path - Path file dari kolom buktiFoto
   * @returns {string | null} URL lengkap ke gambar
   */
  const getImageUrl = (path) => {
    if (!path) return null;
    // Mengganti backslash (\) menjadi slash (/) jika ada (untuk support path Windows/database)
    const cleanPath = path.replace(/\\/g, "/");
    // Pastikan base URL dan port sesuai dengan Express backend Anda
    return `http://localhost:3001/${cleanPath}`;
  };

  // Komponen Modal (Popup) untuk melihat foto ukuran penuh
  const ImageViewerModal = ({ src, onClose }) => {
    if (!src) return null;

    return (
      <div
        className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 transition-opacity duration-300"
        onClick={onClose} // Klik di luar foto untuk tutup
      >
        <div className="relative max-w-3xl w-full">
          <button
            className="absolute -top-10 right-0 text-white text-xl font-bold hover:text-gray-300"
            onClick={onClose}
          >
            Tutup [X]
          </button>
          <img
            src={src}
            alt="Bukti Full"
            className="w-full h-auto max-h-[80vh] rounded-lg shadow-2xl border-2 border-white object-contain"
            onClick={(e) => e.stopPropagation()} // Mencegah klik foto menutup modal
          />
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Laporan Presensi Harian
      </h1>

      <form onSubmit={handleSearchSubmit} className="mb-6 flex space-x-2">
        <input
          type="text"
          placeholder="Cari berdasarkan nama..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
        <button
          type="submit"
          className="py-2 px-4 bg-blue-600 text-white font-semibold rounded-md shadow-sm hover:bg-blue-700 transition duration-150"
        >
          Cari
        </button>
      </form>

      {error && (
        <p className="text-red-600 bg-red-100 p-4 rounded-md mb-4">{error}</p>
      )}

      {!error && (
        <div className="bg-white shadow-md rounded-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nama
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Check-In
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Check-Out
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Latitude
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Longitude
                </th>
                {/* Kolom Bukti Foto diganti untuk mengakomodasi tombol */}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi Foto
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reports.length > 0 ? (
                reports.map((presensi) => (
                  <tr key={presensi.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {presensi.user ? presensi.user.nama : "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(presensi.checkIn).toLocaleString("id-ID", {
                        timeZone: "Asia/Jakarta",
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {presensi.checkOut
                        ? new Date(presensi.checkOut).toLocaleString("id-ID", {
                              timeZone: "Asia/Jakarta",
                            })
                        : <span className="text-yellow-600 font-semibold">Belum Check-Out</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {presensi.latitude || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {presensi.longitude || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center space-x-2">
                        {presensi.buktiFoto ? (
                          // Thumbnail Foto (tidak bisa diklik lagi)
                          <img
                            src={getImageUrl(presensi.buktiFoto)}
                            alt="Bukti Presensi"
                            className="h-10 w-10 rounded-lg object-cover border-2 border-gray-300 shadow-sm"
                          />
                        ) : (
                          <span className="text-xs text-gray-400">
                            Tidak ada
                          </span>
                        )}
                        {presensi.buktiFoto && (
                          // Tombol baru untuk menampilkan foto
                          <button
                            type="button"
                            className="py-1 px-3 text-xs bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition duration-150"
                            onClick={() =>
                              setSelectedImage(getImageUrl(presensi.buktiFoto))
                            }
                          >
                            Lihat Foto
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-10 text-center text-gray-500"
                  >
                    Tidak ada data presensi yang ditemukan untuk hari ini atau kriteria pencarian ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal untuk melihat foto ukuran penuh */}
      <ImageViewerModal 
        src={selectedImage} 
        onClose={() => setSelectedImage(null)} 
      />
    </div>
  );
}

export default ReportPage;