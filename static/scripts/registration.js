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

    prepareEventOnChange(NAME_FIELD_ID, validateName(), updateCorrectnessMessage);
    prepareEventOnChange(SURNAME_FIELD_ID, validateSurname(), updateCorrectnessMessage);
    prepareEventOnChange(PESEL_FIELD_ID, validatePesel(), updateCorrectnessMessage);
    prepareEventOnChange(COUNTRY_FIELD_ID, alphabetOnly(COUNTRY_FIELD_ID), updateCorrectnessMessage);
    
    prepareEventOnChange(CITY_FIELD_ID, alphabetOnly(CITY_FIELD_ID), updateCorrectnessMessage);
    prepareEventOnChange(HOUSE_NR_FIELD_ID, validateHouseNr(), updateCorrectnessMessage);
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
            
            submitRegisterForm(formData);
        } else {
            removeWarningMessage("correct");
            id = "button-reg-form";
            let uncorrectElem = prepareWarningElem("uncorrect", "Rejestracja nie powiodła się.");
            uncorrectElem.className = "uncorrect-field"
            appendAfterElem(id, uncorrectElem);
        }
    });

    function submitRegisterForm() {
        let registerUrl = URL + "register";

        let registerParams = {
            method: POST,
            body: new FormData(registrationForm),
            redirect: "follow"
        };

        fetch(registerUrl, registerParams)
                .then(response => getRegisterResponseData(response))
                .then(response => displayInConsoleCorrectResponse(response))
                .catch(err => {
                    console.log("Caught error: " + err);

                });
    }

    function getRegisterResponseData(response) {
        let status = response.status;

        if (status === HTTP_STATUS.OK || status === HTTP_STATUS.CREATED) {
            return response.json();
        } else {
            console.error("Response status code: " + response.status);
            throw "Unexpected response status: " + response.status;
        }
    }

    function displayInConsoleCorrectResponse(correctResponse) {
        let status = correctResponse.registration_status;

        console.log("Status: " + status);

        if (status == "OK") {
            removeWarningMessage("uncorrect");
            id = "button-reg-form";
            let correctElem = prepareWarningElem("correct", " Zarejestrowano pomyślnie.");
            correctElem.className = "correct-field"
            appendAfterElem(id, correctElem);
            
        } else {
            console.log("Errors: " + correctResponse.errors);

            removeWarningMessage("correct");
            id = "button-reg-form";
            let uncorrectElem = prepareWarningElem("uncorrect", "Rejestracja nie powiodła się. " + correctResponse.errors);
            uncorrectElem.className = "uncorrect-field"
            appendAfterElem(id, uncorrectElem);
        }
    }

    function prepareEventOnChange(FIELD_ID, warningMessage, updateMessageFunction) {
        let loginInput = document.getElementById(FIELD_ID);
        loginInput.addEventListener("change", updateMessageFunction.bind(e, FIELD_ID, warningMessage));
    }

    function prepareLoginEventOnChange(FIELD_ID, updateMessageFunction) {
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

    function updateCorrectnessMessage(FIELD_ID, warningMessage) {
        let warningElemId = FIELD_ID + "Warning";

        if (warningMessage == "") {
            console.log("Correct " + FIELD_ID + "!");
            removeWarningMessage(warningElemId);
        } else {
            console.log("Uncorrect " + FIELD_ID + ".");
            showWarningMessage(warningElemId, warningMessage, FIELD_ID);
        }
    }
    
    function updatePeselCorrectnessMessage() {
        let warningElemId = "peselWarning";
        let warningMessage = "Podany pesel jest nieprawidłowy.";

        if (validatePesel() == "") {
            console.log("Correct pesel!");
            removeWarningMessage(warningElemId);
        } else {
            console.log("Uncorrect pesel.");
            showWarningMessage(warningElemId, validatePesel(), PESEL_FIELD_ID);
        }
    }

    // ----------------------------------------------------------------

    function showWarningMessage(newElemId, message, field_id) {
        let warningElem = prepareWarningElem(newElemId, message);
        appendAfterElem(field_id, warningElem);
    }

    function removeWarningMessage(warningElemId) {
        let warningElem = document.getElementById(warningElemId);

        if (warningElem !== null) {
            warningElem.remove();
        }
    }

    function prepareWarningElem(newElemId, message) {
        let warningField = document.getElementById(newElemId);

        if (warningField === null) {
            let textMessage = document.createTextNode(message);
            warningField = document.createElement('span');

            warningField.setAttribute("id", newElemId);
            warningField.className = "warning-field";
            warningField.appendChild(textMessage);
        }
        return warningField;
    }

    function appendAfterElem(currentElemId, newElem) {
        let currentElem = document.getElementById(currentElemId);
        currentElem.insertAdjacentElement('afterend', newElem);
    }

    //------------------------- checking correctness ----------------------------

    function alphabetOnly(FIELD_ID) {
        let input = document.getElementById(FIELD_ID).value;
        let input_name = document.getElementById(FIELD_ID).getAttribute('name');

        if (!(/^[a-zA-Z]+$/.test(input))){
            return "Pole " + input_name + " może zawierać tylko litery.";
        }else{
            return "";
        }
    }

    function validateName() {
        let nameInput = document.getElementById(NAME_FIELD_ID).value;

        if (!(/^[a-zA-Z]+$/.test(nameInput))){
            return "Imię może zawierać tylko litery.";
        }else if(/^\s+$/.test(nameInput)){
            return "Wpisz tylko jedno imię";
        }else{
            return "";
        }
    }

    function validateSurname() {
        let surnameInput = document.getElementById(SURNAME_FIELD_ID).value;

        if(/^\s+$/.test(surnameInput)){
            return "Nazwisko nie może zawierać spacji. W przypadku dwuczłonowego nazwiska wpisz '-' pomiędzy";
        }else if (!(/^([A-Z][a-z]+)(-[A-Z][a-z]+)*$/.test(surnameInput))){
            return "Nazwisko może zawierać tylko litery.";
        }else{
            return "";
        }
    }

    function validatePesel() {
        let peselInput = document.getElementById(PESEL_FIELD_ID).value;
        
        if (peselInput.length == 11 && !isNaN(peselInput)) {
            
            let a = parseInt(peselInput.charAt(0));
            let b = parseInt(peselInput.charAt(1));
            let c = parseInt(peselInput.charAt(2));
            let d = parseInt(peselInput.charAt(3));
            let e = parseInt(peselInput.charAt(4));
            let f = parseInt(peselInput.charAt(5));
            let g = parseInt(peselInput.charAt(6));
            let h = parseInt(peselInput.charAt(7));
            let i = parseInt(peselInput.charAt(8));
            let j = parseInt(peselInput.charAt(9));
            let k = parseInt(peselInput.charAt(10));
            let sum = 1*a + 3*b + 7*c + 9*d + 1*e + 3*f + 7*g + 9*h + 1*i + 3*j;
        
            if (10 - sum%10 == k){
                return "";
            } else{
                return "Podany pesel jest nieprawidłowy.";
            }
        
            } else {
            return "Podany pesel jest nieprawidłowy.";
        }   
    }

    function validateHouseNr() {
        let houseNrInput = document.getElementById(HOUSE_NR_FIELD_ID).value;

        if (!(/^\d+[a-zA-Z]{0,1}$/.test(houseNrInput))){
            return "Numer domu może zawierać tylko cyfry i opcjonalnie jedną literę.";
        }else{
            return "";
        }
    }

    function isLoginAvailable() {
        return Promise.resolve(checkLoginAvailability().then(function (statusCode) {
            if (statusCode === HTTP_STATUS.OK) {
                return false;
            } else if (statusCode === HTTP_STATUS.NOT_FOUND) {
                return true
            } else {
                throw "Unknown login availability status: " + statusCode;
            }
        }));
    }

    function checkLoginAvailability() {
        let loginInput = document.getElementById(LOGIN_FIELD_ID);
        let baseUrl = URL + "user/";
        let userUrl = baseUrl + loginInput.value;

        return Promise.resolve(fetch(userUrl, {method: GET}).then(function (resp) {
            return resp.status;
        }).catch(function (err) {
            
            return err.status;
        }));
    }
    
    function validateLogin(){
        let loginInput = document.getElementById(LOGIN_FIELD_ID).value;
        if (!(/^[a-zA-Z]+$/.test(loginInput))){
            return "Login może składać się tylko z liter.";
        } else if(loginInput.length < 4 ){
            return "Login musi mieć powyżej 4 znaków."
        }else{
            return "";
        }
    }

    function validatePasswd() {
        let passwdInput = document.getElementById(PASSWD_FIELD_ID).value;
        if (passwdInput.length < 8) {
            return "Hasło musi mieć powyżej 8 znaków";
        } else if (!(/\d/.test(passwdInput))){
            return "Hasło musi zawierać przynajmniej jedną cyfrę.";
        } else if (!(/[A-Z]+/.test(passwdInput))){
            return "Hasło musi zawierać przynajmniej jedną wielką literę.";
        } else if (!(/[a-z]+/.test(passwdInput))){
            return "Hasło musi zawierać przynajmniej jedną małą literę.";
        } else {
            return "";
        }
    }

    function arePasswdsTheSame() {
        let passwdInput = document.getElementById(PASSWD_FIELD_ID).value;
        let repeatPasswdInput = document.getElementById(REPEAT_PASSWD_FIELD_ID).value;

        if (passwdInput == repeatPasswdInput){
            return true; 
        } else {
            return false;
        }
    }

});



