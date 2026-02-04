console.log("js is working");

const chatToggle = document.querySelector(".chat-toggle");
const sidebar = document.querySelector(".sidebar");
const closeChat = document.querySelector(".close-chat");
const leftArrow = document.getElementById("left-arrow");
const rate= document.getElementById("rateCourse");

chatToggle.onclick = () => sidebar.classList.add("active");
closeChat.onclick = () => sidebar.classList.remove("active");
leftArrow.addEventListener('click', () => window.location.href = "/html/dashboard.html");

function attachStudentAssignmentHandlers() {
  const assignments = document.querySelectorAll(".assignment");
  const submissionPanel = document.getElementById("submission-panel");
  const submissionPdf = document.querySelector(".submission-pdf");
  const fileUploadArea = document.querySelector(".file-upload-area");
  const submitBox = document.querySelector(".submit-box");
  
  assignments.forEach(assignment => {
    const assignmentId = assignment.dataset.id;
    const isPending = assignment.classList.contains('pending');
    const isDone = assignment.classList.contains('done');
    
    // Allow pending assignments even without data-id
    if ((assignmentId && isDone) || isPending) {
      assignment.style.cursor = 'pointer';
      
      assignment.addEventListener('click', () => {
        const titleSpan = assignment.querySelector("span:first-child");
        document.getElementById("assignment-title").textContent = titleSpan.textContent;
        
        // Check current state (in case it was just submitted)
        const isCurrentlyDone = assignment.classList.contains('done');
        const isCurrentlyPending = assignment.classList.contains('pending');
        
        if (isCurrentlyDone) {
          // Show PDF viewer for done assignments
          submissionPdf.style.display = "flex";
          fileUploadArea.style.display = "none";
          submitBox.style.display = "none";
        } else if (isCurrentlyPending) {
          // Show upload form for pending
          submissionPdf.style.display = "none";
          fileUploadArea.style.display = "block";
          submitBox.style.display = "block";
        }
        
        submissionPanel.style.display = "block";
      });
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  console.log("Student Progress loaded");
  attachStudentAssignmentHandlers();
  
  // File upload preview
  const fileInput = document.getElementById("file-input");
  if (fileInput) {
    fileInput.addEventListener("change", function(e) {
      const file = e.target.files[0];
      if (file) {
        document.getElementById("file-name").textContent = file.name;
        document.getElementById("file-size").textContent = (file.size / 1024).toFixed(1) + " KB";
        document.getElementById("file-preview").style.display = "flex";
      }
    });
  }
  
  // Submit assignment
  const submitBtn = document.getElementById("submit-assignment");
  if (submitBtn) {
    submitBtn.addEventListener("click", function() {
      const fileInput = document.getElementById("file-input");
      if (fileInput.files.length === 0) {
        alert("Please select a file!");
        return;
      }
      
      const pendingRow = document.querySelector(".row.pending");
      if (pendingRow) {
        const statusSpan = pendingRow.querySelector("span:last-child");
        
        // Change status to "done" with 0 score by default
        pendingRow.classList.remove("pending");
        pendingRow.classList.add("done");
        statusSpan.textContent = "0 / 100";
        
        // Add data-id if it doesn't exist (so it behaves like other done assignments)
        if (!pendingRow.dataset.id) {
          pendingRow.dataset.id = "Q1";
        }
        
        // Hide submission panel and reset file input
        document.getElementById("submission-panel").style.display = "none";
        fileInput.value = ""; // Clear file input
        document.getElementById("file-preview").style.display = "none";
        
        alert("Assignment submitted successfully!");
      }
    });
  }
});

rate.addEventListener('click' ,()=>{
    window.location.href="/pages/ratcourse.htm"
})