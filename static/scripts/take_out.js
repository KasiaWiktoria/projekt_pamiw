import {addCorrectMessage, addfailureMessage, submitForm, updateCorrectnessMessage, prepareOtherEventOnChange, prepareEventOnChange} from './form_functions.js';
import {showWarningMessage, removeWarningMessage, prepareWarningElem, appendAfterElem} from './warning_functions.js';
import {isAnyFieldBlank, isLoginAvailable, validateName, validateSurname, validateBDate, validatePesel, validateCountry, validatePostalCode, validateCity, validateStreet, validateHouseNr, validateLogin, validatePasswd, arePasswdsTheSame} from './validation_functions.js';
import {GET, POST, paczkomatURL, HTTP_STATUS, CHECKBOX_FIELD_ID, PACZKOMAT_FIELD_ID, PASSWD_FIELD_ID, courierURL} from './const.js'

var script=document.createElement('script');
script.onload = function() { console.log('xx ile checkboxów: ' + checkboxes.length); }

document.addEventListener('readystatechange', function (event) {
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
})


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
