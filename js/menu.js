const menu = document.getElementById("menu-btn");
const nav = document.getElementById("nav-btn");

menu.addEventListener('click', () => {
    nav.classList.toggle('active');
    menu.classList.toggle('open');
})