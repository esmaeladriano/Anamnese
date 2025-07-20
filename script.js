document.addEventListener('DOMContentLoaded', function () {
    // Elementos principais
    const form = document.getElementById('nutrition-form');
    const formSections = document.querySelectorAll('.form-section');
    const stepIndicators = document.querySelectorAll('.step');
    const progressBar = document.getElementById('form-progress');
    let currentStep = 0;

    // ==================== FUNÇÕES DE VALIDAÇÃO ====================

    // Validação de data de nascimento e cálculo de idade
    function setupBirthDateValidation() {
        const dataNascimentoInput = document.getElementById('data-nascimento');
        const idadeInput = document.getElementById('idade');

        if (dataNascimentoInput && idadeInput) {
            dataNascimentoInput.addEventListener('change', function () {
                const dob = new Date(this.value);
                const today = new Date();
                let age = today.getFullYear() - dob.getFullYear();
                const m = today.getMonth() - dob.getMonth();

                if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
                    age--;
                }

                idadeInput.value = age > 0 ? age : '';
                idadeInput.setCustomValidity(age < 3 || age > 75 ? 'A idade deve ser entre 3 e 75 anos.' : '');
                idadeInput.reportValidity();
            });
        }
    }

    // Toggle para campo "Outros Sintomas"
    function setupOtherSymptomsToggle() {
        const outrosSintomasCheckbox = document.getElementById('outros_sintomas');
        const outrosSintomasTextInput = document.getElementById('outros_sintomas_text');

        if (outrosSintomasCheckbox && outrosSintomasTextInput) {
            outrosSintomasCheckbox.addEventListener('change', function () {
                if (this.checked) {
                    outrosSintomasTextInput.style.display = 'block';
                    outrosSintomasTextInput.setAttribute('required', 'required');
                } else {
                    outrosSintomasTextInput.style.display = 'none';
                    outrosSintomasTextInput.removeAttribute('required');
                    outrosSintomasTextInput.value = '';
                }
            });
        }
    }

    // Validação de BI (opcional)
    function setupBiValidation() {
        const biInput = document.getElementById('bi');
        if (biInput) {
            biInput.addEventListener('input', function () {
                if (this.value === '') {
                    this.setCustomValidity('');
                } else {
                    const pattern = new RegExp(this.pattern);
                    this.setCustomValidity(!pattern.test(this.value) ? this.title : '');
                }
                this.reportValidity();
            });
        }
    }

    // Validação de data da consulta
    function setupAppointmentDateValidation() {
        const dataConsultaInput = document.getElementById('data-consulta');
        if (dataConsultaInput) {
            const today = new Date();
            const formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
            dataConsultaInput.min = formattedDate;

            dataConsultaInput.addEventListener('change', function () {
                const selectedDate = new Date(this.value);
                selectedDate.setHours(0, 0, 0, 0);
                today.setHours(0, 0, 0, 0);
                this.setCustomValidity(selectedDate < today ? 'A data da consulta não pode ser anterior à data atual.' : '');
                this.reportValidity();
            });
        }
    }

    // Formatação de telefone
    function setupPhoneFormatting() {
        const input = document.getElementById('telefone');
        if (!input) return;

        input.addEventListener('input', function (e) {
            let value = input.value.replace(/\D/g, '');
            if (value.startsWith('244')) value = value.slice(3);

            if (value.startsWith('9')) {
                let formatted = '+244 ';
                if (value.length > 0) formatted += value.substring(0, 3);
                if (value.length > 3) formatted += ' ' + value.substring(3, 6);
                if (value.length > 6) formatted += ' ' + value.substring(6, 9);
                input.value = formatted;
            } else {
                input.value = '+244 ';
            }
        });

        input.value = '+244 9';
    }

    // Toggle para campos condicionais (álcool e estratégia de perda de peso)
    function setupConditionalFields() {
        // Consumo de álcool
        const alcoolSim = document.getElementById('alcoolSim');
        const alcoolNao = document.getElementById('alcoolNao');
        const freqContainer = document.getElementById('frequencia-alcool-container');
        const freqSelect = document.getElementById('freq_alcool');

        function toggleAlcoolFrequency() {
            if (alcoolSim.checked) {
                freqContainer.style.display = 'block';
                freqSelect.setAttribute('required', 'required');
            } else {
                freqContainer.style.display = 'none';
                freqSelect.removeAttribute('required');
                freqSelect.value = '';
            }
        }

        if (alcoolSim && alcoolNao) {
            alcoolSim.addEventListener('change', toggleAlcoolFrequency);
            alcoolNao.addEventListener('change', toggleAlcoolFrequency);
        }

        // Estratégia de perda de peso
        const alcoolSim1 = document.getElementById('alcoolSim1');
        const alcoolNao1 = document.getElementById('alcoolNao1');
        const freqContainer1 = document.getElementById('frequencia-alcool-container1');
        const freqSelect1 = document.getElementById('freq_alcool1');

        function toggleStrategyFrequency() {
            if (alcoolSim1.checked) {
                freqContainer1.style.display = 'block';
                freqSelect1.setAttribute('required', 'required');
            } else {
                freqContainer1.style.display = 'none';
                freqSelect1.removeAttribute('required');
                freqSelect1.value = '';
            }
        }

        if (alcoolSim1 && alcoolNao1) {
            alcoolSim1.addEventListener('change', toggleStrategyFrequency);
            alcoolNao1.addEventListener('change', toggleStrategyFrequency);
        }
    }

    // ==================== NAVEGAÇÃO DO FORMULÁRIO ====================

    // Atualiza a visibilidade das seções e o progresso
    function updateFormVisibility() {
        formSections.forEach((section, index) => {
            if (index === currentStep) {
                section.classList.add('active', 'animate__animated', 'animate__fadeIn');
            } else {
                section.classList.remove('active', 'animate__animated', 'animate__fadeIn');
            }
        });

        stepIndicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === currentStep);
        });

        const progress = ((currentStep + 1) / formSections.length) * 100;
        progressBar.style.width = `${progress}%`;
        progressBar.setAttribute('aria-valuenow', progress);

        window.scrollTo(0, 0);
    }

    // Valida uma seção específica
    function validateSection(sectionIndex) {
        const section = formSections[sectionIndex];
        const inputs = section.querySelectorAll('input, select, textarea');
        let isValid = true;

        inputs.forEach(input => {
            // Campos opcionais vazios são válidos
            if (input.id === 'bi' && input.value === '') {
                input.setCustomValidity('');
                input.classList.remove('is-invalid');
                input.classList.add('is-valid');
                return;
            }

            // Validação de radio buttons
            if (input.type === 'radio' && input.name) {
                const radioGroup = document.querySelectorAll(`input[name="${input.name}"]`);
                const isChecked = Array.from(radioGroup).some(radio => radio.checked);

                if (!isChecked && input.hasAttribute('required')) {
                    isValid = false;
                    radioGroup.forEach(radio => radio.classList.add('is-invalid'));
                    const feedback = radioGroup[0].closest('.mb-3, .row')?.querySelector('.invalid-feedback');
                    if (feedback) feedback.style.display = 'block';
                } else {
                    radioGroup.forEach(radio => {
                        radio.classList.remove('is-invalid');
                        radio.classList.add('is-valid');
                    });
                    const feedback = radioGroup[0].closest('.mb-3, .row')?.querySelector('.invalid-feedback');
                    if (feedback) feedback.style.display = 'none';
                }
            }
            // Validação de outros campos
            else if (input.checkValidity() === false) {
                isValid = false;
                input.classList.add('is-invalid');
                input.classList.remove('is-valid');
            } else {
                input.classList.remove('is-invalid');
                input.classList.add('is-valid');
            }
        });

        return isValid;
    }

    // Avança para a próxima etapa
    window.nextStep = function () {
        if (!validateSection(currentStep)) {
            form.classList.add('was-validated');
            return;
        }

        form.classList.remove('was-validated');
        if (currentStep < formSections.length - 1) {
            currentStep++;
            updateFormVisibility();
        }
    };

    // Volta para a etapa anterior
    window.prevStep = function () {
        if (currentStep > 0) {
            currentStep--;
            updateFormVisibility();
        }
    };


    // ==================== GERADOR DE PDF ====================

    form.addEventListener('submit', async function (event) {
        event.preventDefault();

        if (!validateSection(currentStep)) {
            form.classList.add('was-validated');
            return;
        }

        const formData = new FormData(form);
        const data = {};

        for (let [key, value] of formData.entries()) {
            if (key === 'sintomas') {
                data[key] = data[key] ? `${data[key]}, ${value}` : value;
            } else {
                data[key] = value;
            }
        }

        if (document.getElementById('outros_sintomas').checked && data['outros_sintomas_text']) {
            data['sintomas'] = (data['sintomas'] ? `${data['sintomas']}, ` : '') + `Outros: ${data['outros_sintomas_text']}`;
        }

        // Mapeamento correto dos campos
        const pdfFields = {
            'pdf-nome': data.nome,
            'pdf-endereco': data.endereco,
            'pdf-telefone': data.telefone,
            'pdf-email': data.email,
            'pdf-data-nascimento': data.nascimento,
            'pdf-idade': data.idade,
            'pdf-sexo': data.sexo,

            'pdf-altura': data.altura,
            'pdf-peso': data.peso,
            'pdf-estado-civil': data.estado_civil,
            'pdf-profissao': data.profissao,
            'pdf-ocupacao': data.ocupacao,

            'pdf-historico': data.historico,
            'pdf-vida_adulta': data.vida_adulta,
            'pdf-alcool1': data.alcool1,
            'pdf-freq_alcool1': data.freq_alcool1,
            'pdf-Eva': data.avaliacao_estrategia,
            'pdf-peso_max_min_adolescencia': data.adolescencia,
            'pdf-peso_max_min_adulta': data.vida_adulta_pesos,
            'pdf-dificuldades_alimentacao': data.dificuldades_alimentacao,

            'pdf-freq_evacuacao': data.freq_evacuacao,
            'pdf-fumante': data.fumante,
            'pdf-alcool': data.alcool,
            'pdf-freq_alcool': data.freq_alcool,
            'pdf-apetite': data.apetite,
            'pdf-mastigacao': data.mastigacao,
            'pdf-patologias': data.patologias,
            'pdf-historico_familiar': data.historico_familiar,
            'pdf-exames': data.exames,
            'pdf-medicacao': data.medicacao,
            'pdf-sintomas': data.sintomas,
            'pdf-outros_sintomas_text': data.outros_sintomas_text,

            'pdf-refeicoes_fora': data.refeicoes_fora,
            'pdf-local_refeicoes_fora': data.local_refeicoes_fora,
            'pdf-quem_compras': data.quem_compras,
            'pdf-alergia': data.alergia,
            'pdf-tipo_alergia': data.tipo_alergia,
            'pdf-cafe_manha': data.cafe_manha,
            'pdf-almoco': data.almoco,
            'pdf-lanche_tarde': data.lanche_tarde,
            'pdf-jantar': data.jantar,
            'pdf-alimentos_nao_gosta': data.alimentos_nao_gosta,

            'pdf-tipo_atividade': data.tipo_atividade,
            'pdf-frequencia_atividade': data.frequencia_atividade,
            'pdf-duracao_atividade': data.duracao_atividade,
            'pdf-alimentacao_atividade': data.alimentacao_atividade,
            'pdf-suplementacao': data.suplementacao,
            'pdf-data-consulta': data.data_consulta,
        };

        // Preenche os campos do PDF
        Object.entries(pdfFields).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value || 'Não informado';
            }
        });

        try {
            const pdfOutputElement = document.getElementById('pdf-output');
            pdfOutputElement.style.display = 'block';

            await html2pdf()
                .from(pdfOutputElement)
                .set({
                    margin: 15,
                    filename: `ficha_anamnese_${data.nome?.replace(/\s/g, '_') || 'paciente'}.pdf`,
                    image: { type: 'jpeg', quality: 0.98 },
                    html2canvas: { scale: 2, logging: true, dpi: 192, letterRendering: true },
                    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
                })
                .save();

            pdfOutputElement.style.display = 'none';
            document.getElementById('whatsapp-button').style.display = 'block';

            form.reset();
            currentStep = 0;
            updateFormVisibility();
        } catch (error) {
            console.error('Erro na geração do PDF:', error);
            alert('Ocorreu um erro ao gerar o PDF. Por favor, tente novamente.');
        }
    });


    // ==================== INICIALIZAÇÃO ====================

    // Configura todas as validações
    setupBirthDateValidation();
    setupOtherSymptomsToggle();
    setupBiValidation();
    setupAppointmentDateValidation();
    setupPhoneFormatting();
    setupConditionalFields();

    // Inicia o formulário
    updateFormVisibility();
});
