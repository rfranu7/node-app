// ENROLL CUSTOMER
const enroll_customer = document.getElementById("enroll_customer");
const enroll_message = document.getElementById("enroll-message");

// UPDATE PASSWORD
const update_password = document.getElementById("update_password");
const update_password_message = document.getElementById("update-password-message");

// UPDATE CUSTOMER
const update_customer = document.getElementById("update_customer");
const update_customer_message = document.getElementById("update_customer_message");

// ADD ENGAGEMENT
const add_engagement = document.getElementById("add_engagement");
const add_engagement_message = document.getElementById("add_engagement_message");

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

update_password.addEventListener("click", (e) => {
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
        generateSuccessMessage(data, update_password_message);
    }).catch(function (err) {
        console.warn('Something went wrong.', err);
    });
});

update_customer.addEventListener("click", (e) => {
    e.preventDefault();

    const update_customer_form = document.getElementById("update_customer_form");
    const formData = new FormData(update_customer_form);

    const data = JSON.stringify({
        "email_address": formData.get("email_address"),
        "first_name": formData.get("first_name"),
        "last_name": formData.get("last_name"),
        "birthday": formData.get("birthday"),
        "account_status": formData.get("account_status"),
        "id": formData.get("id"),
    });

    fetch(BASE_URL + "update-customer", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: data,
    }).then(function (response) {
        return response.json();
    }).then(function (data) {
        console.log(data);
        generateSuccessMessage(data, update_customer_message);
    }).catch(function (err) {
        console.warn('Something went wrong.', err);
    });
});

document.addEventListener("load", (e) => {
    const customer_id_select = document.getElementById('customer_id_select');
    const engagement_id_select = document.getElementById('engagement_id_select');

    fetch(BASE_URL + "list-engagements").then(function (response) {
        return response.json();
    }).then(function (data) {
        console.log(data);
        fillEngagementOptions(data, engagement_id_select);
    }).catch(function (err) {
        console.warn('Something went wrong.', err);
    });

    fetch(BASE_URL + "list-customers").then(function (response) {
        return response.json();
    }).then(function (data) {
        console.log(data);
        fillCustomerOptions(data, customer_id_select);
    }).catch(function (err) {
        console.warn('Something went wrong.', err);
    });
})

function generateSuccessMessage(data, parentElement) {
    var status = '';
    if (data.success) {
        status = 'success';
    } else {
        status = 'error';
    }

    parentElement.innerHTML = "<p class='" + status + "'>" + data.message + "</p>";
}

function fillCustomerOptions(data, parentElement){
    parentElement.innerHTML = '';

    data.forEach(element => {
        parentElement.innerHTML += `<option value="${element.customer_id}">${element.first_name} ${element.last_name}`;
    });
}

function fillEngagementOptions(data, parentElement){
    parentElement.innerHTML = '';

    data.forEach(element => {
        parentElement.innerHTML += `<option value="${element.engagement_id}">${element.engagement_name}`;
    });
}