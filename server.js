const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));

// Objek untuk menyimpan semua marker, key = id marker
let markers = {};

io.on('connection', (socket) => {
  // Kirim semua data marker saat client baru terkoneksi
  socket.emit('markersUpdate', markers);

  // Tambah marker baru
  socket.on('addMarker', (data) => {
    const id = data.id || Date.now().toString();

    if (!markers[id]) {
      markers[id] = {
        lat: data.lat,
        lng: data.lng,
        votes: 1,
        name: data.name || "Tanpa Nama"
      };
      io.emit('markersUpdate', markers);
    }
  });

  // Voting marker
  socket.on('voteMarker', (id) => {
    if (markers[id]) {
      markers[id].votes++;
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

  // Update posisi marker (misalnya setelah digeser)
  socket.on('updateMarkerPosition', ({ id, lat, lng }) => {
    if (markers[id]) {
      markers[id].lat = lat;
      markers[id].lng = lng;
      io.emit('markersUpdate', markers);
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
