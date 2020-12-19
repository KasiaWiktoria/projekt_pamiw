import {addCorrectMessage, addfailureMessage, submitForm, updateCorrectnessMessage, prepareOtherEventOnChange, prepareEventOnChange} from './form_functions.js';
import {showWarningMessage, removeWarningMessage, prepareWarningElem, appendAfterElem} from './warning_functions.js';
import {isAnyFieldBlank, isLoginAvailable, validateName, validateSurname, validateBDate, validatePesel, validateCountry, validatePostalCode, validateCity, validateStreet, validateHouseNr, validateLogin, validatePasswd, arePasswdsTheSame} from './validation_functions.js';
import {GET, POST, paczkomatURL, HTTP_STATUS, TOKEN_FIELD_ID, PACZKOMAT_FIELD_ID, PASSWD_FIELD_ID, courierURL} from './const.js'

document.addEventListener('DOMContentLoaded', function (event) {

    prepareEventOnChange(TOKEN_FIELD_ID, isBlank);

    let tokenForm = document.getElementById("token-form");

    tokenForm.addEventListener("submit", function (event) {
        event.preventDefault();
    
        let token = document.getElementById(TOKEN_FIELD_ID);
        let form = new FormData(tokenForm);
        console.log(form)
        let paczkomat = token.getAttribute('paczkomat_id')
        form.set("paczkomat", paczkomat);
        console.log(form)
    
        let fields = [token];
        if(!isAnyFieldBlank(fields)) {
            submitTokenForm(form, 'confirm_token');
        } else {
            let id = "button-submit-form";
            addfailureMessage(id,"Wpisz token.")
        }
    });
        
});

function isBlank(){
    let field = document.getElementById(TOKEN_FIELD_ID);
    let fields = [field];
    if (!isAnyFieldBlank(fields)){
        return ""
    } else{
        return  "not blank"
    }
}

function submitTokenForm(form, name) {
    let url = paczkomatURL + name;
    
    console.log(url);
    let failureMessage = "Nie udało się zweryfikować poprawności tokenu.";

    let params = {
        method: POST,
        mode: 'cors',
        body: form,
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
        console.log(response.paczkomat)
        window.location.href = 'paczkomat/' + response.paczkomat + '/packs_list'
    }else {
        addfailureMessage(id,response.message)
    }
}

function getJsonResponse(response){
    return response.json();
}
