let username = document.querySelector("#name");
let number = document.querySelector("#cardnumber");
let expiryMonth = document.querySelector("#month");
let expiryYear = document.querySelector("#year");
let cvc = document.querySelector("#cvc");
let email = document.querySelector("#email");
let address = document.querySelector("#address");
let terms = document.querySelector("#term");
let pay = document.getElementById("pay");
let result = document.querySelector("#result");

// FIX 1: Add null check for result
if (result) {
    result.style.display = "none";
}

// FIX 2: Add null check for pay button
if (pay) {
    pay.addEventListener('click', (event) => {
        event.preventDefault();
        if (checkInputs()) {
            // FIX 3: Add parent window check
            if (window.parent && window.parent.closePop2) {
                window.parent.closePop2();
            }
        }
    });
}

function setErrorFor(input, message) {
    // FIX 4: Check if result exists
    if (result) {
        result.style.display = "block";
        result.innerHTML = message;
    }
    // FIX 5: Check if input exists
    if (input) {
        input.classList.add('error');
        input.classList.remove("success");
    }
}

function setSuccessFor(input) {
    // FIX 6: Check if input exists
    if (input) {
        input.classList.add('success');
        input.classList.remove("error");
    }
}

function isEmail(email) {
    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,5}$/;
    console.log(regex.test(email));
    return regex.test(email);
}

function isMonth(month) {
    const regex = /^[0-9]{1,2}$/;
    return regex.test(month);
}

function isYear(year) {
    const regex = /^[0-9]{4}$/;
    return regex.test(year);
}

function isCardNumber(number) {
    const regex = /^[0-9]{12}$/;
    return regex.test(number);
}

function isCVC(number) {
    const regex = /^[0-9]{3}$/;
    return regex.test(number);
}

function checkInputs() {
    // FIX 7: Add validation that all form elements exist
    if (!username || !number || !expiryMonth || !expiryYear || !cvc || !email || !address || !terms) {
        setErrorFor(null, "Form not properly loaded. Please refresh the page.");
        return false;
    }
    
    const namevalue = username.value.trim();
    const numbervalue = number.value.trim();
    const expiryMonthvalue = expiryMonth.value.trim();
    const expiryYearvalue = expiryYear.value.trim();
    const emailvalue = email.value.trim();
    const cvcvalue = cvc.value.trim();
    const addressvalue = address.value.trim();

    if (!namevalue || namevalue.length < 3) {
        setErrorFor(username, "Name must be at least 3 characters!");
        return false;
    } else {
        setSuccessFor(username);
    }

    if (numbervalue.length < 12) {
        setErrorFor(number, "Card number must be at least 12 characters!");
        return false;
    } else if (!isCardNumber(numbervalue)) {
        setErrorFor(number, "Invalid CardNumber!");
        return false;
    } else {
        setSuccessFor(number);
    }

    if (!expiryMonthvalue) {
        setErrorFor(expiryMonth, "Please fill all field!");
        return false;
    } else if ((!isMonth(expiryMonthvalue)) || expiryMonthvalue > 12 || expiryMonthvalue <= 0) {
        setErrorFor(expiryMonth, "Invalid month!");
        return false;
    } else {
        setSuccessFor(expiryMonth);
    }

    const currentYear = new Date().getFullYear();
    if (!expiryYearvalue) {
        setErrorFor(expiryYear, "Please fill all field!");
        return false;
    } else if ((!isYear(expiryYearvalue)) || expiryYearvalue < currentYear) {
        setErrorFor(expiryYear, "Invalid year!");
        return false;
    } else {
        setSuccessFor(expiryYear);
    }

    if (!cvcvalue || cvcvalue.length < 3) {
        setErrorFor(cvc, "CVC must be at least 3 characters!");
        return false;
    } else if (!isCVC(cvcvalue)) {
        setErrorFor(cvc, "Invalid CVC!");
        return false;
    } else {
        setSuccessFor(cvc);
    }

    if (!emailvalue) {
        setErrorFor(email, "Please fill all field!");
        return false;
    } else if (!isEmail(emailvalue)) {
        setErrorFor(email, "Invalid email!");
        return false;
    } else {
        setSuccessFor(email);
    }

    if (!addressvalue || addressvalue.length < 10) {
        setErrorFor(address, "Address must be at least 10 characters!");
        return false;
    } else {
        setSuccessFor(address);
    }

    if (!terms.checked) {
        if (result) {
            result.innerHTML = "You must agree before continuing!";
        }
        return false;
    }

    // FIX 8: Clear form with null checks
    if (result) {
        result.innerHTML = "";
        result.style.display = "none";
    }
    
    if (username) username.value = "";
    if (number) number.value = "";
    if (expiryMonth) expiryMonth.value = "";
    if (expiryYear) expiryYear.value = "";
    if (cvc) cvc.value = "";
    if (email) email.value = "";
    if (address) address.value = "";
    if (terms) terms.checked = false;
    
    return true;
}