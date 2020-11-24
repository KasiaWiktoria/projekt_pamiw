import {submitForm, prepareEventOnChange} from './form_functions.js';
import {showWarningMessage, removeWarningMessage, prepareWarningElem, appendAfterElem} from './warning_functions.js';
import {noSpecialCharacters, validateName, validateSurname, validateCountry, validatePostalCode, validateCity, validateStreet, validateHouseNr, validateLogin, validatePasswd, arePasswdsTheSame, validatePhone} from './validation_functions.js';
import {GET, POST, URL, HTTP_STATUS,AVAILABLE_LOGIN, PRODUCT_NAME_FIELD_ID, SENDER_NAME_FIELD_ID, SENDER_SURNAME_FIELD_ID, SENDER_PHONE_FIELD_ID, SENDER_COUNTRY_FIELD_ID, SENDER_POSTAL_CODE_FIELD_ID, SENDER_CITY_FIELD_ID, SENDER_STREET_FIELD_ID, SENDER_HOUSE_NR_FIELD_ID, RECIPIENT_NAME_FIELD_ID, RECIPIENT_SURNAME_FIELD_ID, RECIPIENT_PHONE_FIELD_ID, RECIPIENT_COUNTRY_FIELD_ID, RECIPIENT_POSTAL_CODE_FIELD_ID, RECIPIENT_CITY_FIELD_ID, RECIPIENT_STREET_FIELD_ID, RECIPIENT_HOUSE_NR_FIELD_ID, PACK_IMAGE_FIELD_ID} from './const.js'

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

    prepareEventOnChange(RECIPIENT_NAME_FIELD_ID, validateName);
    prepareEventOnChange(RECIPIENT_SURNAME_FIELD_ID, validateSurname);
    prepareEventOnChange(RECIPIENT_PHONE_FIELD_ID, validatePhone);
    prepareEventOnChange(RECIPIENT_COUNTRY_FIELD_ID, validateCountry);
    prepareEventOnChange(RECIPIENT_POSTAL_CODE_FIELD_ID, validatePostalCode);
    prepareEventOnChange(RECIPIENT_CITY_FIELD_ID, validateCity);
    prepareEventOnChange(RECIPIENT_STREET_FIELD_ID, validateStreet);
    prepareEventOnChange(RECIPIENT_HOUSE_NR_FIELD_ID, validateHouseNr);

    //prepareEventOnChange(PACK_IMAGE_FIELD_ID, validateFile);

    let sendForm = document.getElementById("send-form");

    sendForm.addEventListener("submit", function (event) {
        event.preventDefault();

        var senderDataCorrect = (validateName(SENDER_NAME_FIELD_ID) == "" && validateSurname(SENDER_SURNAME_FIELD_ID) == "" && validatePhone(SENDER_PHONE_FIELD_ID)&& validateCountry(SENDER_COUNTRY_FIELD_ID) == "" && validateCity(SENDER_CITY_FIELD_ID) == "" && validateStreet(SENDER_STREET_FIELD_ID) == "" && validateHouseNr(SENDER_HOUSE_NR_FIELD_ID) == "" );
        var recipientDataCorrect = (validateName(RECIPIENT_NAME_FIELD_ID) == "" && validateSurname(RECIPIENT_SURNAME_FIELD_ID) == "" && validatePhone(RECIPIENT_PHONE_FIELD_ID)&& validateCountry(RECIPIENT_COUNTRY_FIELD_ID) == "" && validateCity(RECIPIENT_CITY_FIELD_ID) == "" && validateStreet(RECIPIENT_STREET_FIELD_ID) == "" && validateHouseNr(RECIPIENT_HOUSE_NR_FIELD_ID) == "" );
        var productNameAndImgCorrect = (noSpecialCharacters(PRODUCT_NAME_FIELD_ID) == "" && validateFile(PACK_IMAGE_FIELD_ID));

        if(senderDataCorrect && recipientDataCorrect && productNameAndImgCorrect) {
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
