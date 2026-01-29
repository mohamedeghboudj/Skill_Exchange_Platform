const CONFIG = {
  COURSE_NAME_MAX: 100,
  DESCRIPTION_MIN: 20,
  DESCRIPTION_MAX: 2000,
  PRICE_MIN: 0,
  FILE_MAX_BYTES: 2 * 1024 * 1024 * 1024, // 200 MB 
  ALLOWED_VIDEO_MIMES: ['video/mp4', 'video/webm', 'video/mov'],
  ALLOWED_FILE_MIMES: null, // null = allow anything (on server tu peux restreindre)
};
const isEmptyStr = s => typeof s === 'string' && s.trim().length > 0;
validateCourseName = name => {
  const errors = [];
  if (isEmptyStr(name)) errors.push('Course name is not valid.')
  if (typeof name === 'string' && name.length > CONFIG.COURSE_NAME_MAX)
    errors.push(`course name cannot exceed ${CONFIG.COURSE_NAME_MAX} characters.`);
  return errors;
}
const validatePrice = price => {
  const errors = [];
  if (isEmptyStr(price) && price !== 0) {
    errors.push('Enter the price.')
    return errors;
  }
  const n = Number(price);
  if (Number.isInteger(n)) {
    errors.push('The price must be a number. (ex:50).')
  }
  if (n < CONFIG.PRICE_MIN) errors.push(`price must be at least ${CONFIG.PRICE_MIN}.`);
  return errors;

}
const validateTeacherName = tname => {
  const errors = [];
  if (isEmptyStr(tname)) {
    errors.push('Enter your name.')
  }

  const nameRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/ug;
  if (!isEmptyStr(tname) && !nameRegex.test(tname)) {
    errors.push('Please enter your real name.');
  }
  return errors;
}
const validateDescription = desc => {
  const errors = [];
  if (isEmptyStr(desc)) errors.push('The description is required.');
  if (!isEmptyStr(desc) && desc.trim().length < CONFIG.DESCRIPTION_MIN)
    errors.push(`The description must n=be at least ${CONFIG.DESCRIPTION_MIN} characters.`);
  if (!isEmptyStr(desc) && desc.length > CONFIG.DESCRIPTION_MAX)
    errors.push(`The description cannot exceed ${CONFIG.DESCRIPTION_MAX} characters.`);
  return errors;
}
const validateFiles = (filesList, { atLeastOneVideo = true } = {}) => {
  const errors = [];
  if (!filesList || filesList.length === 0) {
    if (atLeastOneVideo){errors.push('At least one video is required.');
    return errors;}
  }
  let videoCount = 0;
  for (let i = 0; i < filesList.length; i++) {
    const f = filesList[i];
    if (!f || !f.type) {
      continue;
    }
    if (f.size > CONFIG.FILE_MAX_BYTES) {
      errors.push(`The file "${f.name}" exceeds the maximal size (${CONFIG.FILE_MAX_BYTES / (1024 * 1024)}MB).`);
    }
    if (CONFIG.ALLOWED_VIDEO_MIMES && !CONFIG.ALLOWED_VIDEO_MIMES.includes(f.type)) {
      errors.push(`The format (${f.type}) is not supported.`);
    }
    videoCount++;
     if (CONFIG.ALLOWED_FILE_MIMES && !CONFIG.ALLOWED_FILE_MIMES.includes(f.type)) {
    errors.push(`Le fichier "${f.name}" a un type non autorisé (${f.type}).`);}
  }
  // si CONFIG.ALLOWED_FILE_MIMES non null, valider les autres fichiers auss

}
  


if (atLeastOneVideo && videoCount === 0) {
  errors.push('Au moins une vidéo est requise (uploader un fichier .mp4 par exemple).');
}

return errors;

// Course Form Validation
class CourseFormValidator {
  constructor(formId) {
    this.form = document.getElementById(formId);
    this.errors = {};
    this.init();
  }

  init() {
    // Add event listeners
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));

    // Real-time validation on blur
    const inputs = this.form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      input.addEventListener('blur', () => this.validateField(input));
      input.addEventListener('input', () => this.clearFieldError(input));
    });
  }

  validateField(field) {
    const name = field.name;
    let isValid = true;

    switch (name) {
      case 'courseName':
        isValid = this.validateCourseName(field.value);
        break;
      case 'timeToComplete':
        isValid = this.validateTimeToComplete(field.value);
        break;
      case 'price':
        isValid = this.validatePrice(field.value);
        break;
      case 'teacher':
        isValid = this.validateTeacher(field.value);
        break;
      case 'description':
        isValid = this.validateDescription(field.value);
        break;
      case 'category':
        isValid = this.validateCategory(field.value);
        break;
    }

    if (!isValid) {
      this.showFieldError(field, this.errors[name]);
    }

    return isValid;
  }

  validateCourseName(value) {
    if (!value || value.trim() === '') {
      this.errors.courseName = 'Course name is required';
      return false;
    }
    if (value.trim().length < 3) {
      this.errors.courseName = 'Course name must be at least 3 characters';
      return false;
    }
    if (value.trim().length > 100) {
      this.errors.courseName = 'Course name must not exceed 100 characters';
      return false;
    }
    delete this.errors.courseName;
    return true;
  }

  validateTimeToComplete(value) {
    if (!value || value.trim() === '') {
      this.errors.timeToComplete = 'Time to complete is required';
      return false;
    }
    if (value.trim().length < 2) {
      this.errors.timeToComplete = 'Please enter a valid time duration';
      return false;
    }
    delete this.errors.timeToComplete;
    return true;
  }

  validatePrice(value) {
    if (!value || value.trim() === '') {
      this.errors.price = 'Price is required';
      return false;
    }

    // Remove currency symbols and whitespace
    const cleanValue = value.replace(/[$,\s]/g, '');

    if (isNaN(cleanValue) || cleanValue === '') {
      this.errors.price = 'Please enter a valid price';
      return false;
    }

    const numValue = parseFloat(cleanValue);
    if (numValue < 0) {
      this.errors.price = 'Price cannot be negative';
      return false;
    }
    if (numValue > 999999) {
      this.errors.price = 'Price is too high';
      return false;
    }

    delete this.errors.price;
    return true;
  }

  validateTeacher(value) {
    if (!value || value === '' || value === 'Select a teacher') {
      this.errors.teacher = 'Please select a teacher';
      return false;
    }
    delete this.errors.teacher;
    return true;
  }

  validateDescription(value) {
    if (!value || value.trim() === '') {
      this.errors.description = 'Course description is required';
      return false;
    }
    if (value.trim().length < 10) {
      this.errors.description = 'Description must be at least 10 characters';
      return false;
    }
    if (value.trim().length > 1000) {
      this.errors.description = 'Description must not exceed 1000 characters';
      return false;
    }
    delete this.errors.description;
    return true;
  }

  validateCategory(value) {
    if (!value || value === '' || value === 'select a category') {
      this.errors.category = 'Please select a category';
      return false;
    }
    delete this.errors.category;
    return true;
  }

  showFieldError(field, message) {
    // Remove existing error
    this.clearFieldError(field);

    // Add error styling
    field.classList.add('error');

    // Create error message element
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    errorDiv.style.color = '#dc3545';
    errorDiv.style.fontSize = '0.875rem';
    errorDiv.style.marginTop = '0.25rem';

    // Insert error after field
    field.parentNode.insertBefore(errorDiv, field.nextSibling);
  }

  clearFieldError(field) {
    field.classList.remove('error');
    const errorMsg = field.parentNode.querySelector('.error-message');
    if (errorMsg) {
      errorMsg.remove();
    }
  }

  validateAll() {
    const fields = this.form.querySelectorAll('input, select, textarea');
    let isValid = true;

    fields.forEach(field => {
      if (field.name) {
        if (!this.validateField(field)) {
          isValid = false;
        }
      }
    });

    return isValid;
  }

  handleSubmit(e) {
    e.preventDefault();

    // Clear all previous errors
    const errorMessages = this.form.querySelectorAll('.error-message');
    errorMessages.forEach(msg => msg.remove());

    const fields = this.form.querySelectorAll('input, select, textarea');
    fields.forEach(field => field.classList.remove('error'));

    // Validate all fields
    if (this.validateAll()) {
      // Form is valid, you can submit
      console.log('Form is valid! Submitting...');

      // Get form data
      const formData = new FormData(this.form);
      const data = Object.fromEntries(formData);
      console.log('Form Data:', data);

      // Here you would typically send the data to your server
      // this.form.submit(); // or use fetch/axios

      alert('Course created successfully!');
    } else {
      // Scroll to first error
      const firstError = this.form.querySelector('.error');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstError.focus();
      }

      console.log('Form has errors:', this.errors);
    }
  }

  // Public method to get current errors
  getErrors() {
    return this.errors;
  }

  // Public method to reset form
  reset() {
    this.form.reset();
    this.errors = {};
    const errorMessages = this.form.querySelectorAll('.error-message');
    errorMessages.forEach(msg => msg.remove());
    const fields = this.form.querySelectorAll('input, select, textarea');
    fields.forEach(field => field.classList.remove('error'));
  }
}

// Usage:
// Initialize the validator when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const validator = new CourseFormValidator('courseForm');

  // Optional: Add custom styling for error state
  const style = document.createElement('style');
  style.textContent = `
    .error {
      border-color: #dc3545 !important;
      background-color: #fff5f5 !important;
    }
    .error:focus {
      outline-color: #dc3545 !important;
      box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25) !important;
    }
  `;
  document.head.appendChild(style);
});

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CourseFormValidator;
}