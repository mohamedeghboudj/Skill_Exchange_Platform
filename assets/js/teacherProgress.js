const chatToggle = document.querySelector(".chat-toggle");
const sidebar = document.querySelector(".sidebar");
const closeChat = document.querySelector(".close-chat");
const leftArrow = document.getElementById("left-arrow");
const unlocking = document.querySelector("#unlock")

chatToggle.onclick = () => {
  sidebar.classList.add("active");
};

closeChat.onclick = () => {
  sidebar.classList.remove("active");
};

leftArrow.addEventListener('click', () => {
  window.location.href = "/html/teach.html";
});

// Function to attach click handlers to assignments
function attachAssignmentClickHandlers() {
  const assignments = document.querySelectorAll(".assignment");
  const saveButton = document.querySelector("#save-grade");
  const score = document.querySelector("#score-input");
  console.log("Assignments found:", assignments.length);

  const gradingPanel = document.getElementById("grading-panel");

  assignments.forEach(assignment => {
    const assignmentId = assignment.dataset.id;
    const isLocked = assignment.classList.contains('locked');
    const isPending = assignment.classList.contains('pending');

    if (assignmentId && !isLocked && !isPending) {
      assignment.style.cursor = 'pointer';

      assignment.addEventListener('click', () => {
        // Update title and show correct panel
        document.getElementById("assignment-title").textContent = assignment.querySelector("span").textContent;
        gradingPanel.style.display = "block";
      });

      // Hover effects
      assignment.addEventListener('mouseenter', () => {
        assignment.style.transform = 'translateX(5px)';
        assignment.style.transition = 'transform 0.2s ease';
      });

      assignment.addEventListener('mouseleave', () => {
        assignment.style.transform = 'translateX(0)';
      });
      saveButton.addEventListener('click', () => {
        score.value = "";
      })
    }
  });
}




// Event for unlock spans in locked assignments
document.addEventListener("DOMContentLoaded", () => {
  console.log("JS is running");
  attachAssignmentClickHandlers();

  const assignmentsContainer = document.querySelector('.progress-box:last-of-type'); // Assignments section
  assignmentsContainer.addEventListener('click', (e) => {
    // Check if clicked element text is "unlock" and inside locked row
    if (e.target.textContent.trim() === 'unlock' && e.target.closest('.row.locked')) {
      const row = e.target.closest('.row');
      const statusSpan = row.querySelector('span:last-child'); // Status span
      
      // Swap classes and update status text
      row.classList.remove('locked');
      row.classList.add('pending');
      statusSpan.textContent = 'Pending';
      
      // Remove the unlock span completely
      e.target.remove();
      
      console.log('Unlocked assignment to pending');
    }
  });
});

