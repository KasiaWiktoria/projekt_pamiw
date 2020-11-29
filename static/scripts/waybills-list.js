
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