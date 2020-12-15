import {addCorrectMessage, addfailureMessage, submitForm, updateCorrectnessMessage, prepareOtherEventOnChange, prepareEventOnChange} from './form_functions.js';
import {showWarningMessage, removeWarningMessage, prepareWarningElem, appendAfterElem} from './warning_functions.js';
import {isAnyFieldBlank, isLoginAvailable, validateName, validateSurname, validateBDate, validatePesel, validateCountry, validatePostalCode, validateCity, validateStreet, validateHouseNr, validateLogin, validatePasswd, arePasswdsTheSame} from './validation_functions.js';
import {GET, POST, courierURL, HTTP_STATUS, PACK_ID_FIELD_ID, PASSWD_FIELD_ID} from './const.js'

/*
document.addEventListener('DOMContentLoaded', function (event) {
    getAccessToken();

    function getAccessToken(){
        let url = URL + 'get_access_token'
        let registerParams = {
            method: GET,
            redirect: "follow"
        };

        fetch(url, registerParams)
            .then(response => getResponseTokenData(response))
            .then(response => displayInConsoleCorrectTokenResponse(response))
            .catch(err => {
                console.log("Caught error: " + err);
            });
    }

    function getResponseTokenData(response) {
        let status = response.status;

        if (status === HTTP_STATUS.OK) {
            return response.json();
        } else {
            console.error("Response status code: " + response.status);
            throw "Unexpected response status: " + response.status;
        }
    }

    function displayInConsoleCorrectTokenResponse(correctResponse) {
        let access_token = correctResponse.access_token;
        console.log('Pobrano token: ' + access_token);

        window.localStorage.setItem('accessToken', 'Bearer: ' + access_token)

    }
});
*/

let deleteButton = document.getElementById('delete_button')

function delete_pack(padk_id) {

    let url = waybillURL + 'delete'
        let registerParams = {
            method: POST,
            pack_id: pack_id,
            redirect: "follow"
        };

        fetch(url, registerParams)
            .then(response => getResponse(response, 'Poprawnie usunięto plik.', 'Nie udało się usunąć paczki.'))
            .catch(err => {
                console.log("Caught error: " + err);
                
            });
}

function getResponse(response, successMessage, failureMessage) {
    let id = "button-submit-form";
    if (response.status == HTTP_STATUS.OK){
        console.log('Poprawnie usunięto paczkę!')
        addCorrectMessage(id,successMessage)
        window.location.href = '/waybills-list'
    }else if (response.status == HTTP_STATUS.BAD_REQUEST){
        addfailureMessage(id,' Nie można usunąć paczki, której status został już zmieniony.')
    }else if (response.status == HTTP_STATUS.NOT_FOUND){
        addfailureMessage(id,'Takiej paczki nie ma w bazie danych.')
    }else {
        addfailureMessage(id,failureMessage)
    }
}