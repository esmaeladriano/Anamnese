
        document.addEventListener('DOMContentLoaded', function () {
            // --- Constantes e Variáveis Globais ---
            const form = document.getElementById('nutrition-form');
            const sections = document.querySelectorAll('.form-section'); // Suas seções de formulário
            const prevBtn = document.getElementById('prev-btn');
            const nextBtn = document.getElementById('next-btn');
            const submitBtn = document.getElementById('submit-btn');
            const progressBar = document.getElementById('form-progress');
            let currentSection = 0;

            // Campos específicos do Step 1 (Dados do Paciente)
            const nomeInput = document.getElementById('nome');
            const dataNascimentoInput = document.getElementById('data-nascimento');
            const idadeInput = document.getElementById('idade');
            const sexoMRadio = document.getElementById('sexoM');
            const sexoFRadio = document.getElementById('sexoF');
            const telefoneInput = document.getElementById('telefone');
            const emailInput = document.getElementById('email');
            const biInput = document.getElementById('bi');
            const objetivoSelect = document.getElementById('objetivo'); // Certifique-se que o ID está correto

            // Campos específicos do Step 2 (Medidas Corporais)
            const alturaInput = document.getElementById('altura');
            const pesoInput = document.getElementById('peso');
            const imcInput = document.getElementById('imc');
            const cinturaInput = document.getElementById('circunferencia-cintura');
            const quadrilInput = document.getElementById('circunferencia-quadril');
            const rcqInput = document.getElementById('rcq');

            // Campos específicos do Step 3 (Hábitos Alimentares)
            const refeicoesDiaSelect = document.getElementById('refeicoes-dia');
            const frutasVegetaisRadios = document.querySelectorAll('input[name="frutas-vegetais"]');
            const aguaDiaSelect = document.getElementById('agua-dia');
            const alimentosCheckboxes = document.querySelectorAll('input[type="checkbox"][id^="alimento"]');
            const alergiasTextarea = document.getElementById('alergias');


            // --- Funções de Ajuda ---

            /**
             * Atualiza a barra de progresso e os indicadores de passo.
             */
            function updateProgress() {
                const progress = ((currentSection + 1) / sections.length) * 100;
                progressBar.style.width = `${progress}%`;

                document.querySelectorAll('.step').forEach((step, index) => {
                    if (index < currentSection) {
                        step.classList.remove('active');
                        step.classList.add('completed');
                    } else if (index === currentSection) {
                        step.classList.add('active');
                        step.classList.remove('completed');
                    } else {
                        step.classList.remove('active', 'completed');
                    }
                });
            }

            /**
             * Mostra a seção do formulário no índice especificado.
             * @param {number} index - O índice da seção a ser mostrada.
             */
            function showSection(index) {
                sections.forEach((section, i) => {
                    if (i === index) {
                        section.classList.add('active');
                    } else {
                        section.classList.remove('active');
                    }
                });

                prevBtn.disabled = index === 0;
                nextBtn.style.display = index === sections.length - 1 ? 'none' : 'block';
                submitBtn.style.display = index === sections.length - 1 ? 'block' : 'none';

                updateProgress();
                // Rolar para o topo do formulário para melhor UX
                window.scrollTo({ top: form.offsetTop, behavior: 'smooth' });
            }

            /**
             * Calcula a idade a partir da data de nascimento.
             * @param {string} data - Data de nascimento no formato 'YYYY-MM-DD'.
             * @returns {number} Idade calculada.
             */
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

            /**
             * Valida um campo específico, adicionando/removendo classes de feedback.
             * @param {HTMLElement} campo - O elemento de input a ser validado.
             * @param {boolean} condicaoValida - A condição de validade.
             * @returns {boolean} True se válido, false caso contrário.
             */
            function validarCampo(campo, condicaoValida) {
                if (condicaoValida) {
                    campo.classList.remove("is-invalid");
                    campo.classList.add("is-valid");
                    return true;
                } else {
                    campo.classList.remove("is-valid");
                    campo.classList.add("is-invalid");
                    return false;
                }
            }

            /**
             * Valida todos os campos da seção atual.
             * @returns {boolean} True se a seção atual for válida, false caso contrário.
             */
            function validateCurrentSection() {
                const currentSectionForm = sections[currentSection];
                // Seleciona todos os campos que têm a validação nativa do navegador
                const inputs = currentSectionForm.querySelectorAll('input[required], select[required], textarea[required]');
                let isValid = true;

                inputs.forEach(input => {
                    if (input.type === 'radio') {
                        // Para grupos de rádio, a validação é diferente
                        const radioGroup = document.querySelectorAll(`input[name="${input.name}"]`);
                        const isRadioChecked = Array.from(radioGroup).some(radio => radio.checked);
                        if (!isRadioChecked) {
                            isValid = false;
                            // Adiciona a classe 'is-invalid' ao primeiro rádio do grupo ou a um contêiner
                            // Para exibir a mensagem de feedback.
                            input.classList.add('is-invalid');
                            // Garante que o feedback visual seja mostrado
                            const parentCol = input.closest('.col-md-6.mb-3') || input.closest('.col-12');
                            if (parentCol) {
                                let feedbackDiv = parentCol.querySelector('.invalid-feedback');
                                if (!feedbackDiv) {
                                    feedbackDiv = document.createElement('div');
                                    feedbackDiv.classList.add('invalid-feedback');
                                    feedbackDiv.textContent = 'Por favor, selecione uma opção.';
                                    parentCol.appendChild(feedbackDiv);
                                }
                                feedbackDiv.style.display = 'block';
                            }
                        } else {
                            input.classList.remove('is-invalid');
                            const parentCol = input.closest('.col-md-6.mb-3') || input.closest('.col-12');
                            if (parentCol) {
                                const feedbackDiv = parentCol.querySelector('.invalid-feedback');
                                if (feedbackDiv) feedbackDiv.style.display = 'none';
                            }
                        }
                    } else if (!input.checkValidity()) {
                        input.classList.add('is-invalid');
                        input.classList.remove('is-valid');
                        isValid = false;
                    } else {
                        input.classList.remove('is-invalid');
                        input.classList.add('is-valid');
                    }
                });

                // Validações específicas para o Step 1 (Dados do Paciente)
                if (currentSection === 0) {
                    // Validação do nome
                    if (!validarCampo(nomeInput, nomeInput.value.trim().length >= 5)) isValid = false;

                    // Validação da data de nascimento e idade
                    if (dataNascimentoInput.value) {
                        const dataNasc = new Date(dataNascimentoInput.value);
                        const idadeCalculada = calcularIdade(dataNascimentoInput.value);
                        idadeInput.value = idadeCalculada; // Atualiza o campo idade

                        const hoje = new Date();
                        const anoMinPermitido = hoje.getFullYear() - 120; // Idade máxima
                        const anoMaxPermitido = hoje.getFullYear() - 3; // Idade mínima

                        const dataMinValida = new Date(`${anoMinPermitido}-01-01`);
                        const dataMaxValida = new Date(`${anoMaxPermitido}-12-31`);

                        // Verifica se a data de nascimento está dentro do intervalo de idade válido (3 a 120 anos)
                        const dataNascValida = dataNasc >= dataMinValida && dataNasc <= dataMaxValida;

                        if (!validarCampo(dataNascimentoInput, dataNascValida)) isValid = false;
                        if (!validarCampo(idadeInput, idadeCalculada >= 3 && idadeCalculada <= 120)) isValid = false;

                    } else {
                        // Se a data de nascimento não foi preenchida
                        if (!validarCampo(dataNascimentoInput, false)) isValid = false;
                        if (!validarCampo(idadeInput, false)) isValid = false; // Idade também inválida
                    }

                    // Validação do telefone
                    if (!validarCampo(telefoneInput, /^\d{9,}$/.test(telefoneInput.value.replace(/\D/g, '')))) isValid = false;

                    // Validação do e-mail
                    if (!validarCampo(emailInput, /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value.trim()))) isValid = false;


                    // Validação de BI (se preenchido, mínimo de 6 caracteres)
                    if (biInput.value.trim() !== "" && !validarCampo(biInput, biInput.value.trim().length >= 6)) isValid = false;
                    else if (biInput.value.trim() === "") validarCampo(biInput, true); // Remover validação se vazio

                    // Validação do objetivo (select required já coberto por inputs.forEach)
                }

                // Validações específicas para o Step 2 (Medidas Corporais)
                if (currentSection === 1) {
                    // Cálculo do IMC
                    const altura = alturaInput.value;
                    const peso = pesoInput.value;
                    if (altura && peso) {
                        const imc = (peso / ((altura / 100) * (altura / 100))).toFixed(1);
                        imcInput.value = imc;
                    } else {
                        imcInput.value = '';
                    }

                    // Cálculo da Relação Cintura/Quadril (RCQ)
                    const cintura = cinturaInput.value;
                    const quadril = quadrilInput.value;
                    if (cintura && quadril) {
                        const rcq = (cintura / quadril).toFixed(2);
                        rcqInput.value = rcq;
                    } else {
                        rcqInput.value = '';
                    }
                }

                return isValid;
            }

            // --- Event Listeners ---

            // Botão Próximo
            nextBtn.addEventListener('click', function () {
                if (validateCurrentSection()) {
                    currentSection++;
                    showSection(currentSection);
                } else {
                    form.classList.add('was-validated'); // Ativa o feedback de validação do Bootstrap
                }
            });

            // Botão Voltar
            prevBtn.addEventListener('click', function () {
                currentSection--;
                showSection(currentSection);
            });

            // Submissão do Formulário (botão Enviar Formulário)
            submitBtn.addEventListener('click', function (e) {
                e.preventDefault(); // Impede a submissão padrão do formulário

                // Validação da seção final (Confirmação)
                const termosCheckbox = document.getElementById('termos');
                let isFinalSectionValid = true;

                if (!termosCheckbox.checked) {
                    termosCheckbox.classList.add('is-invalid');
                    isFinalSectionValid = false;
                } else {
                    termosCheckbox.classList.remove('is-invalid');
                }

                if (isFinalSectionValid) {
                    prepareReviewData(); // Prepara os dados para exibição na revisão

                    // Em uma aplicação real, você enviaria os dados do formulário aqui
                    alert('Formulário enviado com sucesso! Entraremos em contato em breve.');

                    // Reset do formulário e volta ao primeiro passo
                    form.reset();
                    currentSection = 0;
                    showSection(currentSection);
                    form.classList.remove('was-validated'); // Remove feedback de validação

                    // Limpar campos calculados
                    imcInput.value = '';
                    rcqInput.value = '';
                    idadeInput.value = '';
                } else {
                    form.classList.add('was-validated'); // Ativa o feedback de validação
                }
            });

            // Listener para cálculo automático da idade ao mudar a data de nascimento
            dataNascimentoInput.addEventListener('change', function () {
                if (dataNascimentoInput.value) {
                    const idadeCalculada = calcularIdade(dataNascimentoInput.value);
                    idadeInput.value = idadeCalculada;
                    // Força a revalidação do campo de idade
                    validateCurrentSection();
                } else {
                    idadeInput.value = '';
                    // Força a revalidação para mostrar erro se o campo for limpo
                    validateCurrentSection();
                }
            });

            // --- Funções para Preparar Dados de Revisão ---

            /**
             * Prepara os dados do formulário para exibição na seção de confirmação.
             */
            function prepareReviewData() {
                // Dados Pessoais
                const sexoValue = sexoMRadio.checked ? sexoMRadio.value : (sexoFRadio.checked ? sexoFRadio.value : 'Não informado');

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

                // Medidas Corporais (já calculadas no passo 2, apenas exibir)
                document.getElementById('review-medidas').innerHTML = `
                <p><strong>Altura:</strong> ${alturaInput.value} cm</p>
                <p><strong>Peso:</strong> ${pesoInput.value} kg</p>
                <p><strong>IMC:</strong> ${imcInput.value || 'Não calculado'}</p>
                <p><strong>Circunferência da Cintura:</strong> ${cinturaInput.value || 'Não informado'} cm</p>
                <p><strong>Circunferência do Quadril:</strong> ${quadrilInput.value || 'Não informado'} cm</p>
                <p><strong>Relação Cintura/Quadril:</strong> ${rcqInput.value || 'Não calculado'}</p>
            `;

                // Hábitos Alimentares
                const frutasVegetaisChecked = document.querySelector('input[name="frutas-vegetais"]:checked')?.value;
                const alimentosSelecionados = Array.from(alimentosCheckboxes)
                    .filter(cb => cb.checked)
                    .map(cb => cb.nextElementSibling.textContent.trim())
                    .join(', ');

                document.getElementById('review-habitos').innerHTML = `
                <p><strong>Refeições por dia:</strong> ${formatRefeicoes(refeicoesDiaSelect.value)}</p>
                <p><strong>Consome frutas/vegetais diariamente:</strong> ${frutasVegetaisChecked === 'sim' ? 'Sim' : 'Não'}</p>
                <p><strong>Água consumida por dia:</strong> ${formatAgua(aguaDiaSelect.value)}</p>
                <p><strong>Alimentos consumidos com frequência:</strong> ${alimentosSelecionados || 'Nenhum selecionado'}</p>
                <p><strong>Alergias/Restrições:</strong> ${alergiasTextarea.value || 'Nenhuma'}</p>
            `;
            }

            // --- Funções de Formatação (Mantidas do original) ---
            function formatDate(dateString) {
                if (!dateString) return 'Não informado';
                const date = new Date(dateString);
                return date.toLocaleDateString('pt-BR');
            }

            function formatObjetivo(objetivo) {
                const map = {
                    'perda-peso': 'Perda de peso',
                    'ganho-massa': 'Ganho de massa muscular',
                    'manutencao': 'Manutenção',
                    'melhorar-saude': 'Melhorar saúde'
                };
                return map[objetivo] || 'Não informado';
            }

            function formatRefeicoes(refeicoes) {
                const map = {
                    '1-2': '1-2 refeições',
                    '3': '3 refeições',
                    '4-5': '4-5 refeições',
                    '6+': '6+ refeições'
                };
                return map[refeicoes] || 'Não informado';
            }

            function formatAgua(agua) {
                const map = {
                    'menos-1L': 'Menos de 1L',
                    '1-2L': '1-2L',
                    '2-3L': '2-3L',
                    'mais-3L': 'Mais de 3L'
                };
                return map[agua] || 'Não informado';
            }

            // --- Inicialização do Formulário ---
            showSection(0);

            // --- Máscara de Telefone ---
            telefoneInput.addEventListener('input', function (e) {
                let value = e.target.value.replace(/\D/g, ''); // Remove tudo que não é dígito
                if (value.length > 11) value = value.substring(0, 11); // Limita a 11 dígitos

                // Aplica a máscara
                if (value.length > 0) {
                    value = value.replace(/^(\d{2})(\d)/g, '($1) $2'); // (XX) X
                    if (value.length > 10) {
                        value = value.replace(/(\d)(\d{4})$/, '$1-$2'); // (XX) XXXXX-XXXX
                    } else {
                        value = value.replace(/(\d)(\d{3})$/, '$1-$2'); // (XX) XXXX-XXXX
                    }
                }
                e.target.value = value;
            });
        });
