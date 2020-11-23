function submitForm(form, name, successMessage, failureMessage) {
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

function prepareEventOnChange(FIELD_ID, validationFunction, updateMessageFunction) {
    let loginInput = document.getElementById(FIELD_ID);
    loginInput.addEventListener("change", updateMessageFunction.bind(event, FIELD_ID, validationFunction));
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

function updateCorrectnessMessage(FIELD_ID, validationFunction) {
    let warningElemId = FIELD_ID + "Warning";

    if (validationFunction() == "") {
        console.log("Correct " + FIELD_ID + "!");
        removeWarningMessage(warningElemId);
    } else {
        console.log("Uncorrect " + FIELD_ID + ".");
        showWarningMessage(warningElemId, validationFunction(), FIELD_ID);
    }
}
