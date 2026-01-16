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


    const imageInput = document.getElementById("image-input");
    const preview = document.getElementById("image-preview");
    const previewImg = document.getElementById("preview-img");
    const btnRemoveImage = document.getElementById("btn-remove-image");

    let imageDeleted = false;

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

        let imageUrl = categoria.imagen;

        if (imageInput.files && imageInput.files[0]) {
            imageUrl = await subirImagen(imageInput.files[0]);
        }

        if (imageDeleted) {
            imageUrl = null;
        }

        try{
            const response = await fetch(`${API}/decks/${categoria.id}`, {
                method: "PUT",
                headers: {
                        "Content-Type": "application/json"
                    },
                body: JSON.stringify({
                    nombre: categoria.nombre,
                    descripcion: categoria.descripcion,
                    imagen: imageUrl,
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

            const img = document.createElement('div');
            img.className = 'folder-image';

            if (cat.imagen) {
                img.style.backgroundImage = `url(${cat.imagen})`;
                img.style.backgroundSize = 'cover';
                img.style.backgroundPosition = 'center';
            } else {
                img.style.backgroundColor = "#E72D72";
            }

            card.insertBefore(img, card.querySelector('h2'));

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
        if (selectedCategory.imagen) {
            previewImg.src = selectedCategory.imagen;   // 👈 DIRECTO
            preview.style.display = "flex";
            imageDeleted = false;
        } else {
            previewImg.src = "";
            preview.style.display = "none";
            imageDeleted = false;
        }


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

    imageInput.addEventListener("change", () => {
        const file = imageInput.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            previewImg.src = reader.result;
            preview.style.display = "flex";
            imageDeleted = false;
        };
        reader.readAsDataURL(file);
    });

    btnRemoveImage.addEventListener("click", () => {
        imageInput.value = "";
        previewImg.src = "";
        preview.style.display = "none";
        imageDeleted = true;
    });


    let lastSnapshot = "";

    async function subirImagen(file) {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch(`${API}/upload-image/`, {
            method: "POST",
            body: formData
        });

        if (!res.ok) {
            throw new Error("Error al subir imagen");
        }

        const data = await res.json();
        return data.url; // 👈 URL FINAL
    }

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
