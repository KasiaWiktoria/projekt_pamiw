import {addCorrectMessage, addfailureMessage, submitForm, updateCorrectnessMessage, prepareOtherEventOnChange} from './form_functions.js';
import {showWarningMessage, removeWarningMessage, prepareWarningElem, appendAfterElem} from './warning_functions.js';
import {isAnyFieldBlank, isLoginAvailable, validateName, validateSurname, validateBDate, validatePesel, validateCountry, validatePostalCode, validateCity, validateStreet, validateHouseNr, validateLogin, validatePasswd, arePasswdsTheSame} from './validation_functions.js';
import {GET, POST, URL, HTTP_STATUS, LOGIN_FIELD_ID, PASSWD_FIELD_ID} from './const.js'


document.addEventListener('DOMContentLoaded', function (event) {

    prepareEventOnChange(LOGIN_FIELD_ID, isLoginBlank);
    prepareEventOnChange(PASSWD_FIELD_ID, isPasswdBlank);

    let loginForm = document.getElementById("login-form");

    loginForm.addEventListener("submit", function (event) {
        event.preventDefault();

        let login = document.getElementById(LOGIN_FIELD_ID);
        let password = document.getElementById(PASSWD_FIELD_ID);

        let fields = [login, password];
        if(!isAnyFieldBlank(fields)) {
            submitLoginForm(loginForm, "login");
        } else {
            let id = "button-submit-form";
            addfailureMessage(id,"Żadne pole nie może pozostać puste.")
        }
    });
});

function isLoginBlank(){
    let login = document.getElementById(LOGIN_FIELD_ID);
    let fields = [login];
    if (!isAnyFieldBlank(fields)){
        return ""
    } else{
        return  "nie"
    }
}

function isPasswdBlank(){
    let password = document.getElementById(PASSWD_FIELD_ID);
    let fields = [password];
    if (!isAnyFieldBlank(fields)){
        return ""
    } else{
        return  "nie"
    }
}

function submitLoginForm(form, name) {
    let loginUrl = URL + name;
    console.log(loginUrl);
    let successMessage = "Zalogowano pomyślnie.";
    let failureMessage = "Błędny login lub hasło.";
    

    let registerParams = {
        method: POST,
        mode: 'cors',
        body: new FormData(form),
        redirect: "follow"
    };

    fetch(loginUrl, registerParams)
            .then(response => getResponseData(response, successMessage, failureMessage))
            .catch(err => {
                console.log("Caught error: " + err);
                let id = "button-submit-form";
                addfailureMessage(id,failureMessage);
            });
}

function getResponseData(response, successMessage, failureMessage) {
    let status = response.status;
    let id = "button-submit-form";

    if (status === HTTP_STATUS.OK) {
        console.log("Logged in successfully.");

        addCorrectMessage(id,successMessage)
        window.location.href = 'waybills_list'
    } else if (status == HTTP_STATUS.BAD_REQUEST) {
        console.log("Incorrect authorization data.")
        addfailureMessage(id,failureMessage)
    } else {
        console.error("Response status code: " + response.status);
        addfailureMessage(id,"Logowanie nie powiodło się. Nie jesteśmy w stanie zweryfikować poprawności wprowadzonych danych.")
        throw "Unexpected response status: " + response.status;
    }
}

function prepareEventOnChange(FIELD_ID, validationFunction) {
    let loginInput = document.getElementById(FIELD_ID);
    loginInput.addEventListener("change", updateCorrectnessMessage.bind(event, FIELD_ID, validationFunction));
}

