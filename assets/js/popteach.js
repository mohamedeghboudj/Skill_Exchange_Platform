// popteach.js - MINIMAL WORKING VERSION
document.addEventListener('DOMContentLoaded', function() {
    let mydialog = document.getElementById("popup");
    
    if (!mydialog) return;
    
    // Close popup when clicking outside
    mydialog.addEventListener('click', function(event) {
        if (event.target === mydialog) {
            mydialog.close();
        }
    });
    
    // The request click handlers will be added by TeacherRequestManager
    console.log('Popup dialog ready');
});