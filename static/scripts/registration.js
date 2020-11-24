import {submitForm, updateCorrectnessMessage, prepareEventOnChange} from './form_functions.js';
import {showWarningMessage, removeWarningMessage, prepareWarningElem, appendAfterElem} from './warning_functions.js';
import {validateName, validateSurname, validateBDate, validatePesel, validateCountry, validatePostalCode, validateCity, validateStreet, validateHouseNr, validateLogin, validatePasswd, arePasswdsTheSame} from './validation_functions.js';
import {GET, POST, URL, HTTP_STATUS,AVAILABLE_LOGIN,NAME_FIELD_ID, SURNAME_FIELD_ID, BDATE_FIELD_ID, PESEL_FIELD_ID, COUNTRY_FIELD_ID, POSTAL_CODE_FIELD_ID, CITY_FIELD_ID, STREET_FIELD_ID, HOUSE_NR_FIELD_ID, LOGIN_FIELD_ID,PASSWD_FIELD_ID, REPEAT_PASSWD_FIELD_ID} from './const.js'

document.addEventListener('DOMContentLoaded', function (event) {

    prepareEventOnChange(NAME_FIELD_ID, validateName, updateCorrectnessMessage);
    prepareEventOnChange(SURNAME_FIELD_ID, validateSurname, updateCorrectnessMessage);
    prepareEventOnChange(BDATE_FIELD_ID, validateBDate, updateCorrectnessMessage);
    prepareEventOnChange(PESEL_FIELD_ID, validatePesel, updateCorrectnessMessage);
    prepareEventOnChange(COUNTRY_FIELD_ID, validateCountry, updateCorrectnessMessage);
    prepareEventOnChange(POSTAL_CODE_FIELD_ID, validatePostalCode ,updateCorrectnessMessage);
    prepareEventOnChange(CITY_FIELD_ID, validateCity, updateCorrectnessMessage);
    prepareEventOnChange(STREET_FIELD_ID, validateStreet, updateCorrectnessMessage);
    prepareEventOnChange(HOUSE_NR_FIELD_ID, validateHouseNr, updateCorrectnessMessage);
    prepareOtherEventOnChange(LOGIN_FIELD_ID, updateLoginAvailabilityMessage);
    prepareOtherEventOnChange(PASSWD_FIELD_ID, updatePasswdCorrectnessMessage);
    prepareOtherEventOnChange(REPEAT_PASSWD_FIELD_ID, updateRepeatPasswdCorrectnessMessage);

    let registrationForm = document.getElementById("registration-form");

    registrationForm.addEventListener("submit", function (event) {
        event.preventDefault();

        var login = document.getElementById(LOGIN_FIELD_ID).value;
        var pesel = document.getElementById(PESEL_FIELD_ID).value;
        var password = document.getElementById(PASSWD_FIELD_ID).value;
        var repeatePassword = document.getElementById(REPEAT_PASSWD_FIELD_ID).value;

        var canSend = (AVAILABLE_LOGIN && validateLogin() == "" && validatePesel() == "" && validatePasswd() == "" && arePasswdsTheSame());

        if(canSend) {
            var formData = new FormData();
            formData.set("login", login);
            formData.set("pesel", pesel);
            formData.set("password", password);
            formData.set("second_password", repeatePassword);
            
            submitForm(registrationForm, "register", " Zarejestrowano pomyślnie.", "Rejestracja nie powiodła się. ");
        } else {
            removeWarningMessage("correct");
            id = "button-reg-form";
            let uncorrectElem = prepareWarningElem("uncorrect", "Rejestracja nie powiodła się.");
            uncorrectElem.className = "uncorrect-field"
            appendAfterElem(id, uncorrectElem);
        }
    });

    
    function prepareOtherEventOnChange(FIELD_ID, updateMessageFunction) {
        let loginInput = document.getElementById(FIELD_ID);
        loginInput.addEventListener("change", updateMessageFunction);
    }

    function updateLoginAvailabilityMessage() {
        let warningElemId = "loginWarning";
    
        warningMessage = validateLogin();
        if (warningMessage == "") {
            console.log("Correct login!");
            removeWarningMessage(warningElemId);
            let warningMessage = "Podany login jest już zajęty.";
    
            isLoginAvailable().then(function (isAvailable) {
                if (isAvailable) {
                    console.log("Available login!");
                    removeWarningMessage(warningElemId);
                    AVAILABLE_LOGIN = true;
                } else {
                    console.log("NOT available login");
                    showWarningMessage(warningElemId, warningMessage, LOGIN_FIELD_ID);
                }
            }).catch(function (error) {
                console.error("Something went wrong while checking login.");
                console.error(error);
            });
        } else {
            console.log("Unorrect login.");
            showWarningMessage(warningElemId, warningMessage, LOGIN_FIELD_ID);
        }
    }
    
    function updatePasswdCorrectnessMessage() {
        let warningElemId = "passwdWarning";
        let warningMessage = validatePasswd();
    
        if (warningMessage == "") {
            removeWarningMessage(warningElemId);
            if ((arePasswdsTheSame())) {
                console.log("Correct password!");
                removeWarningMessage("repeatPasswdWarning");
            } else {
                warningMessage = "Podany ciąg znaków nie zgadza się z hasłem podanym poniżej.";
                showWarningMessage(warningElemId, warningMessage, PASSWD_FIELD_ID);
            }
        } else {
            console.log("Uncorrect password");
            showWarningMessage(warningElemId, warningMessage, PASSWD_FIELD_ID);
        }
    }
    
    function updateRepeatPasswdCorrectnessMessage() {
        let warningElemId = "repeatPasswdWarning";
        let warningMessage = "Podany ciąg znaków nie zgadza się z hasłem podanym wyżej.";
    
        if (arePasswdsTheSame()) {
            console.log("Correct repeat password!");
            removeWarningMessage(warningElemId);
            if (validatePasswd() == "") {
                removeWarningMessage("passwdWarning");
            }
        } else {
            console.log("Uncorrect repeat password");
            showWarningMessage(warningElemId, warningMessage, REPEAT_PASSWD_FIELD_ID);
        }
    }

});
