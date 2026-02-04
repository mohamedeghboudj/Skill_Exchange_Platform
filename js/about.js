
// this is not working yet (sending the message) , come back later hadil



document.addEventListener("DOMContentLoaded", function () {

    const button = document.getElementById('oumayma');
    const textarea = document.getElementById('question');
    const errorMsg = document.getElementById('error-msg');

    button.addEventListener('click', function (event) {
        event.preventDefault();

        const message = textarea.value.trim();

        if (message === '') {
            errorMsg.textContent = "You cannot send an empty message!";
            errorMsg.style.color = 'red';
            errorMsg.style.display = 'block';
        } else {
            // Disable button while sending
            button.disabled = true;
            button.textContent = "Sending...";

            const formData = new FormData();
            formData.append('message', message);

            fetch('assets/php/send_email.php', {
                method: 'POST',
                body: formData
            })
                .then(response => response.json())
                .then(data => {
                    // Log full response to console for debugging
                    console.log("Server Response:", data);

                    if (data.success) {
                        errorMsg.textContent = "Message sent successfully!";
                        errorMsg.style.color = 'green';
                        errorMsg.style.display = 'block';
                        textarea.value = '';
                    } else {
                        // Show clean message to user
                        errorMsg.textContent = data.message || "Failed to send message.";

                        // Log technical details to console
                        if (data.debug_error) {
                            console.warn("Debug Info:", data.debug_error);
                        } else {
                            console.warn("Server Error:", data);
                        }

                        errorMsg.style.color = 'red';
                        errorMsg.style.display = 'block';
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    errorMsg.textContent = "An error occurred. Please try again.";
                    errorMsg.style.color = 'red';
                    errorMsg.style.display = 'block';
                })
                .finally(() => {
                    button.disabled = false;
                    button.textContent = "Send";
                    setTimeout(() => {
                        errorMsg.style.display = 'none';
                    }, 5000);
                });
        }
    });

});


