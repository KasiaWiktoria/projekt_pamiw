import {GET, POST, URL, HTTP_STATUS, waybillURL} from './const.js'


document.addEventListener('DOMContentLoaded', function (event) {
    loadWaybills(0);

})

function loadWaybills(start){
    clearTable()

    fetchPacks(start).then(response => {
            return response.json()
        }).then(response => {
            let n_of_waybills = response.waybills.length
            let waybills = response.waybills
            let images = response.waybills_images
            let prev = response.previous_start
            let next = response.next_start

            
            let h1 = document.getElementById('title')
            let table = document.createElement('table')
            table.id = 'waybills-table'
            let tbody = document.createElement('tbody')
            tbody.id = 'waybills-tbody'

            let row = tbody.insertRow()
            let th = document.createElement('th')
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
                addWaybillToList(tbody, waybill, images[idx])
            )
            table.appendChild(tbody)
            h1.insertAdjacentElement('afterend', table)

            console.log('prev: '+ prev +', next: ' + next)
            updateNavButtons(prev,next)
            addNavListeners()

        }).catch(err => {
            console.log("Caught error: " + err);
            let id = "title";
            addfailureMessage(id,"Pobieranie paczek nie powiodło się. ")
        });
}

function addWaybillToList(tbody, waybill, image){
    let row = tbody.insertRow()
    let cell = row.insertCell()
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
    a.setAttribute('onClick', 'delete_pack("waybill")');
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
            prev_btn.setAttribute('start', prev);
        } else {
            prev_btn.remove()
        }
    } else {
        if(prev != null){
            text.nodeValue = '<<'
        a.appendChild(text)
        a.id = 'prev_btn'
        a.setAttribute('start', prev);
            prev_nav_btn.appendChild(a)
        }
    }

    let next_btn = document.getElementById('next_btn')
    if (next_btn != null){
        if (next != null) {
            next_btn.setAttribute('start', next);
        } else {
            next_btn.remove()
        }
    } else {
        if(next != null){
            text.nodeValue = '>>'
            a.appendChild(text)
            a.id = 'next_btn'
            a.setAttribute('start', next);
            next_nav_btn.appendChild(a)
        }
    }
}

function fetchPacks(start){
    let url = URL + 'waybills-list/' + start;
    console.log(url);

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
            let start = prev_button.getAttribute('start')
            loadWaybills(start);
        })
    }

    if (next_button != null){
    next_button.addEventListener('click', function (event) {
        let start = next_button.getAttribute('start')
        loadWaybills(start);
    })
    }
}

function clearTable(){
    console.log('funkcja do usuwania')
    let table = document.getElementById('waybills-table')
    console.log(table)
    if (table != null){
        console.log('usunięte')
        table.parentNode.removeChild(table);
    }
}