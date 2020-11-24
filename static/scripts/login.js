import {submitForm, updateCorrectnessMessage, prepareOtherEventOnChange, prepareEventOnChange} from './form_functions.js';
import {showWarningMessage, removeWarningMessage, prepareWarningElem, appendAfterElem} from './warning_functions.js';
import {isLoginAvailable, validateName, validateSurname, validateBDate, validatePesel, validateCountry, validatePostalCode, validateCity, validateStreet, validateHouseNr, validateLogin, validatePasswd, arePasswdsTheSame} from './validation_functions.js';
import {GET, POST, URL, HTTP_STATUS, AVAILABLE_LOGIN, LOGIN_FIELD_ID, PASSWD_FIELD_ID} from './const.js'


document.addEventListener('DOMContentLoaded', function (event) {

    prepareOtherEventOnChange(LOGIN_FIELD_ID, updateLoginCorrectMessage);

    let loginForm = document.getElementById("login-form");

    loginForm.addEventListener("submit", function (event) {
        event.preventDefault();

        var canSend = (false);

        if(canSend) {
            submitForm(loginForm, "login", " Zalogowano pomyślnie.", "Błędny login lub hasło.");
        } else {
            removeWarningMessage("correct");
            id = "button-log-form";
            let uncorrectElem = prepareWarningElem("uncorrect", "Błędny login lub hasło.");
            uncorrectElem.className = "uncorrect-field"
            appendAfterElem(id, uncorrectElem);
        }
    });
});

function updateLoginCorrectMessage() {
    let warningElemId = "loginWarning";

    isLoginAvailable().then(function (isAvailable) {
        if (isAvailable) {
            console.log("Brak użytkownika w bazie.");
            showWarningMessage(warningElemId, "Użytkownik o podanym loginie nie istnieje.", LOGIN_FIELD_ID);
        } else {
            console.log("OK.");
            removeWarningMessage(warningElemId);
        }
    }).catch(function (error) {
        console.error("Something went wrong while checking login.");
        console.error(error);
    });
}