document.addEventListener('DOMContentLoaded', () => {

  const card = document.getElementById('card');
  const btnRegistrarFace = document.getElementById('btn-registrar');
  const btnLoginFace = document.getElementById('btn-iniciar');

  btnRegistrarFace.addEventListener('click', () => {
    card.classList.add('flipped');
  });

  btnLoginFace.addEventListener('click', () => {
    card.classList.remove('flipped');
  });

});