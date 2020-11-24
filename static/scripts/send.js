import {submitForm, prepareEventOnChange} from './form_functions.js';
import {showWarningMessage, removeWarningMessage, prepareWarningElem, appendAfterElem} from './warning_functions.js';
import {noSpecialCharacters, validateName, validateSurname, validateCountry, validatePostalCode, validateCity, validateStreet, validateHouseNr, validateLogin, validatePasswd, arePasswdsTheSame, validatePhone} from './validation_functions.js';
import {GET, POST, URL, HTTP_STATUS,AVAILABLE_LOGIN, PRODUCT_NAME_FIELD_ID, SENDER_NAME_FIELD_ID, SENDER_SURNAME_FIELD_ID, SENDER_PHONE_FIELD_ID, SENDER_COUNTRY_FIELD_ID, SENDER_POSTAL_CODE_FIELD_ID, SENDER_CITY_FIELD_ID, SENDER_STREET_FIELD_ID, SENDER_HOUSE_NR_FIELD_ID, RECIPENT_NAME_FIELD_ID, SENDER_SURNAME_FIELD_ID, RECIPENT_PHONE_FIELD_ID, RECIPENT_COUNTRY_FIELD_ID, RECIPENT_POSTAL_CODE_FIELD_ID, RECIPENT_CITY_FIELD_ID, RECIPENT_STREET_FIELD_ID, RECIPENT_HOUSE_NR_FIELD_ID, PACK_IMAGE_FIELD_ID} from './const.js'

document.addEventListener('DOMContentLoaded', function (event) {

    prepareEventOnChange(PRODUCT_NAME_FIELD_ID, noSpecialCharacters);

    prepareEventOnChange(SENDER_NAME_FIELD_ID, validateName);
    prepareEventOnChange(SENDER_SURNAME_FIELD_ID, validateSurname);
    prepareEventOnChange(SENDER_PHONE_FIELD_ID, validatePhone);
    prepareEventOnChange(SENDER_COUNTRY_FIELD_ID, validateCountry);
    prepareEventOnChange(SENDER_POSTAL_CODE_FIELD_ID, validatePostalCode);
    prepareEventOnChange(SENDER_CITY_FIELD_ID, validateCity);
    prepareEventOnChange(SENDER_STREET_FIELD_ID, validateStreet);
    prepareEventOnChange(SENDER_HOUSE_NR_FIELD_ID, validateHouseNr);

    prepareEventOnChange(RECIPENT_NAME_FIELD_ID, validateName);
    prepareEventOnChange(RECIPENT_SURNAME_FIELD_ID, validateSurname);
    prepareEventOnChange(RECIPENT_PHONE_FIELD_ID, validatePhone);
    prepareEventOnChange(RECIPENT_COUNTRY_FIELD_ID, validateCountry);
    prepareEventOnChange(RECIPENT_POSTAL_CODE_FIELD_ID, validatePostalCode);
    prepareEventOnChange(RECIPENT_CITY_FIELD_ID, validateCity);
    prepareEventOnChange(RECIPENT_STREET_FIELD_ID, validateStreet);
    prepareEventOnChange(RECIPENT_HOUSE_NR_FIELD_ID, validateHouseNr);

    prepareEventOnChange(PACK_IMAGE_FIELD_ID, validateFile);

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
