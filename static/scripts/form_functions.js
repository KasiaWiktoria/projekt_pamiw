import {GET, POST, URL, HTTP_STATUS} from './const.js'
import {showWarningMessage, removeWarningMessage, prepareWarningElem, appendAfterElem} from './warning_functions.js';



export function submitForm(form, name, successMessage, failureMessage) {
    let registerUrl = URL + name;
    console.log(registerUrl);

    let registerParams = {
        method: POST,
        mode: 'cors',
        body: new FormData(form),
        redirect: "follow"
    };

    fetch(registerUrl, registerParams)
            .then(response => getResponseData(response))
            .then(response => displayInConsoleCorrectResponse(response, successMessage, failureMessage))
            .catch(err => {
                console.log("Caught error: " + err);
                removeWarningMessage("correct");
                let id = "button-submit-form";

                let uncorrectElem = prepareWarningElem("uncorrect", failureMessage);
                uncorrectElem.className = "uncorrect-field"
                appendAfterElem(id, uncorrectElem);
            });
}


function displayInConsoleCorrectResponse(correctResponse, successMessage, failureMessage) {

    console.log("Status: " + correctResponse);

    if (correctResponse == "OK") {
        removeWarningMessage("uncorrect");
        let id = "button-submit-form";
        let correctElem = prepareWarningElem("correct", successMessage);
        correctElem.className = "correct-field"
        appendAfterElem(id, correctElem);
        //window.location.href = '/waybills-list'
        
    } else {
        console.log("Errors: " + correctResponse);

        removeWarningMessage("correct");
        let id = "button-submit-form";
        let uncorrectElem = prepareWarningElem("uncorrect", failureMessage + correctResponse);
        uncorrectElem.className = "uncorrect-field"
        appendAfterElem(id, uncorrectElem);
    }
}

function getResponseData(response) {
    let status = response.status;

    if (status === HTTP_STATUS.OK) {
        console.log("Status =" + status);
        return "OK"
    } else {
        console.error("Response status code: " + response.status);
        throw "Unexpected response status: " + response.status;
    }
}
    
export function prepareOtherEventOnChange(FIELD_ID, updateMessageFunction) {
    let loginInput = document.getElementById(FIELD_ID);
    loginInput.addEventListener("change", updateMessageFunction);
}

export function prepareEventOnChange(FIELD_ID, validationFunction) {
    let loginInput = document.getElementById(FIELD_ID);
    loginInput.addEventListener("change", updateCorrectnessMessage.bind(event, FIELD_ID, validationFunction));
}

export function updateCorrectnessMessage(FIELD_ID, validationFunction) {
    let warningElemId = FIELD_ID + "Warning";

    if(document.getElementById(FIELD_ID).value == ""){
        removeWarningMessage(warningElemId);
    } else if (validationFunction(FIELD_ID) == "") {
        console.log("Correct " + FIELD_ID + "!");
        removeWarningMessage(warningElemId);
    } else {
        console.log("Uncorrect " + FIELD_ID + ".");
        showWarningMessage(warningElemId, validationFunction(FIELD_ID), FIELD_ID);
    }
}

export function addCorrectMessage(id,successMessage) {
    removeWarningMessage("uncorrect");
    let correctElem = prepareWarningElem("correct", successMessage);
    correctElem.className = "correct-field"
    appendAfterElem(id, correctElem);
}

export function addfailureMessage(id,failureMessage) {
    removeWarningMessage("correct");
    let uncorrectElem = prepareWarningElem("uncorrect", failureMessage);
    uncorrectElem.className = "uncorrect-field"
    appendAfterElem(id, uncorrectElem);
}