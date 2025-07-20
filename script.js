document.addEventListener('DOMContentLoaded', function () {
    // ==================== CONSTANTES E ELEMENTOS ====================
    const DOM = {
        form: document.getElementById('nutrition-form'),
        formSections: document.querySelectorAll('.form-section'),
        stepIndicators: document.querySelectorAll('.step'),
        progressBar: document.getElementById('form-progress'),
        pdfOutput: document.getElementById('pdf-output'),
        whatsappButton: document.getElementById('whatsapp-button')
    };

    let currentStep = 0;

    // ==================== FUNÇÕES DE VALIDAÇÃO ====================
    const Validations = {
        setupBirthDateValidation() {
            const dataNascimentoInput = document.getElementById('data-nascimento');
            const idadeInput = document.getElementById('idade');

            if (!dataNascimentoInput || !idadeInput) return;

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
        },

        setupOtherSymptomsToggle() {
            const outrosSintomasCheckbox = document.getElementById('outros_sintomas');
            const outrosSintomasTextInput = document.getElementById('outros_sintomas_text');

            if (!outrosSintomasCheckbox || !outrosSintomasTextInput) return;

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
        },

        setupBiValidation() {
            const biInput = document.getElementById('bi');
            if (!biInput) return;

            biInput.addEventListener('input', function () {
                if (this.value === '') {
                    this.setCustomValidity('');
                } else {
                    const pattern = new RegExp(this.pattern);
                    this.setCustomValidity(!pattern.test(this.value) ? this.title : '');
                }
                this.reportValidity();
            });
        },

        setupAppointmentDateValidation() {
            const dataConsultaInput = document.getElementById('data-consulta');
            if (!dataConsultaInput) return;

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
        },

        setupPhoneFormatting() {
            const input = document.getElementById('telefone');
            if (!input) return;

            input.addEventListener('input', function () {
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
    };

    // ==================== CAMPOS CONDICIONAIS ====================
    const ConditionalFields = {
        setupAlcoolToggle() {
            const alcoolSim = document.getElementById('alcoolSim');
            const alcoolNao = document.getElementById('alcoolNao');
            const freqContainer = document.getElementById('frequencia-alcool-container');
            const freqSelect = document.getElementById('freq_alcool');

            if (!alcoolSim || !alcoolNao || !freqContainer || !freqSelect) return;

            const toggleFrequency = () => {
                if (alcoolSim.checked) {
                    freqContainer.style.display = 'block';
                    freqSelect.setAttribute('required', 'required');
                } else {
                    freqContainer.style.display = 'none';
                    freqSelect.removeAttribute('required');
                    freqSelect.value = '';
                }
            };

            alcoolSim.addEventListener('change', toggleFrequency);
            alcoolNao.addEventListener('change', toggleFrequency);
        },

        setupStrategyToggle() {
            const strategySim = document.getElementById('alcoolSim1');
            const strategyNao = document.getElementById('alcoolNao1');
            const freqContainer = document.getElementById('frequencia-alcool-container1');
            const freqInput = document.getElementById('freq_alcool1');

            if (!strategySim || !strategyNao || !freqContainer || !freqInput) return;

            const toggleFrequency = () => {
                if (strategySim.checked) {
                    freqContainer.style.display = 'block';
                    freqInput.setAttribute('required', 'required');
                } else {
                    freqContainer.style.display = 'none';
                    freqInput.removeAttribute('required');
                    freqInput.value = '';
                }
            };

            strategySim.addEventListener('change', toggleFrequency);
            strategyNao.addEventListener('change', toggleFrequency);
        },

        setupRefeicoesForaToggle() {
            const refeicoesForaSim = document.getElementById('refeicoes_fora_sim');
            const refeicoesForaNao = document.getElementById('refeicoes_fora_nao');
            const localContainer = document.getElementById('local-refeicoes-container');
            const localInput = document.getElementById('local_refeicoes');

            if (!refeicoesForaSim || !refeicoesForaNao || !localContainer || !localInput) return;

            const toggleLocalRefeicoes = () => {
                if (refeicoesForaSim.checked) {
                    localContainer.style.display = 'block';
                    localInput.setAttribute('required', 'required');
                } else {
                    localContainer.style.display = 'none';
                    localInput.removeAttribute('required');
                    localInput.value = '';
                }
            };

            refeicoesForaSim.addEventListener('change', toggleLocalRefeicoes);
            refeicoesForaNao.addEventListener('change', toggleLocalRefeicoes);
        },

        setupAlergiaToggle() {
            const alergiaSim = document.getElementById('alergia_sim');
            const alergiaNao = document.getElementById('alergia_nao');
            const tipoAlergiaContainer = document.getElementById('tipo-alergia-container');
            const tipoAlergiaInput = document.getElementById('tipo_alergia');

            if (!alergiaSim || !alergiaNao || !tipoAlergiaContainer || !tipoAlergiaInput) return;

            const toggleTipoAlergia = () => {
                if (alergiaSim.checked) {
                    tipoAlergiaContainer.style.display = 'block';
                    tipoAlergiaInput.setAttribute('required', 'required');
                } else {
                    tipoAlergiaContainer.style.display = 'none';
                    tipoAlergiaInput.removeAttribute('required');
                    tipoAlergiaInput.value = '';
                }
            };

            alergiaSim.addEventListener('change', toggleTipoAlergia);
            alergiaNao.addEventListener('change', toggleTipoAlergia);
        }
    };

    // ==================== NAVEGAÇÃO DO FORMULÁRIO ====================
    const Navigation = {
        updateFormVisibility() {
            DOM.formSections.forEach((section, index) => {
                section.classList.toggle('active', index === currentStep);
                section.classList.toggle('animate__animated', index === currentStep);
                section.classList.toggle('animate__fadeIn', index === currentStep);
            });

            DOM.stepIndicators.forEach((indicator, index) => {
                indicator.classList.toggle('active', index === currentStep);
            });

            const progress = ((currentStep + 1) / DOM.formSections.length) * 100;
            DOM.progressBar.style.width = `${progress}%`;
            DOM.progressBar.setAttribute('aria-valuenow', progress);

            window.scrollTo(0, 0);
        },

        validateSection(sectionIndex) {
            const section = DOM.formSections[sectionIndex];
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
        },

        nextStep() {
            if (!this.validateSection(currentStep)) {
                DOM.form.classList.add('was-validated');
                return;
            }

            DOM.form.classList.remove('was-validated');
            if (currentStep < DOM.formSections.length - 1) {
                currentStep++;
                this.updateFormVisibility();
            }
        },

        prevStep() {
            if (currentStep > 0) {
                currentStep--;
                this.updateFormVisibility();
            }
        }
    };

    // ==================== GERADOR DE PDF ====================
    const PDFGenerator = {
        async generatePDF(event) {
            event.preventDefault();

            if (!Navigation.validateSection(currentStep)) {
                DOM.form.classList.add('was-validated');
                return;
            }

            const formData = new FormData(DOM.form);
            const data = this.processFormData(formData);
            this.fillPDFFields(data);
            
            try {
                DOM.pdfOutput.style.display = 'block';
                
                const opt = {
                    margin: 10,
                    filename: `ficha_anamnese_${(data.nome || 'paciente').replace(/\s+/g, '_')}.pdf`,
                    image: { type: 'jpeg', quality: 0.98 },
                    html2canvas: { scale: 2, logging: true, dpi: 192, letterRendering: true },
                    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
                };

                await html2pdf().set(opt).from(DOM.pdfOutput).save();
                this.resetForm();
                
            } catch (error) {
                console.error('Erro na geração do PDF:', error);
                alert('Ocorreu um erro ao gerar o PDF. Por favor, tente novamente.');
            } finally {
                DOM.pdfOutput.style.display = 'none';
            }
        },

        processFormData(formData) {
            const data = {};

            for (let [key, value] of formData.entries()) {
                if (key === 'sintomas') {
                    data[key] = data[key] ? `${data[key]}, ${value}` : value;
                } else if (key === 'refeicoes_fora' || key === 'alergia' || key === 'alcool' || key === 'fumante') {
                    data[key] = value;
                } else {
                    data[key] = value;
                }
            }

            if (document.getElementById('outros_sintomas').checked && data['outros_sintomas_text']) {
                data['sintomas'] = (data['sintomas'] ? `${data['sintomas']}, ` : '') + `Outros: ${data['outros_sintomas_text']}`;
            }

            return data;
        },

        fillPDFFields(data) {
            const pdfFields = {
                // Seção 1: Identificação
                'pdf-nome': data.nome,
                'pdf-endereco': data.endereco,
                'pdf-telefone': data.telefone,
                'pdf-email': data.email,
                'pdf-data-nascimento': data.data_nascimento,
                'pdf-idade': data.idade,
                'pdf-sexo': data.sexo,

                // Seção 2: Dados do Paciente
                'pdf-altura': data.altura ? `${data.altura} m` : '',
                'pdf-peso': data.peso ? `${data.peso} kg` : '',
                'pdf-estado-civil': data.estado_civil,
                'pdf-profissao': data.profissao,
                'pdf-ocupacao': data.ocupacao,

                // Seção 3: Histórico do Paciente
                'pdf-historico': data.historico,
                'pdf-vida_adulta': data.vida_adulta,
                'pdf-alcool1': data.alcool,
                'pdf-freq_alcool1': data.freq_alcool1,
                'pdf-Eva': data.Eva,
                'pdf-peso_max_min_adolescencia': data.peso_max_min_adolescencia,
                'pdf-peso_max_min_adulta': data.peso_max_min_adulta,
                'pdf-dificuldades_alimentacao': data.dificuldades_alimentacao,

                // Seção 4: Hábitos de Vida
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

                // Seção 5: Hábitos Alimentares
                'pdf-refeicoes_fora': data.refeicoes_fora,
                'pdf-local_refeicoes': data.local_refeicoes,
                'pdf-quem_compras': data.quem_compras,
                'pdf-alergia': data.alergia,
                'pdf-tipo_alergia': data.tipo_alergia,
                'pdf-cafe_manha': data.cafe_manha,
                'pdf-almoco': data.almoco,
                'pdf-lanche_tarde': data.lanche_tarde,
                'pdf-jantar': data.jantar,
                'pdf-alimentos_nao_gosta': data.alimentos_nao_gosta,

                // Seção 6: Atividades Físicas
                'pdf-tipo_atividade': data.tipo_atividade,
                'pdf-frequencia_atividade': data.frequencia_atividade,
                'pdf-duracao_atividade': data.duracao_atividade,
                'pdf-alimentacao_atividade': data.alimentacao_atividade,
                'pdf-suplementacao': data.suplementacao,
                'pdf-data-consulta': data.data-consulta,
            };

            Object.entries(pdfFields).forEach(([id, value]) => {
                const element = document.getElementById(id);
                if (element) element.textContent = value || 'Não informado';
            });

            document.getElementById('data-geracao-pdf').textContent = new Date().toLocaleString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        },

        resetForm() {
            DOM.form.reset();
            currentStep = 0;
            Navigation.updateFormVisibility();
            DOM.form.classList.remove('was-validated');
            
            document.querySelectorAll('.is-invalid, .is-valid').forEach(el => {
                el.classList.remove('is-invalid', 'is-valid');
            });

            if (DOM.whatsappButton) {
                DOM.whatsappButton.style.display = 'block';
            }
        }
    };

    // ==================== INICIALIZAÇÃO ====================
    function init() {
        // Configura validações
        Validations.setupBirthDateValidation();
        Validations.setupOtherSymptomsToggle();
        Validations.setupBiValidation();
        Validations.setupAppointmentDateValidation();
        Validations.setupPhoneFormatting();

        // Configura campos condicionais
        ConditionalFields.setupAlcoolToggle();
        ConditionalFields.setupStrategyToggle();
        ConditionalFields.setupRefeicoesForaToggle();
        ConditionalFields.setupAlergiaToggle();

        // Configura navegação
        window.nextStep = () => Navigation.nextStep();
        window.prevStep = () => Navigation.prevStep();

        // Configura PDF
        DOM.form.addEventListener('submit', (e) => PDFGenerator.generatePDF(e));

        // Inicia o formulário
        Navigation.updateFormVisibility();
    }

    init();
});
