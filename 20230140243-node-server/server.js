const express = require("express");
const cors = require("cors");
const app = express();
const PORT = 3001;
const morgan = require("morgan");
const path = require('path'); 
// --- PERBAIKAN: Impor instance sequelize dari models/index.js ---
const { sequelize } = require('./models');

// Impor router
const presensiRoutes = require("./routes/presensi");
const reportRoutes = require("./routes/reports");
const authRoutes = require("./routes/auth");


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use((req, res, next) => {
console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
next();
});
app.get("/", (req, res) => {
res.send("Home Page for API");
});
const ruteBuku = require("./routes/books");
app.use("/api/books", ruteBuku);
app.use("/api/attendance", presensiRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/auth", authRoutes);

// --- PERBAIKAN: Memanggil sequelize.sync() setelah berhasil diimpor ---
// { force: true } akan menghapus tabel yang ada dan membuatnya ulang sesuai model.
sequelize.sync().then(() => { 
console.log("Database synced successfully. Starting server...");

app.listen(PORT, () => {
 console.log(`Express server running at http://localhost:${PORT}/`);
});
}).catch(err => {
 console.error('Failed to sync database. Server will not start:', err);
});