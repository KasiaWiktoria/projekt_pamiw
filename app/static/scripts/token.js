import {addCorrectMessage, addfailureMessage, submitForm, updateCorrectnessMessage, prepareOtherEventOnChange, prepareEventOnChange} from './form_functions.js';
import {showWarningMessage, removeWarningMessage, prepareWarningElem, appendAfterElem} from './warning_functions.js';
import {isAnyFieldBlank, isLoginAvailable, validateName, validateSurname, validateBDate, validatePesel, validateCountry, validatePostalCode, validateCity, validateStreet, validateHouseNr, validateLogin, validatePasswd, arePasswdsTheSame} from './validation_functions.js';
import {GET, POST, paczkomatURL, HTTP_STATUS, PACZKOMAT_FIELD_ID, PASSWD_FIELD_ID, courierURL} from './const.js'

document.addEventListener('DOMContentLoaded', function (event) {

    prepareEventOnChange(PACZKOMAT_FIELD_ID, isBlank);

    let tokenForm = document.getElementById("token-form");

    tokenForm.addEventListener("submit", function (event) {
        event.preventDefault();

        let paczkomat = document.getElementById(PACZKOMAT_FIELD_ID);

        let fields = [paczkomat];
        if(!isAnyFieldBlank(fields)) {
            submitTokenForm(tokenForm, 'check_paczkomat');
        } else {
            let id = "button-submit-form";
            addfailureMessage(id,"Wpisz identyfikator paczkomatu.")
        }
    });

});

function isBlank(){
    let field = document.getElementById(PACZKOMAT_FIELD_ID);
    let fields = [field];
    if (!isAnyFieldBlank(fields)){
        return ""
    } else{
        return  "not blank"
    }
}

function submitTokenForm(form, name) {
    let url = courierURL + name;
    console.log(url);
    let successMessage = "Poprawny kod paczkomatu.";
    let failureMessage = "Paczkomat o podanym kodzie nie istnieje.";

    let params = {
        method: POST,
        mode: 'cors',
        body: new FormData(form),
        redirect: "follow"
    };

    fetch(url, params).then(response => {
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
    console.log("odpowiedź json: " + response.message)
    console.log("status: " + response.status)
    let id = "button-submit-form";
    if (response.status == HTTP_STATUS.OK){
        console.log(response)
        addCorrectMessage(id,successMessage)
        sendTokenRequest()
    }else {
        addfailureMessage(id,failureMessage)
    }
}

function getJsonResponse(response){
    return response.json();
}

function showToken(newElemId, message, field_id) {
    let newElem = prepareTokenElem(newElemId, message);
    let currentElem = document.getElementById(field_id);
    currentElem.insertAdjacentElement('afterend', newElem);
}

function prepareTokenElem(newElemId, message) {
    let tokenField = document.getElementById(newElemId);

    if (tokenField === null) {
        let textMessage = document.createTextNode(message);
        tokenField = document.createElement('span');

        tokenField.setAttribute("id", newElemId);
        tokenField.className = "token-field";
        tokenField.appendChild(textMessage);
    }
    return tokenField;
}

function sendTokenRequest(){
    let url = courierURL + 'generate_token'
    let params = {
        method: GET,
        mode: 'cors',
        redirect: "follow"
    };

    fetch(url, params).then(response => getToken(response)).then(response => onCorrectTokenResponse(response))
            .catch(err => {
                console.log("Caught error: " + err);
                let id = "button-submit-form";
                addfailureMessage(id,failureMessage);
            });
}

function getToken(response){
    return response.json()
}

function onCorrectTokenResponse(response){
    let token = response.token
    console.log('token: ' + token)
    let message = 'Twój token to: ' + token
        showToken('token-field', message, 'token-form')
}

