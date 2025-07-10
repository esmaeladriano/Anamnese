document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form.needs-validation");
  const steps = document.querySelectorAll(".form-step");
  const nextBtns = document.querySelectorAll(".next-step");
  const prevBtns = document.querySelectorAll(".prev-step");
  let currentStep = 0;

  function showStep(index) {
    steps.forEach((step, i) => {
      step.classList.toggle("active", i === index);
    });
  }

  function validateCurrentStep() {
    const currentFormStep = steps[currentStep];
    const inputs = currentFormStep.querySelectorAll("input, textarea, select");
    let isValid = true;

    inputs.forEach((input) => {
      if (!input.checkValidity()) {
        input.classList.add("is-invalid");
        isValid = false;
      } else {
        input.classList.remove("is-invalid");
        input.classList.add("is-valid");
      }
    });

    return isValid;
  }

  nextBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (validateCurrentStep()) {
        currentStep++;
        if (currentStep >= steps.length) currentStep = steps.length - 1;
        showStep(currentStep);
      }
    });
  });

  prevBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      currentStep--;
      if (currentStep < 0) currentStep = 0;
      showStep(currentStep);
    });
  });

  showStep(currentStep);

  form.addEventListener("submit", (e) => {
    if (!form.checkValidity()) {
      e.preventDefault();
      e.stopPropagation();

      // Marca todos os campos inválidos
      form.querySelectorAll("input, textarea, select").forEach((input) => {
        if (!input.checkValidity()) {
          input.classList.add("is-invalid");
        } else {
          input.classList.remove("is-invalid");
          input.classList.add("is-valid");
        }
      });
    }
  });
});
