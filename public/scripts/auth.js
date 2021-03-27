const BASE_URL = "https://afternoon-dawn-87591.herokuapp.com/";

const signIn = document.getElementById("signIn");
const message = document.getElementById("message");

signIn.addEventListener("click", (e) => {
    e.preventDefault();

    const signInForm = document.getElementById('signInForm');
    const formData = new FormData(signInForm);

    const data = JSON.stringify({
        "email_address": formData.get("email_address"),
        "password": formData.get("password"),
    });

    fetch(BASE_URL + "auth", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: data,
    }).then(function (response) {
        return response.json();
    }).then(function (data) {
        console.log(data);
        if(data.success) {
            window.location.href=BASE_URL;
        } else {
            generateSuccessMessage(data, message);
        }
    }).catch(function (err) {
        console.warn('Something went wrong.', err);
    });
});

function generateSuccessMessage(data, parentElement) {
    var status = '';
    if (data.success) {
        status = 'success';
    } else {
        status = 'error';
    }

    parentElement.innerHTML = "<p class='" + status + "'>" + data.message + "</p>";
}