// ENROLL CUSTOMER
const enroll_customer = document.getElementById("enroll_customer");
const enroll_message = document.getElementById("enroll-message");

// UPDATE PASSWORD
const update_password = document.getElementById("update_password");
const update_password_message = document.getElementById("update-password-message");

enroll_customer.addEventListener("click", (e) => {
    e.preventDefault();

    const enroll_customer_form = document.getElementById('enroll_customer_form');
    const formData = new FormData(enroll_customer_form);

    const data = JSON.stringify({
        "first_name": formData.get("first_name"),
        "last_name": formData.get("last_name"),
        "email_address": formData.get("email_address"),
    });

    fetch(BASE_URL + "enroll-customer", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: data,
    }).then(function (response) {
        return response.json();
    }).then(function (data) {
        console.log(data);
        generateSuccessMessage(data, enroll_message);
    }).catch(function (err) {
        console.warn('Something went wrong.', err);
    });
});

enroll_customer.addEventListener("click", (e) => {
    e.preventDefault();

    const update_password_form = document.getElementById("update_password_form");
    const formData = new FormData(update_password_form);

    const data = JSON.stringify({
        "email_address": formData.get("email_address"),
        "password": formData.get("password"),
        "password_confirmation": formData.get("password_confirmation"),
    });

    fetch(BASE_URL + "set-customer-password", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: data,
    }).then(function (response) {
        return response.json();
    }).then(function (data) {
        console.log(data);
        generateSuccessMessage(data, enroll_message);
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