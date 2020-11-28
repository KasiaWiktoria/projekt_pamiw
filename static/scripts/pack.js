import {submitForm, prepareEventOnChange} from './form_functions.js';
import {showWarningMessage, removeWarningMessage, prepareWarningElem, appendAfterElem} from './warning_functions.js';
import {noSpecialCharacters, validateName, validateSurname, validateCountry, validatePostalCode, validateCity, validateStreet, validateHouseNr, validatePhone, validateFile} from './validation_functions.js';
import {GET, POST, URL, HTTP_STATUS, PRODUCT_NAME_FIELD_ID, SENDER_NAME_FIELD_ID, SENDER_SURNAME_FIELD_ID, SENDER_PHONE_FIELD_ID, SENDER_COUNTRY_FIELD_ID, SENDER_POSTAL_CODE_FIELD_ID, SENDER_CITY_FIELD_ID, SENDER_STREET_FIELD_ID, SENDER_HOUSE_NR_FIELD_ID, RECIPIENT_NAME_FIELD_ID, RECIPIENT_SURNAME_FIELD_ID, RECIPIENT_PHONE_FIELD_ID, RECIPIENT_COUNTRY_FIELD_ID, RECIPIENT_POSTAL_CODE_FIELD_ID, RECIPIENT_CITY_FIELD_ID, RECIPIENT_STREET_FIELD_ID, RECIPIENT_HOUSE_NR_FIELD_ID, PACK_IMAGE_FIELD_ID} from './const.js'




