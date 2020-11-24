import '/form_functions.js';
import '/validation_functions.js';
import '/warning_functions.js';

document.addEventListener('DOMContentLoaded', function (event) {

    const GET = "GET";
    const POST = "POST";
    const URL = "https://pamiw2020registration.herokuapp.com/";

    const NAME_FIELD_ID = "name";
    const SURNAME_FIELD_ID = "surname";
    const BDATE_FIELD_ID = "bdate";
    const PESEL_FIELD_ID = "pesel";
    const COUNTRY_FIELD_ID = "country";
    const POSTAL_CODE_FIELD_ID = "postal_code";
    const CITY_FIELD_ID = "city";
    const STREET_FIELD_ID = "street";
    const HOUSE_NR_FIELD_ID = "house_nr";
    const LOGIN_FIELD_ID = "login";
    const PASSWD_FIELD_ID = "password";
    const REPEAT_PASSWD_FIELD_ID = "second_password";

    var HTTP_STATUS = {OK: 200, CREATED: 201, NOT_FOUND: 404};

    var AVAILABLE_LOGIN = false;

    prepareEventOnChange(NAME_FIELD_ID, validateName, updateCorrectnessMessage);
    prepareEventOnChange(SURNAME_FIELD_ID, validateSurname, updateCorrectnessMessage);
    prepareEventOnChange(BDATE_FIELD_ID, validateBDate, updateCorrectnessMessage);
    prepareEventOnChange(PESEL_FIELD_ID, validatePesel, updateCorrectnessMessage);
    prepareEventOnChange(COUNTRY_FIELD_ID, validateCountry, updateCorrectnessMessage);
    prepareEventOnChange(POSTAL_CODE_FIELD_ID, validatePostalCode ,updateCorrectnessMessage);
    prepareEventOnChange(CITY_FIELD_ID, validateCity, updateCorrectnessMessage);
    prepareEventOnChange(STREET_FIELD_ID, validateStreet, updateCorrectnessMessage);
    prepareEventOnChange(HOUSE_NR_FIELD_ID, validateHouseNr, updateCorrectnessMessage);
    prepareLoginEventOnChange(LOGIN_FIELD_ID, updateLoginAvailabilityMessage);
    prepareLoginEventOnChange(PASSWD_FIELD_ID, updatePasswdCorrectnessMessage);
    prepareLoginEventOnChange(REPEAT_PASSWD_FIELD_ID, updateRepeatPasswdCorrectnessMessage);

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

});
