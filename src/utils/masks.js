export const maskTelefone = (value) => {
    if (!value) return "";
    value = value.replace(/\D/g, ""); // Remove tudo que não é dígito
    value = value.replace(/^(\d{2})(\d)/g, "($1) $2"); // Coloca parênteses em volta dos dois primeiros dígitos
    value = value.replace(/(\d)(\d{4})$/, "$1-$2"); // Coloca hífen entre o quarto e o quinto dígitos
    return value.substring(0, 15); // Limita o tamanho (11 dígitos + máscara)
};

export const unmaskTelefone = (value) => {
    return value.replace(/\D/g, "");
};
