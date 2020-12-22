import {addCorrectMessage, addfailureMessage, submitForm, updateCorrectnessMessage, prepareOtherEventOnChange, prepareEventOnChange} from './form_functions.js';
import {showWarningMessage, removeWarningMessage, prepareWarningElem, appendAfterElem} from './warning_functions.js';
import {isAnyFieldBlank, isLoginAvailable, validateName, validateSurname, validateBDate, validatePesel, validateCountry, validatePostalCode, validateCity, validateStreet, validateHouseNr, validateLogin, validatePasswd, arePasswdsTheSame} from './validation_functions.js';
import {GET, POST, paczkomatURL, HTTP_STATUS, CHECKBOX_FIELD_ID, PACZKOMAT_FIELD_ID, PASSWD_FIELD_ID, courierURL} from './const.js'


document.addEventListener('DOMContentLoaded', function (event) {
    let path = window.location.pathname
    let paczkomat = path.split('/')[2]
    console.log('paczkomat:' + paczkomat)
    loadPacks(paczkomat, 0).then(r => {

        let checkboxes=document.getElementsByClassName("pack_checkbox");
        let packs = []
        console.log('ile checkboxów: ' + checkboxes.length)
        for(let i=0;i<checkboxes.length;i++){
            console.log('ok')
            checkboxes[i].addEventListener("click", function (event){
                let pack = checkboxes[i].value
                if (checkboxes[i].checked) {
                    console.log('id paczki: ' + pack)
                    if (!packs.includes()){
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
            console.log(url);
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
                console.log("odpowiedź: " + response)
                return getJsonResponse(response)
                }).then(response => getResponseData(response))
                    .catch(err => {
                        console.log("Caught error: " + err);
                        let id = "button-submit-form";
                        addfailureMessage(id,failureMessage);
                    });
        }
        
        function getResponseData(response) {
            console.log("odpowiedź json: " + response.message)
            console.log("status: " + response.status)
            let id = "button-submit-form";
            if (response.status == HTTP_STATUS.OK){
                console.log(response)
                addCorrectMessage(id,response.message)
            }else {
                addfailureMessage(id,response.message)
            }
        }
        
        function getJsonResponse(response){
            return response.json();
        }
        
    })
})

async function sendFetch(paczkomat, start){
    clearTable()
    let response = await fetchPacks(paczkomat, start)
    return response.json()
}

async function loadPacks(paczkomat, start){
    let response = await sendFetch(paczkomat, start)
    let h1 = document.getElementById('title')

    let n_of_packs = response.packs.length
    if (n_of_packs > 0){
        let packs = response.packs
        let images = response.packs_images
        let prev = response.previous_start
        let next = response.next_start

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
        addNavListeners()
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

function fetchPacks(paczkomat, start){
    let url = paczkomatURL + paczkomat + '/packs_list/' + start;

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
            loadPacks(paczkomat, start);
        })
    }

    if (next_button != null){
    next_button.addEventListener('click', function (event) {
        let start = next_button.getAttribute('start')
        loadPacks(paczkomat, start);
    })
    }
}

function clearTable(){
    let table = document.getElementById('packs-table')
    if (table != null){
        table.parentNode.removeChild(table);
    }
}


//---------- obsługa checkboxów ----------------
