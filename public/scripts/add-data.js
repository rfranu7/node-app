const BASE_URL = "https://afternoon-dawn-87591.herokuapp.com/";

// Engagement Elements
const enroll_customer = document.getElementById("enroll_customer");
const enroll_message = document.getElementById("enroll-message");

enroll_customer.addEventListener("click", (e) => {
    e.preventDefault();


    fetch(BASE_URL + "enroll-customer").then(function (response) {
        return response.json();
    }).then(function (data) {
        console.log(data);
        // generateSuccessMessage(data, enroll_message);
    }).catch(function (err) {
        console.warn('Something went wrong.', err);
    });
});

function generateSuccessMessage(data, parentElement) {

}