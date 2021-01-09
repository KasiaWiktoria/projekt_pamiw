import {addCorrectMessage, addfailureMessage} from './form_functions.js';
import {GET, POST, URL, HTTP_STATUS, courierURL} from './const.js'

let page_url = 'https://localhost:8082/courier/waybills_list/0'
document.addEventListener('DOMContentLoaded', function (event) {
    loadWaybills(page_url);

})

function loadWaybills(page_url){
    clearTable()

    fetchPacks(page_url).then(response => {
            return response.json()
        }).then(response => {
            let h1 = document.getElementById('title')

            let n_of_waybills = response.waybills.length
            if (n_of_waybills > 0){
                let waybills = response.waybills
                console.log('Pobrane paczki: ', waybills)
                console.log('przed pobraniem statusów paczek')
                let pack_states = response.pack_states
                console.log('Pobrane statusy paczek: ', pack_states)
                let images = response.waybills_images
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
    
                waybills.forEach((waybill, idx) =>
                    addWaybillToList(tbody, waybill, images[idx], pack_states[idx])
                )
                table.appendChild(tbody)
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
    console.log(page_url)
    let url = page_url;

    let sendParams = {
        credentials: 'include',
        method: GET,
        mode: 'cors'
    };
    return fetch(url, sendParams)
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
    })
    }
}

function clearTable(){
    let table = document.getElementById('waybills-table')
    if (table != null){
        table.parentNode.removeChild(table);
    }
}