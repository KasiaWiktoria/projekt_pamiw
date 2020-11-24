import './const.js'

function alphabetOnly(FIELD_ID) {
    let input = document.getElementById(FIELD_ID).value;
    let input_name = document.getElementById(FIELD_ID).getAttribute('name');

    if (!(/^[a-zA-Z]+$/.test(input))){
        return "Pole " + input_name + " może zawierać tylko litery.";
    }else{
        return "";
    }
}

function noSpecialCharacters(FIELD_ID) {
    let input = document.getElementById(FIELD_ID).value;
    let input_name = document.getElementById(FIELD_ID).getAttribute('name');

    if (!(/^[a-zA-Z-\d ]+$/.test(input))){
        return "Pole " + input_name + " może zawierać tylko litery, cyfry, znak spacji lub znak '-'.";
    }else{
        return "";
    }
}

export function validateName() {
    let nameInput = document.getElementById(NAME_FIELD_ID).value;

    if(/^\s$/.test(nameInput)){
        return "Wpisz tylko jedno imię";
    }else if (!(/^[a-zA-Z]+$/.test(nameInput))){
        return "Imię może zawierać tylko litery.";
    }else{
        return "";
    }
}

export function validateSurname() {
    let surnameInput = document.getElementById(SURNAME_FIELD_ID).value;

    if (!(/^[A-Z].*$/.test(surnameInput))){
        return "Nazwisko musi zaczynać się wielką literą."
    }else if(/^.+\s+.+$/.test(surnameInput)){
        return "Nazwisko nie może zawierać spacji. W przypadku dwuczłonowego nazwiska wpisz '-' pomiędzy";
    }else if (!(/^[a-zA-Z\-]+$/.test(surnameInput))){
        return "Nazwisko może zawierać tylko litery i opcjonalnie jeden znak '-'.";
    }else if ((/^([A-Z][a-z]+)-.*$/.test(surnameInput)) && !(/^([A-Z][a-z]+)-[A-Z].*$/.test(surnameInput))){
        return "Drugi człon nazwiska musi zaczynać się wielką literą.";
    }else if(/^([A-Z][a-z]+)-[A-Z]*$/.test(surnameInput)){
        return "Drugie nazwisko musi mieć więcej niż jedną literę.";
    }else{
        return "";
    }
}

export function validateBDate(){
    let bdateInput = document.getElementById(BDATE_FIELD_ID).value;

    if(!(/^\d{2}\.\d{2}.\d{4}$/.test(bdateInput))){
        return "Data powinna mieć format dd.mm.rrrr";
    }else{
        return "";
    }
}

export function validatePesel() {
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

export function validateCountry(){
    return alphabetOnly(COUNTRY_FIELD_ID);
}

export function validatePostalCode(){
    return noSpecialCharacters(POSTAL_CODE_FIELD_ID);
}

export function validateCity(){
    return alphabetOnly(CITY_FIELD_ID);
}

export function validateStreet(){
    return noSpecialCharacters(STREET_FIELD_ID);
}

export function validateHouseNr() {
    let houseNrInput = document.getElementById(HOUSE_NR_FIELD_ID).value;

    if (!(/^\d+[a-zA-Z]?$/.test(houseNrInput))){
        return "Numer domu może zawierać tylko cyfry i opcjonalnie jedną literę.";
    }else{
        return "";
    }
}

export function isLoginAvailable() {
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

export function validateLogin(){
    let loginInput = document.getElementById(LOGIN_FIELD_ID).value;
    if (!(/^[a-zA-Z]+$/.test(loginInput))){
        return "Login może składać się tylko z liter.";
    } else if(loginInput.length < 4 ){
        return "Login musi mieć powyżej 4 znaków."
    }else{
        return "";
    }
}

export function validatePasswd() {
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

export function arePasswdsTheSame() {
    let passwdInput = document.getElementById(PASSWD_FIELD_ID).value;
    let repeatPasswdInput = document.getElementById(REPEAT_PASSWD_FIELD_ID).value;

    if (passwdInput == repeatPasswdInput){
        return true; 
    } else {
        return false;
    }
}