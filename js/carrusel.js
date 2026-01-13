const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const carruselWrapper = document.querySelector('.carrusel-items-wrapper');

function rotateNext() {
    const first = carruselWrapper.firstElementChild;
    carruselWrapper.appendChild(first); // mueve el primero al final
}

function rotatePrev() {
    const last = carruselWrapper.lastElementChild;
    carruselWrapper.prepend(last); // mueve el último al inicio
}

nextBtn.addEventListener('click', rotateNext);
prevBtn.addEventListener('click', rotatePrev);
