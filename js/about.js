
// this is not working yet (sending the message) , come back later hadil



document.addEventListener("DOMContentLoaded", function () {

    const button = document.getElementById('oumayma');
    const textarea = document.getElementById('question');
    const errorMsg = document.getElementById('error-msg');

    button.addEventListener('click', function (event) {
        event.preventDefault();

        if (textarea.value.trim() === '') {
            errorMsg.textContent = "You cannot send an empty message!";
            errorMsg.style.color = 'red';
            errorMsg.style.display = 'block';
        } else {
            errorMsg.textContent = "Message sent successfully!";
            errorMsg.style.color = 'green';
            errorMsg.style.display = 'block';
            textarea.value = '';
            setTimeout(() => {
                errorMsg.style.display = 'none';
            }, 3000);
        }


    });

});


