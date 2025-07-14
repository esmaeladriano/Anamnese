document.addEventListener('DOMContentLoaded', () => {
  // ------------------- CONST & VARIÁVEIS GLOBAIS -------------------
  const form = document.getElementById('nutrition-form');
  const sections = document.querySelectorAll('.form-section');
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  const submitBtn = document.getElementById('submit-btn');
  const progressBar = document.getElementById('form-progress');
  let currentSection = 0;

  // --- Step 1
  const nomeInput = document.getElementById('nome');
  const dataNascimentoInput = document.getElementById('data-nascimento');
  const idadeInput = document.getElementById('idade');
  const sexoMRadio = document.getElementById('sexoM');
  const sexoFRadio = document.getElementById('sexoF');
  const telefoneInput = document.getElementById('telefone');
  const emailInput = document.getElementById('email');
  const biInput = document.getElementById('bi');
  const objetivoSelect = document.getElementById('objetivo');

  // --- Step 2
  const alturaInput = document.getElementById('altura');
  const pesoInput = document.getElementById('peso');

  // --- Step 3
  const refeicoesDiaSelect = document.getElementById('refeicoes-dia');
  const frutasVegetaisRadios = document.querySelectorAll('input[name="frutas-vegetais"]');
  const aguaDiaSelect = document.getElementById('agua-dia');
  const alimentosCheckboxes = document.querySelectorAll('input[type="checkbox"][id^="alimento"]');
  const alergiasTextarea = document.getElementById('alergias');

  // ------------------- FUNÇÕES DE FORMULÁRIO -------------------
  function updateProgress() {
    const progress = ((currentSection + 1) / sections.length) * 100;
    progressBar.style.width = `${progress}%`;

    document.querySelectorAll('.step').forEach((step, index) => {
      step.classList.toggle('active', index === currentSection);
      step.classList.toggle('completed', index < currentSection);
    });
  }

  function showSection(index) {
    sections.forEach((section, i) => {
      section.classList.toggle('active', i === index);
    });

    prevBtn.disabled = index === 0;
    nextBtn.style.display = index === sections.length - 1 ? 'none' : 'block';
    submitBtn.style.display = index === sections.length - 1 ? 'block' : 'none';

    updateProgress();
    window.scrollTo({ top: form.offsetTop, behavior: 'smooth' });
  }

  function calcularIdade(data) {
    const hoje = new Date();
    const nascimento = new Date(data);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const m = hoje.getMonth() - nascimento.getMonth();
    if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) idade--;
    return idade;
  }

  function validarCampo(campo, condicaoValida) {
    campo.classList.toggle("is-valid", condicaoValida);
    campo.classList.toggle("is-invalid", !condicaoValida);
    return condicaoValida;
  }

  function validateCurrentSection() {
    const currentSectionForm = sections[currentSection];
    const inputs = currentSectionForm.querySelectorAll('input[required], select[required], textarea[required]');
    let isValid = true;

    inputs.forEach(input => {
      if (input.type === 'radio') {
        const radios = document.querySelectorAll(`input[name="${input.name}"]`);
        const isChecked = Array.from(radios).some(r => r.checked);
        const container = input.closest('.col-md-6.mb-3') || input.closest('.col-12');
        const feedback = container?.querySelector('.invalid-feedback');

        if (!isChecked) {
          isValid = false;
          input.classList.add('is-invalid');
          if (feedback) feedback.style.display = 'block';
        } else {
          input.classList.remove('is-invalid');
          if (feedback) feedback.style.display = 'none';
        }
      } else {
        if (!input.checkValidity()) {
          input.classList.add('is-invalid');
          input.classList.remove('is-valid');
          isValid = false;
        } else {
          input.classList.add('is-valid');
          input.classList.remove('is-invalid');
        }
      }
    });

    if (currentSection === 0) {
      const idadeCalculada = calcularIdade(dataNascimentoInput.value);
      idadeInput.value = idadeCalculada;

      const anoAtual = new Date().getFullYear();
      const anoMin = anoAtual - 120;
      const anoMax = anoAtual - 3;

      const dataValida = new Date(dataNascimentoInput.value) >= new Date(`${anoMin}-01-01`) &&
                         new Date(dataNascimentoInput.value) <= new Date(`${anoMax}-12-31`);

      if (!validarCampo(nomeInput, nomeInput.value.trim().length >= 5)) isValid = false;
      if (!validarCampo(dataNascimentoInput, dataValida)) isValid = false;
      if (!validarCampo(idadeInput, idadeCalculada >= 3 && idadeCalculada <= 120)) isValid = false;
      if (!validarCampo(telefoneInput, /^\d{9,}$/.test(telefoneInput.value.replace(/\D/g, '')))) isValid = false;
      if (!validarCampo(emailInput, /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value.trim()))) isValid = false;
      if (biInput.value.trim() && !validarCampo(biInput, biInput.value.trim().length >= 6)) isValid = false;
    }

    return isValid;
  }

  function prepareReviewData() {
    const sexoValue = sexoMRadio.checked ? sexoMRadio.value : (sexoFRadio.checked ? sexoFRadio.value : 'Não informado');
    const frutas = document.querySelector('input[name="frutas-vegetais"]:checked')?.value;
    const alimentosSelecionados = Array.from(alimentosCheckboxes)
      .filter(cb => cb.checked)
      .map(cb => cb.nextElementSibling.textContent.trim())
      .join(', ');

    document.getElementById('review-pessoal').innerHTML = `
      <p><strong>Nome:</strong> ${nomeInput.value}</p>
      <p><strong>Data de Nascimento:</strong> ${formatDate(dataNascimentoInput.value)}</p>
      <p><strong>Idade:</strong> ${idadeInput.value} anos</p>
      <p><strong>Sexo:</strong> ${sexoValue}</p>
      <p><strong>Telefone:</strong> ${telefoneInput.value}</p>
      <p><strong>E-mail:</strong> ${emailInput.value}</p>
      <p><strong>Portador do BI:</strong> ${biInput.value || 'Não informado'}</p>
      <p><strong>Objetivo:</strong> ${formatObjetivo(objetivoSelect.value)}</p>
    `;

    document.getElementById('review-medidas').innerHTML = `
      <p><strong>Altura:</strong> ${alturaInput.value} cm</p>
      <p><strong>Peso:</strong> ${pesoInput.value} kg</p>
      <p><strong>IMC:</strong> ${imcInput.value}</p>
      <p><strong>Cintura:</strong> ${cinturaInput.value} cm</p>
      <p><strong>Quadril:</strong> ${quadrilInput.value} cm</p>
      <p><strong>RCQ:</strong> ${rcqInput.value}</p>
    `;

    document.getElementById('review-habitos').innerHTML = `
      <p><strong>Refeições por dia:</strong> ${formatRefeicoes(refeicoesDiaSelect.value)}</p>
      <p><strong>Consome frutas/vegetais:</strong> ${frutas === 'sim' ? 'Sim' : 'Não'}</p>
      <p><strong>Água por dia:</strong> ${formatAgua(aguaDiaSelect.value)}</p>
      <p><strong>Alimentos frequentes:</strong> ${alimentosSelecionados || 'Nenhum selecionado'}</p>
      <p><strong>Alergias:</strong> ${alergiasTextarea.value || 'Nenhuma'}</p>
    `;
  }

  // ------------------- EVENTOS -------------------
  nextBtn.addEventListener('click', () => {
    if (validateCurrentSection()) {
      currentSection++;
      showSection(currentSection);
    } else {
      form.classList.add('was-validated');
    }
  });

  prevBtn.addEventListener('click', () => {
    currentSection--;
    showSection(currentSection);
  });

  submitBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const termos = document.getElementById('termos');
    if (!termos.checked) {
      termos.classList.add('is-invalid');
      form.classList.add('was-validated');
      return;
    }

    termos.classList.remove('is-invalid');
    prepareReviewData();
    alert('Formulário enviado com sucesso!');

    form.reset();
    imcInput.value = rcqInput.value = idadeInput.value = '';
    currentSection = 0;
    form.classList.remove('was-validated');
    showSection(currentSection);
  });

  dataNascimentoInput.addEventListener('change', () => {
    idadeInput.value = dataNascimentoInput.value ? calcularIdade(dataNascimentoInput.value) : '';
    validateCurrentSection();
  });

  telefoneInput.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);
    value = value.replace(/^(\d{2})(\d)/g, '($1) $2');
    value = value.replace(/(\d)(\d{4})$/, '$1-$2');
    e.target.value = value;
  });

  showSection(0);
});

// ------------------- FUNÇÕES AUXILIARES -------------------
function formatDate(dateString) {
  if (!dateString) return 'Não informado';
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR');
}

function formatObjetivo(objetivo) {
  return {
    'perda-peso': 'Perda de peso',
    'ganho-massa': 'Ganho de massa muscular',
    'manutencao': 'Manutenção',
    'melhorar-saude': 'Melhorar saúde'
  }[objetivo] || 'Não informado';
}

function formatRefeicoes(ref) {
  return {
    '1-2': '1-2 refeições',
    '3': '3 refeições',
    '4-5': '4-5 refeições',
    '6+': '6+ refeições'
  }[ref] || 'Não informado';
}

function formatAgua(agua) {
  return {
    'menos-1L': 'Menos de 1L',
    '1-2L': '1-2L',
    '2-3L': '2-3L',
    'mais-3L': 'Mais de 3L'
  }[agua] || 'Não informado';
}

// ------------------- DATA MÍNIMA PARA CONSULTA -------------------
const dataConsultaInput = document.getElementById('data-consulta');
if (dataConsultaInput) {
  const hoje = new Date();
  const dia = String(hoje.getDate()).padStart(2, '0');
  const mes = String(hoje.getMonth() + 1).padStart(2, '0');
  const ano = hoje.getFullYear();
  dataConsultaInput.min = `${ano}-${mes}-${dia}`;
}
