const API = "https://memotoriapi.onrender.com";

document.addEventListener('DOMContentLoaded', () => {
    const selectedCategory = JSON.parse(localStorage.getItem('selectedCategory'));
    const user = JSON.parse(localStorage.getItem('user'));

    if (!selectedCategory || !user) {
        window.location.href = 'dashboard.html';
        return;
    }

    const dialog = document.getElementById("cardsDialog");
    const closeDialogBtn = document.getElementById("closeDialogBtn");
    const addCardBtn = document.getElementById("addCardDialogBtn");
    const conceptInput = document.getElementById("conceptInput");
    const definitionInput = document.getElementById("definitionInput");
    const extraInput = document.getElementById("extraInput");
    const zone = document.getElementById('cardsZone');

    const conceptoInput = document.getElementById("concepto-input");
    const definitionCardInput = document.getElementById("definitionCard-input");
    const definitionExtraInput = document.getElementById("definitionExtra-input");
    const btnCancelar = document.getElementById("btnCard_cancelar");
    const btnModificar = document.getElementById("btnCard_modificar");
    const dialogCard = document.getElementById("card-modifier");
    const btnDelete = document.getElementById("btnCard_delete");


    const imageInput = document.getElementById("image-input");
    const preview = document.getElementById("image-preview");
    const previewImg = document.getElementById("preview-img");
    const btnRemoveImage = document.getElementById("btn-remove-image");

    let imageDeleted = false;

    const btnMemorizar = document.getElementById("btn-memorizar");
    const btnOpcionMultiple = document.getElementById("btn-opcion-multiple");
    const btnVerdaderoFalso = document.getElementById("btn-verdadero-falso");
    const btnTestAbierto = document.getElementById("btn-test-abierto");
    const btnMixed = document.getElementById("btn-mixed");

    const title = document.getElementById('categoryTitle');
    const description = document.getElementById('categoryDescription');
    let currentCard;

    title.textContent = selectedCategory.nombre;
    description.textContent = selectedCategory.descripcion;

    let tempCards = [];
    let savedCards = [];

    async function getCards() {
        try {
            const res = await fetch(`${API}/cards/deck/test/${selectedCategory.id}/${user.id}`);
            if (!res.ok) throw new Error("HTTP " + res.status);
            return await res.json();
        } catch (err) {
            console.error(err);
            return [];
        }
    }

    async function saveCard(card) {
        try {
            const res = await fetch(`${API}/cards/${selectedCategory.id}/${user.id}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(card)
            });
            if (!res.ok) throw new Error("Error al guardar");
            return await res.json();
        } catch (err) {
            console.error("Error al guardar tarjeta", err);
            return null;
        }
    }

    async function renderCards() {
        savedCards = await getCards();
        zone.innerHTML = '';

        savedCards.forEach(card => {
            zone.appendChild(createCardElement(card, true));
        });

        tempCards.forEach((card, index) => {
            zone.appendChild(createCardElement(card, false, index));
        });

        const addBtn = document.createElement('button');
        addBtn.className = 'add-card-btn';
        addBtn.textContent = '+ Añadir tarjeta';
        addBtn.onclick = () => dialog.showModal();
        zone.appendChild(addBtn);
    }

    function createCardElement(card, isSaved, tempIndex) {
    const container = document.createElement('div');
    container.className = 'flip-container';

    const imageHTML = card.imagen
        ? `<div class="img-container">
               <img src="${card.imagen}" class="real-img" />
           </div>`
        : `<div class="img-container">
               <img src="/Memotori-web/imagenes/photo.png" class="default-img" />
           </div>`;

    container.innerHTML = `
            <div class="flip-card">
                <button class="delete-card">+</button>

                <div class="card-face card-front">
                    ${imageHTML}
                    <span>${card.concepto}</span>
                </div>

                <div class="card-face card-back">
                    <span>${card.definicion}</span>
                    <span class="card-small">${card.definicionExtra || ''}</span>
                </div>
            </div>
        `;

        container.addEventListener('click', () => {
            container.querySelector('.flip-card').classList.toggle('flipped');
        });

        container.querySelector('.delete-card').addEventListener('click', async e => {
            e.stopPropagation(); 

            conceptoInput.value = card.concepto || "";
            definitionCardInput.value = card.definicion || "";
            definitionExtraInput.value = card.definicionExtra || "";
            if (card.imagen) {
                previewImg.src = card.imagen;   
                preview.style.display = "flex";
                imageDeleted = false;
            } else {
                previewImg.src = "";
                preview.style.display = "none";
                imageDeleted = false;
            }

            currentCard = card;
            dialogCard.showModal();
        });


        return container;
    }

    closeDialogBtn.addEventListener("click", () => {
        tempCards = [];
        dialog.close();
    });

    btnDelete.addEventListener("click", async () => {
        if (!currentCard) return;

        const confirmDelete = confirm("¿Eliminar esta tarjeta? Esta acción no se puede deshacer.");
        if (!confirmDelete) return;

        const ok = await deleteCard(currentCard);

        if (ok) {
            dialogCard.close();
            currentCard = null;
            renderCards();
        }
    });

    addCardBtn.addEventListener("click", async () => {
        if (!conceptInput.value || !definitionInput.value) return;

        const card = {
            concepto: conceptInput.value,
            definicion: definitionInput.value,
            definicionExtra: extraInput.value,
            imagen: ""
        };

        tempCards.push(card);
        const saved = await saveCard(card);
        if (saved && saved.id) {
            savedCards.push(saved);
            tempCards = tempCards.filter(c => c !== card);
        }

        conceptInput.value = "";
        definitionInput.value = "";
        extraInput.value = "";

        renderCards();
    });

    btnCancelar.addEventListener("click", () => {
        dialogCard.close();
    });

    btnModificar.addEventListener("click", async () => {
        if (!currentCard) return;

        await modificarTarjeta(currentCard);
        dialogCard.close();
        renderCards();

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

    async function deleteCard(card) {
        try {
            console.log("Deleting card:", card);
            const res = await fetch(
                `${API}/cards/deck/${selectedCategory.id}/${card.id}`,
                {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" }
                }
            );

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text);
            }

            return await res.json();
        } catch (error) {
            console.error("Error al modificar la tarjeta:", error);
        }
    }

    async function modificarTarjeta(card) {

        let imageUrl = card.imagen;


        if (imageInput.files && imageInput.files[0]) {
            imageUrl = await subirImagen(imageInput.files[0]);
        }

        if (imageDeleted) {
            imageUrl = null;
        }

        try {
            const res = await fetch(
                `${API}/cards/${card.id}`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        concepto: conceptoInput.value,
                        definicion: definitionCardInput.value,
                        definicionExtra: definitionExtraInput.value,
                        imagen: imageUrl
                    })
                }
            );

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text);
            }

            return await res.json();
        } catch (error) {
            console.error("Error al modificar la tarjeta:", error);
        }
    }


    function goToGame(mode) {
        localStorage.setItem('selectedCategory', JSON.stringify(selectedCategory));
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("mode", mode);
        window.location.href = 'juegos.html';
    }

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


    btnMemorizar.onclick = () => goToGame("MEMORIZAR");
    btnOpcionMultiple.onclick = () => goToGame("MULTIPLE_CHOICE");
    btnTestAbierto.onclick = () => goToGame("QUIZZ");
    btnVerdaderoFalso.onclick = () => goToGame("TRUE_OR_FALSE");
    btnMixed.onclick = () => goToGame("MIXED");

    renderCards();
});
