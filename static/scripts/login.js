import {submitForm, updateCorrectnessMessage, prepareOtherEventOnChange, prepareEventOnChange} from './form_functions.js';
import {showWarningMessage, removeWarningMessage, prepareWarningElem, appendAfterElem} from './warning_functions.js';
import {isLoginAvailable, validateName, validateSurname, validateBDate, validatePesel, validateCountry, validatePostalCode, validateCity, validateStreet, validateHouseNr, validateLogin, validatePasswd, arePasswdsTheSame} from './validation_functions.js';
import {GET, POST, URL, HTTP_STATUS, LOGIN_FIELD_ID, PASSWD_FIELD_ID} from './const.js'


document.addEventListener('DOMContentLoaded', function (event) {

    let loginForm = document.getElementById("login-form");

    loginForm.addEventListener("submit", function (event) {
        event.preventDefault();

        let login = document.getElementById(LOGIN_FIELD_ID).value;
        let password = document.getElementById(PASSWD_FIELD_ID).value;
        var canSend = true;

        if(canSend) {
            submitLoginForm(loginForm, "login");
        } else {
            removeWarningMessage("correct");
            let id = "button-log-form";
            let uncorrectElem = prepareWarningElem("uncorrect", "Błędny login lub hasło.");
            uncorrectElem.className = "uncorrect-field"
            appendAfterElem(id, uncorrectElem);
        }
    });
});

export function submitLoginForm(form, name) {
    let registerUrl = URL + name;
    console.log(registerUrl);
    let successMessage = "Zalogowano pomyślnie.";
    let failureMessage = "Błędny login lub hasło.";

    let registerParams = {
        method: POST,
        mode: 'cors',
        body: new FormData(form),
        redirect: "follow"
    };

    fetch(registerUrl, registerParams)
            .then(response => getResponseData(response, successMessage, failureMessage)).catch(err => {
                console.log("Caught error: " + err);
                removeWarningMessage("correct");
                let id = "button-log-form";

                let uncorrectElem = prepareWarningElem("uncorrect", failureMessage);
                uncorrectElem.className = "uncorrect-field"
                appendAfterElem(id, uncorrectElem);
            });
}

function getResponseData(response, successMessage, failureMessage) {
    let status = response.status;
    let id = "button-submit-form";

    if (status === HTTP_STATUS.OK) {
        console.log("Logged in successfully.");

        removeWarningMessage("uncorrect");
        let id = "button-log-form";
        let correctElem = prepareWarningElem("correct", successMessage);
        correctElem.className = "correct-field"
        appendAfterElem(id, correctElem);
        
        window.location.href = '/login/waybills-list'
    } else if (status == HTTP_STATUS.BAD_REQUEST) {
        console.log("Incorrect authorization data.")
        
        removeWarningMessage("correct");
        let uncorrectElem = prepareWarningElem("uncorrect", failureMessage);
        uncorrectElem.className = "uncorrect-field"
        appendAfterElem(id, uncorrectElem);
    } else {
        console.error("Response status code: " + response.status);

        removeWarningMessage("correct");
        let uncorrectElem = prepareWarningElem("uncorrect", "Logowanie nie powiodło się. Nie jesteśmy w stanie zweryfikować poprawności wprowadzonych danych.");
        uncorrectElem.className = "uncorrect-field"
        appendAfterElem(id, uncorrectElem);
        throw "Unexpected response status: " + response.status;
    }
}
