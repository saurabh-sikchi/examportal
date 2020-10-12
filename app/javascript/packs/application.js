// This file is automatically compiled by Webpack, along with any other files
// present in this directory. You're encouraged to place your actual application logic in
// a relevant structure within app/javascript and only use these pack files to reference
// that code so it'll be compiled.

require("@rails/ujs").start()
require("turbolinks").start()
require("@rails/activestorage").start()
require("channels")


// Uncomment to copy all static images under ../images to the output folder and reference
// them with the image_pack_tag helper in views (e.g <%= image_pack_tag 'rails.png' %>)
// or the `imagePath` JavaScript helper below.
//
// const images = require.context('../images', true)
// const imagePath = (name) => images(name, true)

console.log('js working')
let idempotentPageLoadFlag;

// wait for DOM to load
// document.onreadystatechange = function () {
//   if (document.readyState == "interactive") {
//     idempotentPageLoadFlag = false;   
//     onPageLoad();
//   }
// }

document.addEventListener("turbolinks:load", () => {
  idempotentPageLoadFlag = false;
  onPageLoad();
  
});

function onPageLoad() {
  if (idempotentPageLoadFlag) {
    return
  } else {
    idempotentPageLoadFlag = true;
  }
  console.log('pageLoad')
  
  let classNameSelect = document.getElementById('student_class_name');
  if(classNameSelect) {
    classNameSelect.onchange = () => {
      let className = classNameSelect.options[classNameSelect.selectedIndex].value;
      fetchExamDetails(className)
    }
  }

  fileInputs = document.querySelectorAll('.file.has-name input[type=file]');
  for (let i = 0; i < fileInputs.length; i++) {
    const fileInput = fileInputs[i];
    fileInput.onchange = () => {
      console.log(fileInput.files[0].name);
      if (fileInput.files.length > 0) {
        const fileName = fileInput.parentNode.querySelector('.file-name');
        fileName.textContent = fileInput.files[0].name;
        fileName.classList.add('has-text-success')
      }
    }
    
  }

  let examSubmissionForm = document.getElementById('exam-submission-form');
  if(examSubmissionForm) {

    const perfEntries = performance.getEntriesByType('navigation');
    if (perfEntries.length && perfEntries[0].type === 'back_forward') {
      window.location.reload();
    }

    examSubmissionForm.addEventListener("ajax:beforeSend", (e) => {
      if (confirm("Have you uploaded ALL the answer papers? You will not be able to upload after submitting.")) {
        hideExamSubmissionError()
        addLoadingClassToSubmitButton()
      } else {
        e.preventDefault();
        return false
      }
    })

    examSubmissionForm.addEventListener("ajax:success", (e) => {
      data = e.detail[0]
      if (data.success) {
        window.location.href = data.redirect_to
      } else {
        showExamSubmissionError(data.error)
      }
      removeLoadingClassToSubmitButton()
    })

    examSubmissionForm.addEventListener("ajax:error", (e) => {
      console.log("Something went wrong | exam-submission-form submit")
      console.log(e.detail)

      showExamSubmissionError()
      removeLoadingClassToSubmitButton()
    })  


  }
}

function fetchExamDetails(className) {
  fetch('/exams/for_today?class_name=' + className)
  .then(res => res.json())
  .then((data) => {
    if(data.exams.length == 0) {
      setExamError()
    } else {
      setExamDetails(data.exams)
    }
  }).catch(function (err) {
    // There was an error
    console.warn('Something went wrong.', err);
  })
}

function setExamDetails(exams) {
  removeExamError()
  let subjectSelect = document.getElementById('subject_select')
  subjectSelect.innerHTML = '';
  exams.forEach(exam => {
    subjectSelect.innerHTML += `<option value='${exam.id}'>${exam.subject}</option>`
  })
  subjectSelect.disabled = false;
}

function setExamError() {
  let subjectSelect = document.getElementById('subject_select')
  document.getElementById('exam-error').classList.remove("is-hidden");
  document.getElementById('take-exam').disabled = true;
  subjectSelect.disabled = true;
  subjectSelect.innerHTML = '';
}

function removeExamError() {
  document.getElementById('exam-error').classList.add("is-hidden");
  document.getElementById('take-exam').disabled = false;
}

function showExamSubmissionError(errorText) {
  let errorElem = document.getElementById('exam-submission-error');
  errorElem.classList.remove("is-hidden");
  if (errorText) {
    errorElem.innerHTML = errorText;
  }
}

function hideExamSubmissionError() {
  let errorElem = document.getElementById('exam-submission-error');
  errorElem.classList.add("is-hidden");
  errorElem.innerHTML = "There was an error, please submit again.";
}

function addLoadingClassToSubmitButton() {
  let formSubmit = document.getElementById('exam-submission-form-submit');
  formSubmit.classList.add('is-loading');
  formSubmit.disabled = true;
}

function removeLoadingClassToSubmitButton() {
  let formSubmit = document.getElementById('exam-submission-form-submit');
  formSubmit.classList.remove('is-loading');
  formSubmit.disabled = false;
}



