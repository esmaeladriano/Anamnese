
document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form.needs-validation");
  const steps = document.querySelectorAll(".form-step");
  const nextBtns = document.querySelectorAll(".next-step");
  const prevBtns = document.querySelectorAll(".prev-step");
  const submitButton = document.getElementById("btnSubmit");
  const estrategiasSim = document.getElementById("estrategiasSim");
  const estrategiasNao = document.getElementById("estrategiasNao");
  const acompanhamentoField = document.getElementById("acompanhamentoField");

  let currentStep = 0;

  // Mostrar o step atual
  function showStep(index) {
    steps.forEach((step, i) => {
      step.classList.toggle("active", i === index);
    });
  }

  // Validação básica automática
  function validateCurrentStep() {
    const currentFormStep = steps[currentStep];
    const inputs = currentFormStep.querySelectorAll("input, textarea, select");
    let isValid = true;

    inputs.forEach((input) => {
      if (!input.checkValidity()) {
        input.classList.add("is-invalid");
        input.classList.remove("is-valid");
        isValid = false;
      } else {
        input.classList.remove("is-invalid");
        input.classList.add("is-valid");
      }
    });

    return isValid;
  }

  // Validação customizada do Step 1
  function validarStep1() {
    let valido = true;

    function validarCampo(campo, condicao) {
      if (condicao) {
        campo.classList.remove("is-invalid");
        campo.classList.add("is-valid");
      } else {
        campo.classList.add("is-invalid");
        campo.classList.remove("is-valid");
        valido = false;
      }
    }

    const nome = form.querySelector('[name="nome"]');
    validarCampo(nome, nome.value.trim().length >= 5);

    const idade = form.querySelector('[name="idade"]');
    validarCampo(idade, idade.value && idade.value > 0 && idade.value <= 120);

    const nascimento = form.querySelector('[name="nascimento"]');
    if (nascimento.value) {
      const hoje = new Date();
      const dataNasc = new Date(nascimento.value);
      validarCampo(nascimento, dataNasc <= hoje);
    }

    const sexoM = form.querySelector("#sexoM");
    const sexoF = form.querySelector("#sexoF");
    const sexoValido = sexoM.checked || sexoF.checked;
    [sexoM, sexoF].forEach((input) =>
      input.classList.toggle("is-invalid", !sexoValido)
    );
    if (!sexoValido) valido = false;

    const telefone = form.querySelector('[name="telefone"]');
    validarCampo(telefone, /^\d{9,}$/.test(telefone.value.trim()));

    const email = form.querySelector('[name="email"]');
    validarCampo(email, /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim()));

    const estadoCivil = form.querySelector('[name="estado_civil"]');
    if (estadoCivil.value.trim() !== "") {
      validarCampo(estadoCivil, estadoCivil.value.trim().length >= 3);
    }

    const bi = form.querySelector('[name="BI"]');
    if (bi && bi.value.trim() !== "") {
      validarCampo(bi, bi.value.trim().length >= 6);
    }

    return valido;
  }

  // Atualiza o botão de envio ao digitar nos campos
  form.addEventListener("input", () => {
    if (form.checkValidity()) {
      submitButton.removeAttribute("disabled");
    } else {
      submitButton.setAttribute("disabled", "disabled");
    }
  });

  // Passar para próximo step com validação
  nextBtns.forEach((btn) =>
    btn.addEventListener("click", () => {
      const valido = currentStep === 0 ? validarStep1() : validateCurrentStep();
      if (valido) {
        currentStep++;
        if (currentStep >= steps.length) currentStep = steps.length - 1;
        showStep(currentStep);
      }
    })
  );

  // Voltar para step anterior
  prevBtns.forEach((btn) =>
    btn.addEventListener("click", () => {
      currentStep--;
      if (currentStep < 0) currentStep = 0;
      showStep(currentStep);
    })
  );

  // Validação final antes de enviar
  form.addEventListener("submit", (e) => {
    if (!form.checkValidity()) {
      e.preventDefault();
      e.stopPropagation();
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

  // Lógica para mostrar o campo "com acompanhamento" só se SIM for selecionado
  if (estrategiasSim && estrategiasNao && acompanhamentoField) {
    estrategiasSim.addEventListener("change", () => {
      acompanhamentoField.style.display = estrategiasSim.checked ? "block" : "none";
    });

    estrategiasNao.addEventListener("change", () => {
      acompanhamentoField.style.display = "none";
    });
  }

  // Exibir o primeiro step no início
  showStep(currentStep);
});

