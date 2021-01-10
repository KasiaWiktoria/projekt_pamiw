import {addCorrectMessage, addfailureMessage, prepareEventOnChange} from './form_functions.js';
import {showWarningMessage, removeWarningMessage, prepareWarningElem, appendAfterElem} from './warning_functions.js';
import {isAnyFieldBlank, noSpecialCharacters, validateName, validateSurname, validateCountry, validatePostalCode, validateCity, validateStreet, validateHouseNr, validatePhone, validateFile} from './validation_functions.js';
import {GET, POST, URL, HTTP_STATUS, PRODUCT_NAME_FIELD_ID, SENDER_NAME_FIELD_ID, SENDER_SURNAME_FIELD_ID, SENDER_PHONE_FIELD_ID, SENDER_COUNTRY_FIELD_ID, SENDER_POSTAL_CODE_FIELD_ID, SENDER_CITY_FIELD_ID, SENDER_STREET_FIELD_ID, SENDER_HOUSE_NR_FIELD_ID, RECIPIENT_NAME_FIELD_ID, RECIPIENT_SURNAME_FIELD_ID, RECIPIENT_PHONE_FIELD_ID, RECIPIENT_COUNTRY_FIELD_ID, RECIPIENT_POSTAL_CODE_FIELD_ID, RECIPIENT_CITY_FIELD_ID, RECIPIENT_STREET_FIELD_ID, RECIPIENT_HOUSE_NR_FIELD_ID, PACK_IMAGE_FIELD_ID, waybillURL} from './const.js'

document.addEventListener('DOMContentLoaded', function (event) {
    //getAccessToken();

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

    sendForm.addEventListener("submit", function (event) {
        event.preventDefault();

        removeWarningMessage("uncorrect");
        removeWarningMessage("correct");
        
        var senderDataCorrect = (validateName(SENDER_NAME_FIELD_ID) == "" && validateSurname(SENDER_SURNAME_FIELD_ID) == "" && validatePhone(SENDER_PHONE_FIELD_ID) == "" && validateCountry(SENDER_COUNTRY_FIELD_ID) == "" && validateCity(SENDER_CITY_FIELD_ID) == "" && validateStreet(SENDER_STREET_FIELD_ID) == "" && validateHouseNr(SENDER_HOUSE_NR_FIELD_ID) == "" );
        var recipientDataCorrect = (validateName(RECIPIENT_NAME_FIELD_ID) == "" && validateSurname(RECIPIENT_SURNAME_FIELD_ID) == "" && validatePhone(RECIPIENT_PHONE_FIELD_ID) == "" && validateCountry(RECIPIENT_COUNTRY_FIELD_ID) == "" && validateCity(RECIPIENT_CITY_FIELD_ID) == "" && validateStreet(RECIPIENT_STREET_FIELD_ID) == "" && validateHouseNr(RECIPIENT_HOUSE_NR_FIELD_ID) == "" );
        var productNameAndImgCorrect = (noSpecialCharacters(PRODUCT_NAME_FIELD_ID) == "" && validateFile(PACK_IMAGE_FIELD_ID) == "");

        let canSend = senderDataCorrect && recipientDataCorrect && productNameAndImgCorrect;
        console.log('senderDataCorrect: ' + senderDataCorrect);
        console.log('recipientDataCorrect: ' + recipientDataCorrect);
        console.log('productNameAndImgCorrect: ' + productNameAndImgCorrect);
        console.log('canSend:' + canSend);

        let product_name = document.getElementById(PRODUCT_NAME_FIELD_ID)

        let sender_name = document.getElementById(SENDER_NAME_FIELD_ID)
        let sender_surname = document.getElementById(SENDER_SURNAME_FIELD_ID)
        let sender_phone = document.getElementById(SENDER_PHONE_FIELD_ID)
        let sender_country = document.getElementById(SENDER_COUNTRY_FIELD_ID)
        let sender_postal_code = document.getElementById(SENDER_POSTAL_CODE_FIELD_ID)
        let sender_city = document.getElementById(SENDER_CITY_FIELD_ID)
        let sender_street = document.getElementById(SENDER_STREET_FIELD_ID)
        let sender_house_nr = document.getElementById(SENDER_HOUSE_NR_FIELD_ID)

        let recipient_name = document.getElementById(RECIPIENT_NAME_FIELD_ID)
        let recipient_surname = document.getElementById(RECIPIENT_SURNAME_FIELD_ID)
        let recipient_phone = document.getElementById(RECIPIENT_PHONE_FIELD_ID)
        let recipient_country = document.getElementById(RECIPIENT_COUNTRY_FIELD_ID)
        let recipient_postal_code = document.getElementById(RECIPIENT_POSTAL_CODE_FIELD_ID)
        let recipient_city = document.getElementById(RECIPIENT_CITY_FIELD_ID)
        let recipient_street = document.getElementById(RECIPIENT_STREET_FIELD_ID)
        let recipient_house_nr = document.getElementById(RECIPIENT_HOUSE_NR_FIELD_ID)

        let photo = document.getElementById(PACK_IMAGE_FIELD_ID)

        let fields = [product_name, sender_name, sender_surname, sender_phone, sender_country, sender_postal_code, sender_city, sender_street, sender_house_nr, recipient_name, recipient_surname, recipient_phone, recipient_country, recipient_city, recipient_postal_code, recipient_street, recipient_house_nr, photo];
        if(!isAnyFieldBlank(fields)) {
            if(canSend) {
                submitForm(sendForm)
            } else {
                let failureMessage = "Generowanie listu przewozowego nie powiodło się. ";
                let id = "button-submit-form";
                addfailureMessage(id,failureMessage);
            }
        } else {
            let id = "button-submit-form";
            addfailureMessage(id,"Żadne pole nie może pozostać puste.")
        }
    });

    function submitForm(form) {
        let url = URL + 'logged_in_user'
        console.log(url)
        fetch(url, {method: GET}).then(response => getJsonResponse(response))
        .then(response => {
            try{
                let user = response.user;
                console.log('user:' + user);
                sendPackage(form);
            } catch (error){
                console.log(error)
                console.log("User is probably not logged in.")
                let id = "button-submit-form";
                failureMessage = "Nie jesteś zalogowany. Spróbuj zalogować się ponownie.";
                addfailureMessage(id,failureMessage)
            }
        })
        .catch(err => {
            console.log("Caught error: " + err);
            let failureMessage = "Generowanie listu przewozowego nie powiodło się. ";

            let id = "button-submit-form";
            failureMessage = failureMessage + "Nie udało się pobrać nazwy aktualnie zalogowanego użytkownika."
            addfailureMessage(id,failureMessage)
        });
        
    }
    
    function getJsonResponse(response){
        if (response.status == HTTP_STATUS.OK) {
            return response.json();
        } else {
            return response.status;
        }
    }

    function sendPackage(form){
        let url = waybillURL + 'waybill';
        console.log(url);

        let successMessage = "Pomyślnie wygenerowano list przewozowy.";
        let failureMessage = "Generowanie listu przewozowego nie powiodło się. ";
    
        let sendParams = {
            //headers: {'Access-Control-Allow-Origin': URL, 'Access-Control-Allow-Credentials': true},
            credentials: 'include',
            method: POST,
            mode: 'cors',
            body: new FormData(form),
            //redirect: "follow"
        };

        fetch(url, sendParams).then(response => {
            console.log("odpowiedź: " + response)
            return getJsonResponse(response)
            })
            .then(response => getResponseData(response, successMessage, failureMessage))
            .catch(err => {
                console.log("Caught error: " + err);
                let id = "button-submit-form";
                addfailureMessage(id,failureMessage)
            });
    }


    function getJsonResponse(response){
        if(response.status == HTTP_STATUS.UNAUTHORIZED){
            console.log('Prawdopodobnie wygasła ważność tokenu jwt.')
            addfailureMessage(id,'Prawdopodobnie wygasła ważność tokenu jwt.')
        } else {
            return response.json();
        }
        
    }
    

    function getResponseData(response, successMessage, failureMessage) {
        let status = response.status;
    
        if (response.status == HTTP_STATUS.CREATED || response.status == HTTP_STATUS.OK) {
            console.log("Status =" + status);
            let id = "button-submit-form";
            addCorrectMessage(id,response.message)
        } else {
            console.error("Response status code: " + response.status);
            let id = "button-submit-form";
            addfailureMessage(id,response.message)
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
        removeWarningMessage("uncorrect");
        removeWarningMessage("correct");
    
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


    function getAccessToken(){
        let url = URL + 'get_access_token'
        let registerParams = {
            method: GET,
            redirect: "follow"
        };

        fetch(url, registerParams)
            .then(response => getResponseTokenData(response))
            .then(response => displayInConsoleCorrectTokenResponse(response))
            .catch(err => {
                console.log("Caught error: " + err);
                
            });
    }

    function getResponseTokenData(response) {
        let status = response.status;

        if (status === HTTP_STATUS.OK) {
            return response.json();
        } else {
            console.error("Response status code: " + response.status);
            throw "Unexpected response status: " + response.status;
        }
    }

    function displayInConsoleCorrectTokenResponse(correctResponse) {
        let access_token = correctResponse.access_token;
        console.log('Pobrano token: ' + access_token);

        window.localStorage.setItem('accessToken', 'Bearer: ' + access_token)

    }
});