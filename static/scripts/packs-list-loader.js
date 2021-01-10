import {addCorrectMessage, addfailureMessage, submitForm, updateCorrectnessMessage, prepareOtherEventOnChange, prepareEventOnChange} from './form_functions.js';
import {GET, POST, paczkomatURL, HTTP_STATUS, websocketURL} from './const.js'

let packs = []

const SEND_PACK_ROOM = "send_pack_room"
const PICK_UP_ROOM = "pick_up_room"

document.addEventListener('DOMContentLoaded', function (event) {
    let path = window.location.pathname
    let paczkomat = path.split('/')[2]
    console.log('paczkomat:' + paczkomat)
    let base_url = 'https://localhost:8083/paczkomat/' + paczkomat + '/packs_list/'
    let page_url = base_url + '0'
    updatePackages(paczkomat,page_url)

    let ws_uri = websocketURL;
    let socket = io.connect(ws_uri);

    joinIntoRoom(SEND_PACK_ROOM)
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
        reloadActualPage(paczkomat)
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

});


function reloadActualPage(paczkomat){
    let prev_btn = document.getElementById('prev_btn')
    let next_btn = document.getElementById('next_btn')
    let actual_start
    
    if (prev_btn != null){
        let url = prev_btn.getAttribute('page_url')
        let p_start = url.split('/')[5]
        actual_start = p_start + 5
        console.log(actual_start)
    } else if (next_btn != null){
        let url = next_btn.getAttribute('page_url')
        let p_start = url.split('/')[5]
        actual_start = p_start - 5
        console.log(actual_start)
    } else {
        actual_start = 0
    }
    console.log(base_url + String(actual_start))
    updatePackages(paczkomat, base_url + String(actual_start))
    console.log('Załadowano ponownie tabelę z paczkami.')
}

function updatePackages(paczkomat,page_url){
    loadPacks(paczkomat, page_url).then(r => {

        let checkboxes=document.getElementsByClassName("pack_checkbox");
        console.log('ile checkboxów: ' + checkboxes.length)
        for(let i=0;i<checkboxes.length;i++){
            checkboxes[i].addEventListener("click", function (event){
                let pack = checkboxes[i].value
                if (checkboxes[i].checked) {
                    console.log('id paczki: ' + pack)
                    if (!packs.includes(pack)){
                        packs.push(pack)
                    }
                    console.log('lista: ' + packs)
                } else {
                    packs = arrayRemove(packs, pack)
                    console.log('Paczka ' + pack + ' została usunięta z listy.')
                    console.log('lista: ' + packs)
                }
            });
        }
        
        
        function arrayRemove(arr, value) { 
            return arr.filter(function(ele){ 
                return ele != value; 
            });
        }
        
        
        let packsForm = document.getElementById("packs-form");
        
        packsForm.addEventListener("submit", function (event) {
            event.preventDefault();
        
            if(packs.length > 0) {
                submitPacksForm('take_out');
            } else {
                let id = "button-submit-form";
                addfailureMessage(id,"Nie wybrano żadnej paczki.")
            }
        });
        
        function submitPacksForm(name) {
            let url = paczkomatURL + name;
            let failureMessage = "Nie udało się wysłać zapytania.";
            let params = {
                method: POST,
                mode: 'cors',
                body: JSON.stringify({
                    packs: packs
                }),
                redirect: "follow"
            };
        
            fetch(url, params).then(response => {
                return getJsonResponse(response)
                }).then(response => getResponseData(response))
                    .catch(err => {
                        console.log("Caught error: " + err);
                        let id = "button-submit-form";
                        addfailureMessage(id,failureMessage);
                    });
        }
        
        function getResponseData(response) {
            console.log("status: " + response.status)
            let id = "button-submit-form";
            if (response.status == HTTP_STATUS.OK){
                addCorrectMessage(id,response.message)
            }else {
                addfailureMessage(id,response.message)
            }
        }
        
        function getJsonResponse(response){
            return response.json();
        }
        
    })
}

async function sendFetch(paczkomat, page_url){
    clearTable()
    let response = await fetchPacks(paczkomat, page_url)
    console.log(response)
    return response.json()
}

async function loadPacks(paczkomat, page_url){
    let response = await sendFetch(paczkomat, page_url)
    console.log(response)
    let h1 = document.getElementById('title')

    let n_of_packs = response.packs.length
    if (n_of_packs > 0){
        let packs = response.packs
        let images = response.packs_images
        let prev = response.previous_page_url
        let next = response.next_page_url

        let table = document.createElement('table')
        table.id = 'packs-table'
        let tbody = document.createElement('tbody')
        tbody.id = 'packs-tbody'

        let row = tbody.insertRow()
        let th = document.createElement('th')
        th.innerHTML = "zdjęcie paczki"
        row.appendChild(th)
        th = document.createElement('th')
        th.innerHTML = "identyfikator paczki"
        row.appendChild(th)
        th = document.createElement('th')
        th.innerHTML = "wybierz"
        row.appendChild(th)

        packs.forEach((pack, idx) =>
            addPackToList(tbody, pack, images[idx])
        )
        table.appendChild(tbody)
        h1.insertAdjacentElement('afterend', table)

        updateNavButtons(prev,next)
        addNavListeners(paczkomat)
    } else {
        let empty_warning = document.createElement('div')
        empty_warning.className = "max-width-elem empty"
        empty_warning.id = 'empty-list-warning'
        empty_warning.innerText = 'Nie masz żadnych paczek na swojej liście'
        h1.insertAdjacentElement('afterend', empty_warning)
    }
}

function addPackToList(tbody, pack, image){
    let row = tbody.insertRow()
    let cell = row.insertCell()
    cell.className ='img'
    let img = document.createElement('img')
    img.setAttribute('alt', 'zdjęcie paczki');
    img.src = '/images/packs_images/' + image;
    cell.appendChild(img)

    cell = row.insertCell()
    let pack_id = document.createTextNode(pack)
    cell.appendChild(pack_id)

    cell = row.insertCell()
    let chbox = document.createElement('input')
    chbox.className = "pack_checkbox"
    chbox.setAttribute('type', 'checkbox');
    chbox.setAttribute('value', pack);
    if (packs.includes(pack)){
        chbox.setAttribute('checked', true)
    }
    cell.appendChild(chbox)
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

function fetchPacks(paczkomat, page_url){
    let url = page_url;

    let sendParams = {
        credentials: 'include',
        method: GET,
        mode: 'cors'
    };
    return fetch(url, sendParams)
}

function addNavListeners(paczkomat){
    let prev_button = document.getElementById('prev_btn')
    let next_button = document.getElementById('next_btn')

    if (prev_button != null){
        prev_button.addEventListener('click', function (event) {
            let page_url = prev_button.getAttribute('page_url')
            updatePackages(paczkomat, page_url);
        })
    }

    if (next_button != null){
    next_button.addEventListener('click', function (event) {
        let page_url = next_button.getAttribute('page_url')
        updatePackages(paczkomat, page_url);
    })
    }
}

function clearTable(){
    let table = document.getElementById('packs-table')
    if (table != null){
        table.parentNode.removeChild(table);
    }
}