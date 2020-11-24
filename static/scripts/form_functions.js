export function submitForm(form, name, successMessage, failureMessage) {
    let registerUrl = URL + name;

    let registerParams = {
        method: POST,
        body: new FormData(form),
        redirect: "follow"
    };

    fetch(registerUrl, registerParams)
            .then(response => getResponseData(response))
            .then(response => displayInConsoleCorrectResponse(response, successMessage, failureMessage))
            .catch(err => {
                console.log("Caught error: " + err);

            });
}

function getResponseData(response) {
    let status = response.status;

    if (status === HTTP_STATUS.OK || status === HTTP_STATUS.CREATED) {
        return response.json();
    } else {
        console.error("Response status code: " + response.status);
        throw "Unexpected response status: " + response.status;
    }
}

function displayInConsoleCorrectResponse(correctResponse, successMessage, failureMessage) {
    let status = correctResponse.registration_status;

    console.log("Status: " + status);

    if (status == "OK") {
        removeWarningMessage("uncorrect");
        id = "button-reg-form";
        let correctElem = prepareWarningElem("correct", successMessage);
        correctElem.className = "correct-field"
        appendAfterElem(id, correctElem);
        
    } else {
        console.log("Errors: " + correctResponse.errors);

        removeWarningMessage("correct");
        id = "button-reg-form";
        let uncorrectElem = prepareWarningElem("uncorrect", failureMessage + correctResponse.errors);
        uncorrectElem.className = "uncorrect-field"
        appendAfterElem(id, uncorrectElem);
    }
}

export function prepareEventOnChange(FIELD_ID, validationFunction, updateMessageFunction) {
    let loginInput = document.getElementById(FIELD_ID);
    loginInput.addEventListener("change", updateMessageFunction.bind(event, FIELD_ID, validationFunction));
}

export function updateCorrectnessMessage(FIELD_ID, validationFunction) {
    let warningElemId = FIELD_ID + "Warning";

    if (validationFunction() == "") {
        console.log("Correct " + FIELD_ID + "!");
        removeWarningMessage(warningElemId);
    } else {
        console.log("Uncorrect " + FIELD_ID + ".");
        showWarningMessage(warningElemId, validationFunction(), FIELD_ID);
    }
}
