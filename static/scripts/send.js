import {addCorrectMessage, addfailureMessage, prepareEventOnChange} from './form_functions.js';
import {showWarningMessage, removeWarningMessage, prepareWarningElem, appendAfterElem} from './warning_functions.js';
import {isAnyFieldBlank, noSpecialCharacters, validateName, validateSurname, validateCountry, validatePostalCode, validateCity, validateStreet, validateHouseNr, validatePhone, validateFile} from './validation_functions.js';
import {GET, POST, URL, HTTP_STATUS, PRODUCT_NAME_FIELD_ID, SENDER_NAME_FIELD_ID, SENDER_SURNAME_FIELD_ID, SENDER_PHONE_FIELD_ID, SENDER_COUNTRY_FIELD_ID, SENDER_POSTAL_CODE_FIELD_ID, SENDER_CITY_FIELD_ID, SENDER_STREET_FIELD_ID, SENDER_HOUSE_NR_FIELD_ID, RECIPIENT_NAME_FIELD_ID, RECIPIENT_SURNAME_FIELD_ID, RECIPIENT_PHONE_FIELD_ID, RECIPIENT_COUNTRY_FIELD_ID, RECIPIENT_POSTAL_CODE_FIELD_ID, RECIPIENT_CITY_FIELD_ID, RECIPIENT_STREET_FIELD_ID, RECIPIENT_HOUSE_NR_FIELD_ID, PACK_IMAGE_FIELD_ID} from './const.js'

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

    prepareEventOnFileChange(PACK_IMAGE_FIELD_ID, validateFile);

    let sendForm = document.getElementById("send-form");
/*
    sendForm.addEventListener("submit", function (event) {
        event.preventDefault();

        var senderDataCorrect = (validateName(SENDER_NAME_FIELD_ID) == "" && validateSurname(SENDER_SURNAME_FIELD_ID) == "" && validatePhone(SENDER_PHONE_FIELD_ID) == "" && validateCountry(SENDER_COUNTRY_FIELD_ID) == "" && validateCity(SENDER_CITY_FIELD_ID) == "" && validateStreet(SENDER_STREET_FIELD_ID) == "" && validateHouseNr(SENDER_HOUSE_NR_FIELD_ID) == "" );
        var recipientDataCorrect = (validateName(RECIPIENT_NAME_FIELD_ID) == "" && validateSurname(RECIPIENT_SURNAME_FIELD_ID) == "" && validatePhone(RECIPIENT_PHONE_FIELD_ID) == "" && validateCountry(RECIPIENT_COUNTRY_FIELD_ID) == "" && validateCity(RECIPIENT_CITY_FIELD_ID) == "" && validateStreet(RECIPIENT_STREET_FIELD_ID) == "" && validateHouseNr(RECIPIENT_HOUSE_NR_FIELD_ID) == "" );
        var productNameAndImgCorrect = (noSpecialCharacters(PRODUCT_NAME_FIELD_ID) == "" && validateFile(PACK_IMAGE_FIELD_ID) == "");

        if(senderDataCorrect && recipientDataCorrect && productNameAndImgCorrect) {
            submitForm(sendForm)
        } else {
            let failureMessage = "Generowanie listu przewozowego nie powiodło się. ";
            let id = "button-submit-form";
            addfailureMessage(id,failureMessage);
        }
    });
*/
    function submitForm(form) {
        let url = "https://localhost:8081/waybill";
        console.log(url);

        let successMessage = "Pomyślnie wygenerowano list przewozowy.";
        let failureMessage = "Generowanie listu przewozowego nie powiodło się. ";
    
        let registerParams = {
            method: POST,
            mode: 'cors',
            body: new FormData(form),
            redirect: "follow"
        };
    
        fetch(url, registerParams)
                .then(response => getResponseData(response, successMessage, failureMessage)).catch(err => {
                    console.log("Caught error: " + err);
                    removeWarningMessage("correct");
                    let id = "button-submit-form";
    
                    let uncorrectElem = prepareWarningElem("uncorrect", failureMessage);
                    uncorrectElem.className = "uncorrect-field"
                    appendAfterElem(id, uncorrectElem);
                });
    }

    function getResponseData(response, successMessage, failureMessage) {
        let status = response.status;
    
        if (status === HTTP_STATUS.OK) {
            console.log("Status =" + status);
            return "OK"
        } else {
            console.error("Response status code: " + response.status);
            throw "Unexpected response status: " + response.status;
        }
    }

    function prepareEventOnFileChange(FIELD_ID, validationFunction) {
        let loginInput = document.getElementById(FIELD_ID);
        loginInput.addEventListener("change", updateCorrectnessMessageAndShowFile.bind(event, FIELD_ID, validationFunction));
    }
    
    function updateCorrectnessMessageAndShowFile(FIELD_ID, validationFunction) {
        let warningElemId = FIELD_ID + "Warning";
        let fileInput = document.getElementById(FIELD_ID);
    
        if(document.getElementById(FIELD_ID).value == ""){
            removeWarningMessage(warningElemId);
        } else if (validationFunction(FIELD_ID) == "") {
            console.log("Correct " + FIELD_ID + "!");
            removeWarningMessage(warningElemId);
            addPreview(fileInput);
        } else {
            console.log("Uncorrect " + FIELD_ID + ".");
            showWarningMessage(warningElemId, validationFunction(FIELD_ID), FIELD_ID);
        }
    }

    function addPreview(fileInput){
        if (fileInput.files && fileInput.files[0]) { 
            var reader = new FileReader(); 
            reader.onload = function(e) { 
                appendAfterElem("upload-section",prepareImgElem());
                
                document.getElementById( 
                    'imagePreview').innerHTML =  
                    '<img src="' + e.target.result 
                    + '"/>'; 
            }; 
              
            reader.readAsDataURL(fileInput.files[0]); 
        } 
    }
    
    function prepareImgElem() {
        let newElemId = "imagePreview";
        let imagePreview = document.getElementById(newElemId);
    
        if (imagePreview === null) {
            imagePreview = document.createElement('div');
    
            imagePreview.setAttribute("id", newElemId);
            imagePreview.className = "image-preview";
        }
        return imagePreview;
    }
});
