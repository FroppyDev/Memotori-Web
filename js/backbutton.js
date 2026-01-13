document.addEventListener('DOMContentLoaded', () => {

    const backBtn = document.getElementById('backBtn');
    if (!backBtn) return;

    backBtn.addEventListener('click', () => {

        const currentPage = window.location.pathname.split('/').pop();
        const formMode = localStorage.getItem('formMode');

        // 👉 CREAR CATEGORÍA / AGREGAR TARJETAS
        if (currentPage === 'crear-carpeta.html') {

            if (formMode === 'addCards') {
                localStorage.removeItem('formMode');
                window.location.href = 'desktop.html';
            } else {
                localStorage.removeItem('formMode');
                window.location.href = 'dashboard.html';
            }

            return;
        }

        // 👉 DESKTOP
        if (currentPage === 'desktop.html') {
            window.location.href = 'dashboard.html';
            return;
        }

    });
});
