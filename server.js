const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));

// Object untuk menyimpan semua marker, key = id marker
let markers = {};

io.on('connection', (socket) => {
  // Kirim data marker terbaru saat client connect
  socket.emit('markersUpdate', markers);

  // Tambah marker baru, bisa dengan ID dari client atau generate baru
  socket.on('addMarker', (data) => {
    const id = data.id || Date.now().toString();
    if (!markers[id]) {
      markers[id] = {
        lat: data.lat,
        lng: data.lng,
        votes: 1,
      };
      // Sebarkan update marker ke semua client
      io.emit('markersUpdate', markers);
    }
  });

  // Voting pada marker tertentu
  socket.on('voteMarker', (id) => {
    if (markers[id]) {
      markers[id].votes++;
      io.emit('markersUpdate', markers);
    }
  });

  // Hapus marker berdasarkan id
  socket.on('deleteMarker', (id) => {
    if (markers[id]) {
      delete markers[id];
      io.emit('markersUpdate', markers);
    }
  });

  // Update posisi marker (misal setelah marker digeser)
  socket.on('updateMarkerPosition', ({ id, lat, lng }) => {
    if (markers[id]) {
      markers[id].lat = lat;
      markers[id].lng = lng;
      // Kirim data marker terbaru ke semua client
      io.emit('markersUpdate', markers);
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
