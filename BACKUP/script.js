const socket = io();

if (navigator.geolocation){
    navigator.geolocation.watchPosition((position)=>{
        const {latitude, longitude} = position.coords;
        document.getElementById("coords").textContent =
            `Lat: ${latitude.toFixed(5)} , Lng: ${longitude.toFixed(5)}`;
        socket.emit("send-location", {latitude, longitude});
    }, (error)=>{
        console.error(error);
    }, {
        enableHighAccuracy: true,
        maximumAge: 0
    });
}

const map = L.map("map").setView([0,0], 10);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "Sital Chandra"
}).addTo(map);

const markers = {};

socket.on("receive-location", (data)=>{
    const {id, latitude, longitude} = data;
    map.setView([latitude, longitude], 15);
    if (markers[id]) {
        markers[id].setLatLng([latitude, longitude]);
    } else {
        markers[id] = L.marker([latitude, longitude]).addTo(map);
    }
});

socket.on("user-disconnected", (id)=> {
    if(markers[id]){
        map.removeLayer(markers[id]);
        delete markers[id];
    }
});
