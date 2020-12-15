import {addCorrectMessage, addfailureMessage, submitForm, updateCorrectnessMessage, prepareOtherEventOnChange, prepareEventOnChange} from './form_functions.js';
import {showWarningMessage, removeWarningMessage, prepareWarningElem, appendAfterElem} from './warning_functions.js';
import {isAnyFieldBlank, isLoginAvailable, validateName, validateSurname, validateBDate, validatePesel, validateCountry, validatePostalCode, validateCity, validateStreet, validateHouseNr, validateLogin, validatePasswd, arePasswdsTheSame} from './validation_functions.js';
import {GET, POST, courierURL, HTTP_STATUS, LOGIN_FIELD_ID, PASSWD_FIELD_ID} from './const.js'


document.addEventListener('DOMContentLoaded', function (event) {

    let loginForm = document.getElementById("login-form");

    loginForm.addEventListener("submit", function (event) {
        event.preventDefault();

        let login = document.getElementById(LOGIN_FIELD_ID);
        let password = document.getElementById(PASSWD_FIELD_ID);

        let fields = [login, password];
        if(!isAnyFieldBlank(fields)) {
            submitLoginForm(loginForm, "login");
        } else {
            let id = "button-submit-form";
            addfailureMessage(id,"Żadne pole nie może pozostać puste.")
        }
    });
});

function submitLoginForm(form, name) {
    let loginUrl = courierURL + name;
    console.log(loginUrl);
    let successMessage = "Zalogowano pomyślnie.";
    let failureMessage = "Błędny login lub hasło.";

    let registerParams = {
        method: POST,
        mode: 'cors',
        body: new FormData(form),
        redirect: "follow"
    };

    fetch(loginUrl, registerParams)
            .then(response => getResponseData(response, successMessage, failureMessage))
            .catch(err => {
                console.log("Caught error: " + err);
                let id = "button-submit-form";
                addfailureMessage(id,failureMessage);
            });
}

function getResponseData(response, successMessage, failureMessage) {
    let status = response.status;
    let id = "button-submit-form";

    if (status === HTTP_STATUS.OK) {
        console.log("Logged in successfully.");

        addCorrectMessage(id,successMessage)
        window.location.href = '/waybills-list'
    } else if (status == HTTP_STATUS.BAD_REQUEST) {
        console.log("Incorrect authorization data.")
        addfailureMessage(id,failureMessage)
    } else {
        console.error("Response status code: " + response.status);
        addfailureMessage(id,"Logowanie nie powiodło się. Nie jesteśmy w stanie zweryfikować poprawności wprowadzonych danych.")
        throw "Unexpected response status: " + response.status;
    }
}

