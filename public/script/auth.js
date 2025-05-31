export function handleShowPassword(element, inputId) {
    const showing = document.getElementById(inputId).type == 'text'
    if (showing) {
        element.innerHTML = '<i class="fa-solid fa-eye"></i>'
        document.getElementById(inputId).type = 'password'
    }
    else {
        element.innerHTML = '<i class="fa-solid fa-eye-slash"></i>'
        document.getElementById(inputId).type = 'text'
    }
}