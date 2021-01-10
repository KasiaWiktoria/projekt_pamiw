import {addCorrectMessage, addfailureMessage} from './form_functions.js';
import {GET, POST, URL, HTTP_STATUS, waybillURL, websocketURL} from './const.js'
import { joinIntoRoom } from './websocket_functions.js'

const HAND_OVER_ROOM = "hand_over_room"
const PUT_PACK_IN_ROOM = "put_pack_in_room"
const PICK_UP_ROOM = "pick_up_room"
let base_url = 'https://localhost:8080/app/waybills_list/'
let page_url = base_url + '0'

document.addEventListener('DOMContentLoaded', function (event) {
    loadWaybills(page_url);

    let ws_uri = websocketURL;
    let socket = io.connect(ws_uri);

    joinIntoRoom(HAND_OVER_ROOM)
    joinIntoRoom(PUT_PACK_IN_ROOM)
    joinIntoRoom(PICK_UP_ROOM)


    socket.on("change_pack_status", function (pack_id) {
        reloadActualPage()
        console.log("(courier) zmieniono status paczki ", pack_id);
    });

    socket.on("connect", function(){
        console.log('Correctly connected.')
    })

    socket.on("joined_room", function (message) {
        console.log("Joined to the room ", message);
    });

    socket.on("chat_message", function (data) {
        reloadActualPage()
        console.log("Receiven new chat message: ", data);
    });

    
    function joinIntoRoom(room_id) {
        let useragent = navigator.userAgent;
        socket.emit("join", { useragent: useragent, room_id: room_id });
    }
    
    function sendMessage(room_id, text) {
        let data = { room_id: room_id, message: text };
        socket.emit("new_message", data);
    }

})

function reloadActualPage(){
    let prev_btn = document.getElementById('prev_btn')
    let next_btn = document.getElementById('next_btn')
    let actual_start
    
    if (prev_button != null){
        let url = prev_button.getAttribute('page_url')
        let p_start = url.split('/')[5]
        actual_start = parseInt(p_start) + 5
    } else if (next_button != null){
        let url = next_button.getAttribute('page_url')
        let p_start = url.split('/')[5]
        actual_start = parseInt(p_start) - 5
    } else {
        actual_start = 0
    }
    let reload_url = base_url + actual_start
    console.log('reload_url: ', reload_url)
    loadWaybills(reload_url)
    console.log('Załadowano ponownie tabelę z paczkami.')
}

function loadWaybills(page_url){
    clearTable()

    fetchPacks(page_url).then(response => {
            return response.json()
        }).then(response => {
            console.log('tworzenie tabeli')
            let h1 = document.getElementById('title')

            let n_of_waybills = response.waybills.length
            if (n_of_waybills > 0){
                let waybills = response.waybills
                let images = response.waybills_images
                let pack_states = response.pack_states
                let prev = response.previous_page_url
                let next = response.next_page_url
    
                let table = document.createElement('table')
                table.id = 'waybills-table'
                let tbody = document.createElement('tbody')
                tbody.id = 'waybills-tbody'
    
                let row = tbody.insertRow()
                let th = document.createElement('th')
                th.innerHTML = "status paczki"
                row.appendChild(th)
                th = document.createElement('th')
                th.innerHTML = "zdjęcie paczki"
                row.appendChild(th)
                th = document.createElement('th')
                th.innerHTML = "identyfikator paczki"
                row.appendChild(th)
                th = document.createElement('th')
                th.innerHTML = "pobieranie"
                row.appendChild(th)
                th = document.createElement('th')
                th.innerHTML = "usuń"
                row.appendChild(th)
    
                waybills.forEach((waybill, idx) =>
                    addWaybillToList(tbody, waybill, images[idx], pack_states[idx])
                )
                table.appendChild(tbody)
                console.log('stworzenie tabeli')
                clearTable()
                h1.insertAdjacentElement('afterend', table)
    
                updateNavButtons(prev,next)
                addNavListeners()
            } else {
                let empty_warning = document.createElement('div')
                empty_warning.className = "max-width-elem empty"
                empty_warning.id = 'empty-list-warning'
                empty_warning.innerText = 'Nie masz żadnych paczek na swojej liście'
                h1.insertAdjacentElement('afterend', empty_warning)
            }
        }).catch(err => {
            console.log("Caught error: " + err);
            let id = "title";
            addfailureMessage(id,"Pobieranie paczek nie powiodło się. ")
        });
}

function addWaybillToList(tbody, waybill, image, state){
    let row = tbody.insertRow()
    
    let cell = row.insertCell()
    let pack_state = document.createTextNode(state)
    cell.appendChild(pack_state)
    
    cell = row.insertCell()
    cell.className ='img'
    let img = document.createElement('img')
    img.setAttribute('alt', 'zdjęcie paczki');
    img.src = '/images/packs_images/' + image;
    cell.appendChild(img)

    cell = row.insertCell()
    let waybill_id = document.createTextNode(waybill)
    cell.appendChild(waybill_id)

    cell = row.insertCell()
    let a = document.createElement('a')
    a.setAttribute('href', 'https://localhost:8081/waybill/' + waybill);
    img = document.createElement('img')
    img.src = '/images/download.svg';
    let p = document.createElement('p')
    let text = document.createTextNode('Pobierz')
    p.appendChild(text)
    a.appendChild(img)
    a.appendChild(p)
    cell.appendChild(a)

    cell = row.insertCell()
    a = document.createElement('a')
    a.setAttribute('onClick', 'delete_pack("' + waybill + '")');
    p = document.createElement('p')
    text = document.createTextNode('usuń')
    p.appendChild(text)
    a.appendChild(p)
    cell.appendChild(a)
}

function updateNavButtons(prev,next){
    let prev_nav_btn = document.getElementById('prev_nav_btn')
    let next_nav_btn = document.getElementById('next_nav_btn')
    let a = document.createElement('a')
    a.className = 'btn'
    let text = document.createTextNode('')

    let prev_btn = document.getElementById('prev_btn')
    if (prev_btn != null){
        if (prev != null) {
            prev_btn.setAttribute('page_url', prev);
        } else {
            prev_btn.remove()
        }
    } else {
        if(prev != null){
            text.nodeValue = '<<'
        a.appendChild(text)
        a.id = 'prev_btn'
        a.setAttribute('page_url', prev);
            prev_nav_btn.appendChild(a)
        }
    }

    let next_btn = document.getElementById('next_btn')
    if (next_btn != null){
        if (next != null) {
            next_btn.setAttribute('page_url', next);
        } else {
            next_btn.remove()
        }
    } else {
        if(next != null){
            text.nodeValue = '>>'
            a.appendChild(text)
            a.id = 'next_btn'
            a.setAttribute('page_url', next);
            next_nav_btn.appendChild(a)
        }
    }
}

function fetchPacks(page_url){
    console.log('wysłanie zapyatnia na adres: ', page_url)

    let sendParams = {
        credentials: 'include',
        method: GET,
        mode: 'cors'
    };
    return fetch(page_url, sendParams)
}

function addNavListeners(){
    let prev_button = document.getElementById('prev_btn')
    let next_button = document.getElementById('next_btn')


    if (prev_button != null){
        prev_button.addEventListener('click', function (event) {
            let page_url = prev_button.getAttribute('page_url')
            loadWaybills(page_url);
        })
    }

    if (next_button != null){
        next_button.addEventListener('click', function (event) {
            let page_url = next_button.getAttribute('page_url')
            loadWaybills(page_url);
        });
    }
}

function clearTable(){
    let table = document.getElementById('waybills-table')
    if (table != null){
        table.parentNode.removeChild(table);
    }
}