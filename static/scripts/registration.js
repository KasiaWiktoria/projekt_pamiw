import {addCorrectMessage, addfailureMessage, submitForm, updateCorrectnessMessage, prepareOtherEventOnChange, prepareEventOnChange} from './form_functions.js';
import {showWarningMessage, removeWarningMessage, prepareWarningElem, appendAfterElem} from './warning_functions.js';
import {isAnyFieldBlank, isLoginAvailable, validateName, validateSurname, validateBDate, validatePesel, validateCountry, validatePostalCode, validateCity, validateStreet, validateHouseNr, validateLogin, validatePasswd, arePasswdsTheSame} from './validation_functions.js';
import {GET, POST, URL, HTTP_STATUS,NAME_FIELD_ID, SURNAME_FIELD_ID, BDATE_FIELD_ID, PESEL_FIELD_ID, COUNTRY_FIELD_ID, POSTAL_CODE_FIELD_ID, CITY_FIELD_ID, STREET_FIELD_ID, HOUSE_NR_FIELD_ID, LOGIN_FIELD_ID,PASSWD_FIELD_ID, REPEAT_PASSWD_FIELD_ID} from './const.js'

document.addEventListener('DOMContentLoaded', function (event) {

    prepareEventOnChange(NAME_FIELD_ID, validateName);
    prepareEventOnChange(SURNAME_FIELD_ID, validateSurname);
    prepareEventOnChange(BDATE_FIELD_ID, validateBDate);
    prepareEventOnChange(PESEL_FIELD_ID, validatePesel);
    prepareEventOnChange(COUNTRY_FIELD_ID, validateCountry);
    prepareEventOnChange(POSTAL_CODE_FIELD_ID, validatePostalCode);
    prepareEventOnChange(CITY_FIELD_ID, validateCity);
    prepareEventOnChange(STREET_FIELD_ID, validateStreet);
    prepareEventOnChange(HOUSE_NR_FIELD_ID, validateHouseNr);
    prepareOtherEventOnChange(LOGIN_FIELD_ID, updateLoginAvailabilityMessage);
    prepareOtherEventOnChange(PASSWD_FIELD_ID, updatePasswdCorrectnessMessage);
    prepareOtherEventOnChange(REPEAT_PASSWD_FIELD_ID, updateRepeatPasswdCorrectnessMessage);

    var AVAILABLE_LOGIN = false;
    let registrationForm = document.getElementById("registration-form");

    registrationForm.addEventListener("submit", function (event) {
        event.preventDefault();

        var canSend = (AVAILABLE_LOGIN && validateLogin() == "" && validateName(NAME_FIELD_ID) == "" && validateSurname(SURNAME_FIELD_ID) == "" && validateBDate(BDATE_FIELD_ID) == "" && validatePesel(PESEL_FIELD_ID) == "" && validateCountry(COUNTRY_FIELD_ID) == "" && validateCity(CITY_FIELD_ID) == "" && validateStreet(STREET_FIELD_ID) == "" && validateHouseNr(HOUSE_NR_FIELD_ID) == "" && validatePasswd() == "" && arePasswdsTheSame());

        let name = document.getElementById(NAME_FIELD_ID)
        let surname = document.getElementById(SURNAME_FIELD_ID)
        let bdate = document.getElementById(BDATE_FIELD_ID)
        let pesel = document.getElementById(PESEL_FIELD_ID)
        let country = document.getElementById(COUNTRY_FIELD_ID)
        let postal_code = document.getElementById(POSTAL_CODE_FIELD_ID)
        let city = document.getElementById(CITY_FIELD_ID)
        let street = document.getElementById(STREET_FIELD_ID)
        let house_nr = document.getElementById(HOUSE_NR_FIELD_ID)
        let login = document.getElementById(LOGIN_FIELD_ID);
        let password = document.getElementById(PASSWD_FIELD_ID);
        let repeat_password = document.getElementById(REPEAT_PASSWD_FIELD_ID)


        let fields = [name, surname, bdate, pesel, country, postal_code, city, street, house_nr, login, password, repeat_password];
        if(!isAnyFieldBlank(fields)) {
            if(canSend) {
                submitForm(URL, registrationForm, "registration", " Zarejestrowano pomyślnie.", "Rejestracja nie powiodła się. ");
            } else if(canSend != false){
                console.log('Wrong type of variable.');
            } else {
                console.log('Not correct fields.');
                
                let failureMessage = "Rejestracja nie powiodła się. Sprawdź czy wszystkie pola są wypełnione poprawnie.";
                let id = "button-submit-form";
                addfailureMessage(id,failureMessage);
            }
        } else {
            let id = "button-submit-form";
            addfailureMessage(id,"Żadne pole nie może pozostać puste.")
        }
    });

    function updateLoginAvailabilityMessage() {
        let warningElemId = "loginWarning";
    
        let warningMessage = validateLogin();
        if (warningMessage == "") {
            console.log("Correct login!");
            removeWarningMessage(warningElemId);
            warningMessage = "Podany login jest już zajęty.";
    
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
                showWarningMessage(warningElemId, "W tej chwili nie jesteśmy w stanie zweryfikować dostępności loginu.", LOGIN_FIELD_ID);
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
    
        removeWarningMessage(warningElemId);
        if (warningMessage == "") {
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
            removeWarningMessage("passwdWarning");
            if (validatePasswd() !== "") {
                showWarningMessage(warningElemId, validatePasswd(), PASSWD_FIELD_ID);
            }
        } else {
            console.log("Uncorrect repeat password");
            showWarningMessage(warningElemId, warningMessage, REPEAT_PASSWD_FIELD_ID);
        }
    }

});
