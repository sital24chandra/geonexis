const socket = io();

if (navigator.geolocation) {
    navigator.geolocation.watchPosition((position) => {
        const { latitude, longitude } = position.coords;
        socket.emit("send-location", { latitude, longitude });
    }, (error) => {
        console.error(error);
    }, {
        enableHighAccuracy: true,
        timeout: 1000,
        maximumAge: 0
    });
}

const map = L.map("map").setView([0, 0], 2); // start zoomed out
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "Sital Chandra"
}).addTo(map);

const markers = {};

socket.on("receive-location", (data) => {
    const { id, latitude, longitude } = data;

    // if this is my own socket, center map once
    if (id === socket.id && !markers[id]) {
        map.setView([latitude, longitude], 15);
    }

    if (markers[id]) {
        markers[id].setLatLng([latitude, longitude]); // fixed typo
    } else {
        markers[id] = L.marker([latitude, longitude]).addTo(map);
    }
});

socket.on("user-disconnected", (id) => {
    if (markers[id]) {
        map.removeLayer(markers[id]);
        delete markers[id];
    }
});








// const socket = io();

// if (navigator.geolocation){
//     navigator.geolocation.watchPosition((position)=>{
//         const {latitude, longitude} = position.coords;
//         socket.emit("send-location", {latitude, longitude});
//     }, (error)=>{
//         console.error(error);
//     }, {
//         enableHighAccuracy: true,
//         maximumAge: 0
//     });
// }

// const map = L.map("map").setView([0,0], 10);
// L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
//     attribution: "Sital Chandra"
// }).addTo(map);

// const markers = {};


// socket.on("receive-location", (data)=>{
//     const {id, latitude, longitude} = data;
//     map.setView([latitude, longitude], 15);
//     if (markers[id]) {
//         markers[id].setLatLng([latitude, longitude]);
//     } else {
//         markers[id] = L.marker([latitude, longitude]).addTo(map);
//     }
// });

// socket.on("user-disconnected", (id)=> {
//     if(markers[id]){
//         map.removeLayer(markers[id]);
//         delete markers[id];
//     }
// });