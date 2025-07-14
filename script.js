document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('nutrition-form');
    const formSections = document.querySelectorAll('.form-section');
    const stepIndicators = document.querySelectorAll('.step');
    const progressBar = document.getElementById('form-progress');
    let currentStep = 0;

    // Função para calcular a idade a partir da data de nascimento
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
            idadeInput.value = age > 0 ? age : ''; // Define a idade, ou deixa vazio se for inválida/futura
            idadeInput.setCustomValidity(age < 3 || age > 75 ? 'A idade deve ser entre 3 e 75 anos.' : '');
            idadeInput.reportValidity(); // Mostra a mensagem de validação
        });
    }

    // Lógica para mostrar/ocultar campo "Outros Sintomas"
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
                outrosSintomasTextInput.value = ''; // Limpa o campo se desmarcado
            }
        });
    }

    // Lógica para BI opcional (apenas valida se preenchido)
    const biInput = document.getElementById('bi');
    if (biInput) {
        biInput.addEventListener('input', function () {
            if (this.value === '') {
                this.setCustomValidity(''); // Campo vazio é válido
            } else {
                // Valida o padrão apenas se o campo não estiver vazio
                const pattern = new RegExp(this.pattern);
                if (!pattern.test(this.value)) {
                    this.setCustomValidity(this.title);
                } else {
                    this.setCustomValidity('');
                }
            }
            this.reportValidity();
        });
    }

    // Lógica para Data da Consulta
    const dataConsultaInput = document.getElementById('data-consulta');
    if (dataConsultaInput) {
        const today = new Date();
        const yyyy = today.getFullYear();
        let mm = today.getMonth() + 1;
        let dd = today.getDate();

        if (mm < 10) mm = '0' + mm;
        if (dd < 10) dd = '0' + dd;

        const todayFormatted = `${yyyy}-${mm}-${dd}`;
        dataConsultaInput.min = todayFormatted;

        dataConsultaInput.addEventListener('change', function () {
            const selectedDate = new Date(this.value);
            // Zera as horas para comparar apenas as datas
            selectedDate.setHours(0, 0, 0, 0);
            today.setHours(0, 0, 0, 0);

            if (selectedDate < today) {
                this.setCustomValidity('A data da consulta não pode ser anterior à data atual.');
            } else {
                this.setCustomValidity('');
            }
            this.reportValidity();
        });
    }


    // Função para atualizar a visibilidade das seções e o progresso
    function updateFormVisibility() {
        formSections.forEach((section, index) => {
            if (index === currentStep) {
                section.classList.add('active', 'animate__animated', 'animate__fadeIn');
            } else {
                section.classList.remove('active', 'animate__animated', 'animate__fadeIn');
            }
        });

        stepIndicators.forEach((indicator, index) => {
            if (index === currentStep) {
                indicator.classList.add('active');
            } else {
                indicator.classList.remove('active');
            }
        });

        const progress = ((currentStep + 1) / formSections.length) * 100;
        progressBar.style.width = `${progress}%`;
        progressBar.setAttribute('aria-valuenow', progress);

        // Desativar rolagem para o topo automático em cada nextStep
        window.scrollTo(0, 0);
    }

    // Função para avançar para a próxima etapa
    window.nextStep = function () {
        // Valida apenas os campos da seção atual antes de avançar
        const currentSection = formSections[currentStep];
        const inputs = currentSection.querySelectorAll('input, select, textarea');
        let sectionIsValid = true;

        inputs.forEach(input => {
            // Se o campo for opcional (como o BI), não force a validação se estiver vazio
            if (input.id === 'bi' && input.value === '') {
                input.setCustomValidity(''); // Garante que BI vazio seja considerado válido
                input.classList.remove('is-invalid');
                input.classList.add('is-valid');
                return;
            }

            // Para radio buttons, verifique se ao menos um está selecionado no grupo
            if (input.type === 'radio' && input.name) {
                const radioGroup = document.querySelectorAll(`input[name="${input.name}"]`);
                const isChecked = Array.from(radioGroup).some(radio => radio.checked);
                if (!isChecked && input.hasAttribute('required')) {
                    sectionIsValid = false;
                    // Adiciona a classe is-invalid a todos os radios do grupo para feedback visual
                    radioGroup.forEach(radio => radio.classList.add('is-invalid'));
                    // Para mostrar a mensagem de feedback, podemos usar o primeiro radio no grupo
                    radioGroup[0].closest('.mb-3, .row').querySelector('.invalid-feedback').style.display = 'block';
                } else {
                    radioGroup.forEach(radio => {
                        radio.classList.remove('is-invalid');
                        radio.classList.add('is-valid');
                    });
                    if (radioGroup[0].closest('.mb-3, .row').querySelector('.invalid-feedback')) {
                        radioGroup[0].closest('.mb-3, .row').querySelector('.invalid-feedback').style.display = 'none';
                    }
                }
            } else if (input.checkValidity() === false) {
                sectionIsValid = false;
                input.classList.add('is-invalid');
                input.classList.remove('is-valid');
            } else {
                input.classList.remove('is-invalid');
                input.classList.add('is-valid');
            }
        });

        // Se a seção atual não for válida, para aqui
        if (!sectionIsValid) {
            form.classList.add('was-validated'); // Adiciona a classe para mostrar feedback do Bootstrap
            return;
        } else {
            form.classList.remove('was-validated');
        }


        if (currentStep < formSections.length - 1) {
            currentStep++;
            updateFormVisibility();
        }
    };

    // Função para voltar à etapa anterior
    window.prevStep = function () {
        if (currentStep > 0) {
            currentStep--;
            updateFormVisibility();
        }
    };

    // --- Lógica de Geração e Envio de PDF ---
    form.addEventListener('submit', async function (event) {
        event.preventDefault(); // Impede o envio padrão do formulário

        // Valida a última seção antes de enviar
        const currentSection = formSections[currentStep];
        const inputs = currentSection.querySelectorAll('input, select, textarea');
        let formIsValid = true;

        inputs.forEach(input => {
            if (input.id === 'bi' && input.value === '') {
                input.setCustomValidity('');
                input.classList.remove('is-invalid');
                input.classList.add('is-valid');
                return;
            }
            if (input.type === 'radio' && input.name) {
                const radioGroup = document.querySelectorAll(`input[name="${input.name}"]`);
                const isChecked = Array.from(radioGroup).some(radio => radio.checked);
                if (!isChecked && input.hasAttribute('required')) {
                    formIsValid = false;
                    radioGroup.forEach(radio => radio.classList.add('is-invalid'));
                    radioGroup[0].closest('.mb-3, .row').querySelector('.invalid-feedback').style.display = 'block';
                } else {
                    radioGroup.forEach(radio => {
                        radio.classList.remove('is-invalid');
                        radio.classList.add('is-valid');
                    });
                    if (radioGroup[0].closest('.mb-3, .row').querySelector('.invalid-feedback')) {
                        radioGroup[0].closest('.mb-3, .row').querySelector('.invalid-feedback').style.display = 'none';
                    }
                }
            } else if (input.checkValidity() === false) {
                formIsValid = false;
                input.classList.add('is-invalid');
                input.classList.remove('is-valid');
            } else {
                input.classList.remove('is-invalid');
                input.classList.add('is-valid');
            }
        });

        if (!formIsValid) {
            form.classList.add('was-validated');
            return;
        } else {
            form.classList.remove('was-validated');
        }


        // 1. Coletar todos os dados do formulário
        const formData = new FormData(form);
        const data = {};
        for (let [key, value] of formData.entries()) {
            // Lidar com múltiplos checkboxes com o mesmo nome
            if (key === 'sintomas' && data[key]) {
                data[key] += `, ${value}`;
            } else if (key === 'sintomas') { // Primeira vez que 'sintomas' é encontrado
                data[key] = value;
            } else {
                data[key] = value;
            }
        }

        // Lidar com o campo 'outros_sintomas_text' se 'Outros' estiver marcado
        if (document.getElementById('outros_sintomas').checked && data['outros_sintomas_text']) {
            data['sintomas'] = (data['sintomas'] ? data['sintomas'] + ', ' : '') + 'Outros: ' + data['outros_sintomas_text'];
        } else if (!document.getElementById('outros_sintomas').checked) {
            delete data['outros_sintomas_text']; // Remover se não foi marcado 'Outros'
        }


        // 2. Popular o conteúdo HTML que será transformado em PDF
        document.getElementById('pdf-nome').textContent = data.nome || 'Não informado';
        document.getElementById('pdf-data-nascimento').textContent = data.nascimento || 'Não informado';
        document.getElementById('pdf-idade').textContent = data.idade || 'Não informado';
        document.getElementById('pdf-sexo').textContent = data.sexo || 'Não informado';
        document.getElementById('pdf-email').textContent = data.email || 'Não informado';
        document.getElementById('pdf-telefone').textContent = data.telefone || 'Não informado';
        document.getElementById('pdf-estado-civil').textContent = data.estado_civil || 'Não informado';
        document.getElementById('pdf-bi').textContent = data.bi || 'Não informado';

        document.getElementById('pdf-peso').textContent = data.peso || 'Não informado';
        document.getElementById('pdf-altura').textContent = data.altura || 'Não informado';
        document.getElementById('pdf-profissao').textContent = data.profissao || 'Não informado';
        document.getElementById('pdf-ocupacao').textContent = data.ocupacao || 'Não informado';
        document.getElementById('pdf-endereco').textContent = data.endereco || 'Não informado';
        document.getElementById('pdf-data-consulta').textContent = data.data || 'Não informado';
        document.getElementById('pdf-historico').textContent = data.historico || 'Não informado';

        document.getElementById('pdf-peso_max_min').textContent = data.peso_max_min || 'Não informado';
        document.getElementById('pdf-vida_adulta').textContent = data.vida_adulta || 'Não informado';
        document.getElementById('pdf-adolescencia').textContent = data.adolescencia || 'Não informado';
        document.getElementById('pdf-dificuldades_alimentacao').textContent = data.dificuldades_alimentacao || 'Não informado';
        document.getElementById('pdf-habitos_vida').textContent = data.habitos_vida || 'Não informado';
        document.getElementById('pdf-agua_por_dia').textContent = data.agua_por_dia || 'Não informado';
        document.getElementById('pdf-freq_evacuacao').textContent = data.freq_evacuacao || 'Não informado';
        document.getElementById('pdf-fumante').textContent = data.fumante || 'Não informado';
        document.getElementById('pdf-alcool').textContent = data.alcool || 'Não informado';
        document.getElementById('pdf-freq_alcool').textContent = data.freq_alcool || 'Não informado';
        document.getElementById('pdf-apetite').textContent = data.apetite || 'Não informado';
        document.getElementById('pdf-mastigacao').textContent = data.mastigacao || 'Não informado';

        document.getElementById('pdf-patologias').textContent = data.patologias || 'Não informado';
        document.getElementById('pdf-historico_familiar').textContent = data.historico_familiar || 'Não informado';
        document.getElementById('pdf-exames').textContent = data.exames || 'Não informado';
        document.getElementById('pdf-medicacao').textContent = data.medicacao || 'Não informado';
        document.getElementById('pdf-sintomas').textContent = data.sintomas || 'Nenhum selecionado';
        document.getElementById('pdf-outros_sintomas_text').textContent = data.outros_sintomas_text || 'Não informado';


        document.getElementById('pdf-refeicoes_dia').textContent = data.refeicoes_dia || 'Não informado';
        document.getElementById('pdf-horarios_refeicoes').textContent = data.horarios_refeicoes || 'Não informado';
        document.getElementById('pdf-local_refeicoes').textContent = data.local_refeicoes || 'Não informado';
        document.getElementById('pdf-quem_prepara').textContent = data.quem_prepara || 'Não informado';
        document.getElementById('pdf-come_assistindo').textContent = data.come_assistindo || 'Não informado';
        document.getElementById('pdf-come_rapido').textContent = data.come_rapido || 'Não informado';
        document.getElementById('pdf-faz_dieta').textContent = data.faz_dieta || 'Não informado';
        document.getElementById('pdf-petiscar').textContent = data.petiscar || 'Não informado';
        document.getElementById('pdf-jantar').textContent = data.jantar || 'Não informado';
        document.getElementById('pdf-cafe_manha').textContent = data.cafe_manha || 'Não informado';
        document.getElementById('pdf-almocar').textContent = data.almocar || 'Não informado';
        document.getElementById('pdf-alimentos_nao_gosta').textContent = data.alimentos_nao_gosta || 'Não informado';
        document.getElementById('pdf-alimentos_preferidos').textContent = data.alimentos_preferidos || 'Não informado';


        const pdfOutputElement = document.getElementById('pdf-output');

        // 3. Gerar o PDF
        try {
            pdfOutputElement.style.display = 'block'; // Torna visível para renderizar corretamente

            await html2pdf().from(pdfOutputElement).set({
                margin: 15,
                filename: `ficha_anamnese_${data.nome.replace(/\s/g, '_')}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, logging: true, dpi: 192, letterRendering: true },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            }).save();

            pdfOutputElement.style.display = 'none'; // Opcional: esconde de novo após gerar o PDF
            document.getElementById('whatsapp-button').style.display = 'block';


            alert('PDF gerado e baixado com sucesso!');
            document.getElementById('whatsapp-button').style.display = 'block';

            // Opcional: Limpar o formulário ou retornar ao primeiro passo após o download
            form.reset();
            currentStep = 0;
            updateFormVisibility();

        } catch (error) {
            console.error('Erro na geração do PDF:', error);
            alert('Ocorreu um erro ao gerar o PDF. Por favor, tente novamente.');
        }
    });

    // Inicia o formulário na primeira etapa
    updateFormVisibility();
});
