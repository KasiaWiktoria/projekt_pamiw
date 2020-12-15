import {addCorrectMessage, addfailureMessage, submitForm, updateCorrectnessMessage, prepareOtherEventOnChange, prepareEventOnChange} from './form_functions.js';
import {showWarningMessage, removeWarningMessage, prepareWarningElem, appendAfterElem} from './warning_functions.js';
import {isAnyFieldBlank, isLoginAvailable, validateName, validateSurname, validateBDate, validatePesel, validateCountry, validatePostalCode, validateCity, validateStreet, validateHouseNr, validateLogin, validatePasswd, arePasswdsTheSame} from './validation_functions.js';
import {GET, POST, paczkomatURL, HTTP_STATUS, PACZKOMAT_FIELD_ID, PASSWD_FIELD_ID} from './const.js'


let paczkomatForm = document.getElementById("paczkomat-form");

paczkomatForm.addEventListener("submit", function (event) {
    event.preventDefault();

    let paczkomat = document.getElementById(PACZKOMAT_FIELD_ID);

    let fields = [paczkomat];
    if(!isAnyFieldBlank(fields)) {
        let paczkoamt_name = 'paczkomat/' + paczkomat.value
        submitPaczkomatForm(paczkomatForm, paczkoamt_name);
    } else {
        let id = "button-submit-form";
        addfailureMessage(id,"Wpisz identyfikator paczkomatu.")
    }
});


function submitPaczkomatForm(form, name) {
    let loginUrl = paczkomatURL + name;
    console.log(loginUrl);
    let successMessage = "Poprawny kod paczkomatu.";
    let failureMessage = "Paczkomat o podanym kodzie nie istnieje.";

    let registerParams = {
        method: POST,
        mode: 'cors',
        body: new FormData(form),
        redirect: "follow"
    };

    fetch(loginUrl, registerParams).then(response => {
        console.log("odpowiedź: " + response)
        return getJsonResponse(response)
        }).then(response => getResponseData(response, successMessage, failureMessage))
            .catch(err => {
                console.log("Caught error: " + err);
                let id = "button-submit-form";
                addfailureMessage(id,failureMessage);
            });
}

function getResponseData(response, successMessage, failureMessage) {
    if (response.status == HTTP_STATUS.OK){
        console.log(response)
        addfailureMessage(id,failureMessage)
    }else {
        addCorrectMessage(id,successMessage)
    }
}

function getJsonResponse(response){
    return response.json();
}
