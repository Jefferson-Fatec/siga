// js/script.js - Utilitários Globais e Lógica da Página Inicial (index.html)

// --- Funções Utilitárias Globais ---
function showMessage(element, message, type) {
    if (element) {
        element.classList.remove('d-none', 'alert-success', 'alert-danger');
        element.classList.add(`alert-${type}`);
        element.textContent = message;
        setTimeout(() => {
            element.classList.add('d-none');
        }, 5000);
    }
}

// Funções de máscara de input (apenas as definições, não os event listeners)
function formatCEP(value) {
    value = value.replace(/\D/g, '');
    if (value.length > 5) {
        value = value.replace(/^(\d{5})(\d)/, '$1-$2');
    }
    return value;
}

function formatCPF(value) {
    value = value.replace(/\D/g, '');
    if (value.length > 9) {
        value = value.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
    } else if (value.length > 6) {
        value = value.replace(/^(\d{3})(\d{3})(\d)/, '$1.$2.$3');
    } else if (value.length > 3) {
        value = value.replace(/^(\d{3})(\d)/, '$1.$2');
    }
    return value;
}

function formatTelefone(value) {
    value = value.replace(/\D/g, '');
    if (value.length === 11) {
        value = value.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
    } else if (value.length === 10) {
        value = value.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3');
    } else if (value.length > 6) {
        value = value.replace(/^(\d{2})(\d{4})(\d)/, '($1) $2-$3');
    } else if (value.length > 2) {
        value = value.replace(/^(\d{2})(\d)/, '($1) $2');
    }
    return value;
}

// Função para validar CPF (algoritmo)
function validarCPF(cpf) {
    cpf = cpf.replace(/[^\d]+/g, '');
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
    let soma = 0, resto;
    for (let i = 1; i <= 9; i++) soma = soma + parseInt(cpf.substring(i - 1, i)) * (11 - i);
    resto = (soma * 10) % 11;
    if ((resto === 10) || (resto === 11)) resto = 0;
    if (resto !== parseInt(cpf.substring(9, 10))) return false;
    soma = 0;
    for (let i = 1; i <= 10; i++) soma = soma + parseInt(cpf.substring(i - 1, i)) * (12 - i);
    resto = (soma * 10) % 11;
    if ((resto === 10) || (resto === 11)) resto = 0;
    if (resto !== parseInt(cpf.substring(10, 11))) return false;
    return true;
}

// Função para consultar o ViaCEP
async function consultarCEP(cep) {
    cep = cep.replace(/\D/g, '');
    if (cep.length !== 8) {
        return null;
    }
    try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();
        if (data.erro) {
            return null;
        }
        return data;
    } catch (error) {
        console.error('Erro ao consultar ViaCEP:', error);
        return null;
    }
}

// Função de validação de campo (reutilizada por formulários)
function validateField(input) {
    const feedback = input.nextElementSibling;
    let isValid = true;

    if (input.hasAttribute('required') && input.value.trim() === '') {
        input.classList.add('is-invalid');
        input.classList.remove('is-valid');
        if (feedback) feedback.textContent = 'Este campo é obrigatório.';
        isValid = false;
    } else {
        switch (input.id) {
            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(input.value.trim())) {
                    input.classList.add('is-invalid');
                    input.classList.remove('is-valid');
                    if (feedback) feedback.textContent = 'Por favor, insira um e-mail válido.';
                    isValid = false;
                }
                break;
            case 'senha':
                const senhaRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+={}\[\]|\\:;"'<>,.?/~`])[A-Za-z\d!@#$%^&*()_+={}\[\]|\\:;"'<>,.?/~`]{8,}$/;
                if (!senhaRegex.test(input.value)) {
                    input.classList.add('is-invalid');
                    input.classList.remove('is-valid');
                    if (feedback) feedback.textContent = 'A senha deve ter no mínimo 8 caracteres, incluindo letras maiúsculas, minúsculas, números e caracteres especiais.';
                    isValid = false;
                }
                break;
            case 'cpf':
                const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
                if (!cpfRegex.test(input.value.trim())) {
                     input.classList.add('is-invalid');
                     input.classList.remove('is-valid');
                     if (feedback) feedback.textContent = 'O CPF deve ter o formato 999.999.999-99.';
                     isValid = false;
                } else if (!validarCPF(input.value.trim())) {
                    input.classList.add('is-invalid');
                    input.classList.remove('is-valid');
                    if (feedback) feedback.textContent = 'CPF inválido.';
                    isValid = false;
                }
                break;
            case 'rg':
                const rgRegex = /^\d{1,2}\.\d{3}\.\d{3}-[\dX]$/;
                if (input.value.trim() !== '' && !rgRegex.test(input.value.trim())) {
                    input.classList.add('is-invalid');
                    input.classList.remove('is-valid');
                    if (feedback) feedback.textContent = 'O RG deve ter o formato 99.999.999-9 ou 99.999.999-X.';
                    isValid = false;
                }
                break;
            case 'telefone':
                const telefoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
                if (!telefoneRegex.test(input.value.trim())) {
                    input.classList.add('is-invalid');
                    input.classList.remove('is-valid');
                    if (feedback) feedback.textContent = 'O telefone deve ter o formato (99) 99999-9999 ou (99) 9999-9999.';
                    isValid = false;
                }
                break;
            case 'dataNascimento':
                const dataNascValue = new Date(input.value);
                const hoje = new Date();
                if (isNaN(dataNascValue) || dataNascValue > hoje) {
                    input.classList.add('is-invalid');
                    input.classList.remove('is-valid');
                    if (feedback) feedback.textContent = 'Por favor, insira uma data de nascimento válida no passado.';
                    isValid = false;
                }
                break;
        }
        if (isValid) {
            input.classList.remove('is-invalid');
            input.classList.add('is-valid');
        }
    }
    return isValid;
}


// --- Lógica Específica da Página Inicial (index.html) ---
document.addEventListener('DOMContentLoaded', function() {
 
});