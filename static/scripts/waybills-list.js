
var HTTP_STATUS = {OK: 200, CREATED: 201, BAD_REQUEST: 400, UNAUTHORIZED: 401, FORBIDDEN: 403, NOT_FOUND: 404, INTERNAL_SERVER_ERROR: 500};


function delete_pack(pack_id){
    console.log('reaguje na click')
    submitDeleteForm(pack_id)
}

function submitDeleteForm(pack_id) {
    console.log('pack_id: ' + pack_id)
    let url = "https://localhost:8081/waybill/" + pack_id
    console.log('url: ' + url)
    let registerParams = {
        credentials: 'include',
        method: 'DELETE',
        redirect: "follow"
    };

    fetch(url, registerParams)
        .then(response => getJsonResponse(response))
        .then(response => getResponse(response))
        .catch(err => {
            console.log("Caught error: " + err);
            
        });
}

function getJsonResponse(response){
    console.log(response)
    return response.json();
}

async function getResponse(response) {
    console.log(response)
    let id = "title";
    if (response.status == HTTP_STATUS.OK){
        console.log('Poprawnie usunięto paczkę!')
        addCorrectMessage(id,response.msg)
        await sleep(2000)
        window.location.href = '/app/waybills_list'
    }else {
        addfailureMessage(id,response.msg)
    }
}

function addCorrectMessage(id,successMessage) {
    removeWarningMessage("uncorrect");
    removeWarningMessage("correct");
    let correctElem = prepareWarningElem("correct", successMessage);
    console.log(correctElem)
    correctElem.className = "correct-field"
    appendAfterElem(id, correctElem);
}

function addfailureMessage(id,failureMessage) {
    removeWarningMessage("correct");
    removeWarningMessage("uncorrect");
    let uncorrectElem = prepareWarningElem("uncorrect", failureMessage);
    uncorrectElem.className = "uncorrect-field"
    appendAfterElem(id, uncorrectElem);
}

function appendAfterElem(currentElemId, newElem) {
    let currentElem = document.getElementById(currentElemId);
    currentElem.insertAdjacentElement('afterend', newElem);
}

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

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
/*
document.addEventListener('DOMContentLoaded', function (event) {
    getAccessToken();

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
*/
