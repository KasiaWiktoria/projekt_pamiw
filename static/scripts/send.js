import {submitForm, updateCorrectnessMessage, prepareEventOnChange} from './form_functions.js';
import {showWarningMessage, removeWarningMessage, prepareWarningElem, appendAfterElem} from './warning_functions.js';
import {validateName, validateSurname, validateCountry, validatePostalCode, validateCity, validateStreet, validateHouseNr, validateLogin, validatePasswd, arePasswdsTheSame} from './validation_functions.js';
import {GET, POST, URL, HTTP_STATUS,AVAILABLE_LOGIN, SENDER_NAME_FIELD_ID, SENDER_SURNAME_FIELD_ID, SENDER_PHONE_FIELD_ID, SENDER_COUNTRY_FIELD_ID, SENDER_POSTAL_CODE_FIELD_ID, SENDER_CITY_FIELD_ID, SENDER_STREET_FIELD_ID, SENDER_HOUSE_NR_FIELD_ID, RECIPENT_NAME_FIELD_ID, SENDER_SURNAME_FIELD_ID, RECIPENT_PHONE_FIELD_ID, RECIPENT_COUNTRY_FIELD_ID, RECIPENT_POSTAL_CODE_FIELD_ID, RECIPENT_CITY_FIELD_ID, RECIPENT_STREET_FIELD_ID, RECIPENT_HOUSE_NR_FIELD_ID} from './const.js'

document.addEventListener('DOMContentLoaded', function (event) {

    prepareEventOnChange(SENDER_NAME_FIELD_ID, validateName, updateCorrectnessMessage);
    prepareEventOnChange(SENDER_SURNAME_FIELD_ID, validateSurname, updateCorrectnessMessage);
    prepareEventOnChange(SENDER_PHONE_FIELD_ID, validatePhone, updateCorrectnessMessage);
    prepareEventOnChange(SENDER_COUNTRY_FIELD_ID, validateCountry, updateCorrectnessMessage);
    prepareEventOnChange(SENDER_POSTAL_CODE_FIELD_ID, validatePostalCode ,updateCorrectnessMessage);
    prepareEventOnChange(SENDER_CITY_FIELD_ID, validateCity, updateCorrectnessMessage);
    prepareEventOnChange(SENDER_STREET_FIELD_ID, validateStreet, updateCorrectnessMessage);
    prepareEventOnChange(SENDER_HOUSE_NR_FIELD_ID, validateHouseNr, updateCorrectnessMessage);

    let sendForm = document.getElementById("send-form");

    sendForm.addEventListener("submit", function (event) {
        event.preventDefault();

        var canSend = ();

        if(canSend) {
            submitForm(sendForm, "send", " Pomyślnie wygenerowano list przewozowy.", "Generowanie listu przewozowego nie powiodło się. ");
        } else {
            removeWarningMessage("correct");
            id = "button-send-form";
            let uncorrectElem = prepareWarningElem("uncorrect", "Generowanie listu przewozowego nie powiodło się. ");
            uncorrectElem.className = "uncorrect-field"
            appendAfterElem(id, uncorrectElem);
        }
    });

});
