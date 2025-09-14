document.addEventListener("DOMContentLoaded", () => {
  const socket = io();
  const geofences = window.geofences || [];

  // Initialize map
  const map = L.map("map").setView([0, 0], 2);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "Sital Chandra"
  }).addTo(map);

  const markers = {};
  const geofenceLayers = {};

  // Draw shaded geofence circles
  geofences.forEach(fence => {
    const circle = L.circle([fence.lat, fence.lng], {
      color: "red",
      fillColor: "#f03",
      fillOpacity: 0.2,
      radius: fence.radius
    }).addTo(map);
    geofenceLayers[fence.id] = circle;
  });

  // Check geofence warning
  function checkGeofences() {
    geofences.forEach(fence => {
      let insideCount = 0;
      Object.values(markers).forEach(marker => {
        if(marker && marker.getLatLng().distanceTo([fence.lat, fence.lng]) <= fence.radius) {
          insideCount++;
        }
      });
      const header = document.getElementById("warning-header");
      if(insideCount > 0) {
        header.style.display = "block";
        header.textContent = `⚠️ ${insideCount} people are inside ${fence.name}`;
      } else {
        header.style.display = "none";
      }
    });
  }

  // Own marker key
  let ownKey = "self";

  // Watch user's own location safely
  if (navigator.geolocation && typeof navigator.geolocation.watchPosition === "function") {
    navigator.geolocation.watchPosition(
      function(position) {
        const { latitude, longitude } = position.coords;

        // Update footer
        document.getElementById("coords").textContent =
          `Lat: ${latitude.toFixed(5)} , Lng: ${longitude.toFixed(5)}`;

        // Create/update own marker
        if(markers[ownKey]){
          markers[ownKey].setLatLng([latitude, longitude]);
        } else {
          markers[ownKey] = L.marker([latitude, longitude]).addTo(map);
          map.setView([latitude, longitude], 15);
        }

        // Emit location
        socket.emit("send-location", { latitude, longitude });

        checkGeofences();
      },
      function(error) {
        console.error("Geolocation error:", error);
      },
      { enableHighAccuracy: true, maximumAge: 0 }
    );
  } else {
    console.error("Geolocation not supported by this browser.");
  }

  // Replace "self" with actual socket.id when connected
  socket.on("connect", () => {
    if(markers["self"]) {
      markers[socket.id] = markers["self"];
      delete markers["self"];
      ownKey = socket.id;
    }
  });

  // Receive other users' locations
  socket.on("receive-location", data => {
    const { id, latitude, longitude } = data;
    if(id === ownKey) return; // skip self

    if(markers[id]){
      markers[id].setLatLng([latitude, longitude]);
    } else {
      markers[id] = L.marker([latitude, longitude]).addTo(map);
    }

    checkGeofences();
  });

  // Remove disconnected users
  socket.on("user-disconnected", id => {
    if(markers[id]){
      map.removeLayer(markers[id]);
      delete markers[id];
      checkGeofences();
    }
  });
});