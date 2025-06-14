const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

// Serve static files (e.g., index.html)
app.use(express.static(path.join(__dirname, 'public')));

// Data penyimpanan marker sementara di memori
let markers = {};

// Saat klien terhubung
io.on('connection', (socket) => {
  console.log('🔌 New client connected');

  // Kirim data marker saat koneksi pertama
  socket.emit('markersUpdate', markers);

  // Tambah marker baru
  socket.on('addMarker', (data) => {
    const id = data.id || Date.now().toString();
    markers[id] = {
      lat: data.lat,
      lng: data.lng,
      name: data.name || 'Tanpa Nama',
      votes: 0
    };
    io.emit('markersUpdate', markers);
  });

  // Voting marker
  socket.on('voteMarker', (id) => {
    if (markers[id]) {
      markers[id].votes += 1;
      io.emit('markersUpdate', markers);
    }
  });

  // Hapus marker
  socket.on('deleteMarker', (id) => {
    if (markers[id]) {
      delete markers[id];
      io.emit('markersUpdate', markers);
    }
  });

  // Saat user disconnect
  socket.on('disconnect', () => {
    console.log('❌ Client disconnected');
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
