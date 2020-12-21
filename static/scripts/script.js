console.log('wchodzi do pliku script')

window.addEventListener('load', () => {
    if ('serviceWorker' in navigator) {
        console.log('navigator')
        console.log(window.location.pathname)
        console.log(navigator.serviceWorker)
        navigator.serviceWorker
        .register('./service-worker.js')
        .then(function () { console.log("ServiceWorker correctly registered"); }).catch(function (error) {
            console.log(error)
        });
    }
  });
  