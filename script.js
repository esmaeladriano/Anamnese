document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form.needs-validation");
  const steps = document.querySelectorAll(".form-step");
  const nextBtns = document.querySelectorAll(".next-step");
  const prevBtns = document.querySelectorAll(".prev-step");
  const submitButton = document.getElementById("btnSubmit");
  const estrategiasSim = document.getElementById("estrategiasSim");
  const estrategiasNao = document.getElementById("estrategiasNao");
  const acompanhamentoField = document.getElementById("acompanhamentoField");

  const nascimento = form.querySelector('[name="nascimento"]');
  const idade = form.querySelector('[name="idade"]');

  let currentStep = 0;

  // Limites para o campo nascimento
  const hoje = new Date();
  const anoMax = hoje.getFullYear() - 4;
  const dataMaxDate = new Date(anoMax, 11, 31); // 31 de dezembro do ano permitido
  const dataMax = dataMaxDate.toISOString().split("T")[0];
  nascimento.setAttribute("max", dataMax);
  nascimento.setAttribute("min", "1900-01-01");

  // Mostrar o step atual
  function showStep(index) {
    steps.forEach((step, i) => {
      step.classList.toggle("active", i === index);
    });
  }

  function validarCampo(campo, condicaoValida) {
    if (condicaoValida) {
      campo.classList.remove("is-invalid");
      campo.classList.add("is-valid");
    } else {
      campo.classList.remove("is-valid");
      campo.classList.add("is-invalid");
    }
  }

  function calcularIdade(data) {
    const hoje = new Date();
    const nascimento = new Date(data);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const m = hoje.getMonth() - nascimento.getMonth();
    if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }
    return idade;
  }

  nascimento.addEventListener("change", () => {
    if (!nascimento.value) return;

    const dataNasc = new Date(nascimento.value);
    const idadeCalculada = calcularIdade(nascimento.value);
    idade.value = idadeCalculada;

    const dataValida =
      dataNasc.getFullYear() >= 1900 &&
      idadeCalculada >= 3 &&
      dataNasc <= new Date(dataMax); // limita ao fim do ano permitido

    validarCampo(nascimento, dataValida);
    validarCampo(idade, idadeCalculada >= 3 && idadeCalculada <= 120);
  });

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

  function validarStep1() {
    let valido = true;

    function validarCampoInterno(campo, condicao) {
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
    validarCampoInterno(nome, nome.value.trim().length >= 5);

    if (nascimento.value) {
      const dataNasc = new Date(nascimento.value);
      const idadeCalc = calcularIdade(nascimento.value);
      idade.value = idadeCalc;

      const dataValida =
        dataNasc.getFullYear() >= 1900 &&
        idadeCalc >= 3 &&
        dataNasc <= new Date(dataMax);

      validarCampoInterno(nascimento, dataValida);
      validarCampoInterno(idade, idadeCalc >= 3 && idadeCalc <= 120);
    } else {
      validarCampoInterno(nascimento, false);
      validarCampoInterno(idade, false);
    }

    const sexoM = form.querySelector("#sexoM");
    const sexoF = form.querySelector("#sexoF");
    const sexoValido = sexoM.checked || sexoF.checked;
    [sexoM, sexoF].forEach((input) =>
      input.classList.toggle("is-invalid", !sexoValido)
    );
    if (!sexoValido) valido = false;

    const telefone = form.querySelector('[name="telefone"]');
    validarCampoInterno(telefone, /^\d{9,}$/.test(telefone.value.trim()));

    const email = form.querySelector('[name="email"]');
    validarCampoInterno(email, /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim()));

    const estadoCivil = form.querySelector('[name="estado_civil"]');
    if (estadoCivil.value.trim() !== "") {
      validarCampoInterno(estadoCivil, estadoCivil.value.trim().length >= 3);
    }

    const bi = form.querySelector('[name="BI"]');
    if (bi && bi.value.trim() !== "") {
      validarCampoInterno(bi, bi.value.trim().length >= 6);
    }

    return valido;
  }

  form.addEventListener("input", () => {
    if (form.checkValidity()) {
      submitButton.removeAttribute("disabled");
    } else {
      submitButton.setAttribute("disabled", "disabled");
    }
  });

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

  prevBtns.forEach((btn) =>
    btn.addEventListener("click", () => {
      currentStep--;
      if (currentStep < 0) currentStep = 0;
      showStep(currentStep);
    })
  );

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

  if (estrategiasSim && estrategiasNao && acompanhamentoField) {
    estrategiasSim.addEventListener("change", () => {
      acompanhamentoField.style.display = estrategiasSim.checked ? "block" : "none";
    });

    estrategiasNao.addEventListener("change", () => {
      acompanhamentoField.style.display = "none";
    });
  }

  showStep(currentStep);
});
