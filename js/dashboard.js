const API = "https://memotoriapi.onrender.com";

document.addEventListener('DOMContentLoaded', () => {

    const user = JSON.parse(localStorage.getItem('user'));

    if (!user) {
        window.location.href = 'index.html';
        return;
    }

    document.getElementById('welcome').textContent = `Hola, ${user.email}`;

    const userMenu = document.querySelector('.user-menu');
    const dropdown = document.querySelector('.dropdown-menu');

    const dashboard = document.getElementById('dashboard');
    const addBtn = document.getElementById('addCategoryBtn');

    const modifierModal = document.getElementById("category-modifier");
    const modifierBtn = document.getElementById("btn_modificar");
    const cancelBtn = document.getElementById("btn_cancelar");
    const inputTitulo = document.getElementById("title-input");
    const inputDescripcion = document.getElementById("description-input");

    const modal = document.getElementById('categoryModal');
    const closeBtn = document.getElementById('closeModalBtn');
    const editBtn = document.getElementById('editCategoryBtn');
    const deleteBtn = document.getElementById('deleteCategoryBtn');

    let selectedCategory = null;

    async function deleteCategory(categoria) {
        try{

            const response = await fetch(`${API}/decks/${categoria.userId}/${categoria.id}`,{
                method: "DELETE",
                headers: {
                    "Content-Type":"application/json"
                },
                body: categoria.id
            });

            if(!response.ok){
                throw new Error("Error HTTP " + response.status);
            }

            return await response.json();


        }catch(error){
            console.error("error al eliminar categoria", error);
        }
    }

    async function modificarCategoria(categoria) {
        try{
            const response = await fetch(`${API}/decks/${categoria.id}`, {
                method: "PUT",
                headers: {
                        "Content-Type": "application/json"
                    },
                body: JSON.stringify({
                    nombre: categoria.nombre,
                    descripcion: categoria.descripcion,
                    imagen: categoria.imagen,
                    color: categoria.color,
                    smart: categoria.smart,
                    latitud: categoria.latitud,
                    longitud: categoria.longitud,
                    radioMetros: categoria.radioMetros
                })
            });

            if(!response.ok){
                throw new Error("Error HTTP " + response.status);
            }

            return await response.json();

        }catch(error){
            console.error("Error al modificar", error)
        }
    }

    async function fetchCategories() {
        try {
            const response = await fetch(`${API}/decks/user/${user.id}`);

            if (!response.ok) {
                throw new Error("Error HTTP " + response.status);
            }

            return await response.json();
        } catch (error) {
            console.error("Error al cargar categorías", error);
            return [];
        }
    }

    async function renderCategories() {
        const categories = await fetchCategories();
        dashboard.innerHTML = '';

        if (!Array.isArray(categories) || categories.length === 0) {
            dashboard.innerHTML = '<p style="opacity:.5">No hay categorías</p>';
            return;
        }

        categories.forEach(cat => {

            const card = document.createElement('div');
            card.className = 'folder-card';

            card.innerHTML = `
                <span class="folder-menu">
                    <i class="fas fa-ellipsis-v"></i>
                </span>
                <h2>${cat.nombre}</h2>
            `;

            card.addEventListener('click', () => {
                localStorage.setItem('selectedCategory', JSON.stringify(cat));
                localStorage.setItem("user", JSON.stringify(user));
                window.location.href = `desktop.html`;

            });

            card.querySelector('.folder-menu').addEventListener('click', (e) => {
                e.stopPropagation();
                selectedCategory = cat;
                modal.style.display = 'flex';
            });

            dashboard.appendChild(card);
        });
    }

    editBtn.addEventListener("click", () => {
        if (!selectedCategory) return;

        inputTitulo.value = selectedCategory.nombre || "";
        inputDescripcion.value = selectedCategory.descripcion || "";

        modifierModal.showModal();
    });


    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
        selectedCategory = null;
    });

    cancelBtn.addEventListener("click", () => {
        modifierModal.close();
    });

    modifierBtn.addEventListener("click", async () => {

        const response = await modificarCategoria({
            ...selectedCategory,
            nombre: inputTitulo.value,
            descripcion: inputDescripcion.value
        });

        modifierModal.close();

        renderCategories();
    });

    addBtn.addEventListener('click', () => {
        localStorage.setItem("user", JSON.stringify(user));
        window.location.href = 'crear-carpeta.html';
    });

    deleteBtn.addEventListener("click", async () =>{
        const response = await deleteCategory(selectedCategory);
        modifierModal.close();
        renderCategories();

    });

    userMenu.addEventListener('click', (e) => {
        e.stopPropagation(); 
        dropdown.classList.toggle('active');
    });

    document.addEventListener('click', () => {
        dropdown.classList.remove('active');
    });

    let lastSnapshot = "";

    async function autoSync() {
        const categories = await fetchCategories();
        const snapshot = JSON.stringify(categories);

        if (snapshot !== lastSnapshot) {
            lastSnapshot = snapshot;
            renderCategories();
        }
    }

    renderCategories();
    setInterval(autoSync, 3000);

});

// 🚪 Logout
function logout() {
    localStorage.clear();
    window.location.href = 'index.html';
}
