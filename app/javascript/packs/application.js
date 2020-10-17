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

import { DirectUpload } from "@rails/activestorage"

console.log('js working')
let idempotentPageLoadFlag;


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

  let fileInputs = document.querySelectorAll('.file.has-name input[type=file]');
  

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
      let data = e.detail[0]
      if (data.success) {
        window.location.href = data.redirect_to
      } else {
        showExamSubmissionError(data.error)
        removeLoadingClassToSubmitButton()
      }
    })

    examSubmissionForm.addEventListener("ajax:error", (e) => {
      console.log("Something went wrong | exam-submission-form submit")
      console.log(e.detail)

      showExamSubmissionError()
      removeLoadingClassToSubmitButton()
    })


    let uploadsInProgress = 0;
    for (let i = 0; i < fileInputs.length; i++) {
      const fileInput = fileInputs[i];
      fileInput.onchange = () => {
        if (fileInput.files.length > 0) {

          hideExamSubmissionError();

          const fileNameElem = fileInput.parentNode.querySelector('.file-name');
          fileNameElem.textContent = fileInput.files[0].name;
          fileNameElem.classList.add('has-text-link');

          const url = fileInput.dataset.directUploadUrl
          const upload = new DirectUpload(fileInput.files[0], url)
          uploadsInProgress++;
          addLoadingClassToSubmitButton(uploadsInProgress);

          // TODO: remove other inputs
          let inputs = document.querySelectorAll('input[name="'+ fileInput.name +'"][type=hidden]');
          for (let i = 0; i < inputs.length; i++) {
            const input = inputs[i];
            if (!fileInput.isSameNode(input)) {
              input.remove();
              console.log('removing')
            }
          }

          upload.create((error, blob) => {

            

            uploadsInProgress--;
            if (uploadsInProgress <= 0) {
              removeLoadingClassToSubmitButton();
            } else {
              addLoadingClassToSubmitButton(uploadsInProgress);
            }
            if (error) {
              // Handle the error
              fileNameElem.classList.add('has-text-danger');
              console.log(error)
              fileInput.value="";
            } else {
              // Add an appropriately-named hidden input to the form with a
              //  value of blob.signed_id so that the blob ids will be
              //  transmitted in the normal upload flow

              fileNameElem.classList.add('has-text-success');
              const hiddenField = document.createElement('input')
              hiddenField.setAttribute("type", "hidden");
              hiddenField.setAttribute("value", blob.signed_id);
              hiddenField.name = fileInput.name
              document.querySelector('form').appendChild(hiddenField);
              console.log('uploaded: ', fileInput.files[0].name)
              fileInput.value="";
            }
          })
        

        }

      }
      
    }
  } else {
    for (let i = 0; i < fileInputs.length; i++) {
      const fileInput = fileInputs[i];
      fileInput.onchange = () => {
        if (fileInput.files.length > 0) {

          const fileNameElem = fileInput.parentNode.querySelector('.file-name');
          fileNameElem.textContent = fileInput.files[0].name;
          fileNameElem.classList.add('has-text-link');
        }
      }
    }
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

function addLoadingClassToSubmitButton(uploadsInProgress) {
  let formSubmit = document.getElementById('exam-submission-form-submit');
  formSubmit.classList.add('is-loading');
  formSubmit.disabled = true;
  if (uploadsInProgress) {
    document.getElementById("exam-submission-help").innerHTML = uploadsInProgress + " upload in progess..."
  }
}

function removeLoadingClassToSubmitButton() {
  let formSubmit = document.getElementById('exam-submission-form-submit');
  formSubmit.classList.remove('is-loading');
  formSubmit.disabled = false;
  document.getElementById("exam-submission-help").innerHTML = "To clear uploads, refresh the page."
}



