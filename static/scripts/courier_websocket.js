
document.addEventListener("DOMContentLoaded", function (event) {

    let courierURL = "https://localhost:8082/courier/";
    var ws_uri = courierURL + 'waybills_list';
    console.log(ws_uri)
    socket = io.connect(ws_uri);


    socket.on("change_pack_status", function (pack_id) {
        console.log("(courier) zmieniono status paczki ", pack_id);
    });

    
});
