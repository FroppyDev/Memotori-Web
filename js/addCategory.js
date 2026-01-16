const API = "https://memotoriapi.onrender.com";

document.addEventListener('DOMContentLoaded', () => {

    const addCardBtn = document.getElementById('addCardBtn');
    const saveBtn = document.getElementById('saveBtn');
    const cardsPreview = document.getElementById('cardsPreview');

    const user = JSON.parse(localStorage.getItem('user'));

    const conceptInput = document.getElementById('cardConcept');
    const definitionInput = document.getElementById('cardDefinition');
    const extraInput = document.getElementById('cardExtra');
    const imageInput = document.getElementById('cardImage'); // 👈 NUEVO

    const categoryTitle = document.getElementById("categoryName");
    const categoryDescription = document.getElementById("categoryDescription");
    const title = document.getElementById('formTitle');

    let cards = [];

    title.textContent = 'CREAR CATEGORÍA';
    saveBtn.textContent = '✓ Guardar categoría';

    // ===============================
    // AGREGAR TARJETA
    // ===============================
    addCardBtn.addEventListener('click', () => {

        const concepto = conceptInput.value.trim();
        const definicion = definitionInput.value.trim();
        const definicionExtra = extraInput.value.trim();
        const imagen = imageInput.value.trim(); // 👈 NUEVO

        if (!concepto || !definicion) {
            alert('Concepto y definición son obligatorios');
            return;
        }

        cards.push({
            concepto,
            definicion,
            definicionExtra,
            imagen // 👈 SE GUARDA
        });

        renderPreview();

        conceptInput.value = '';
        definitionInput.value = '';
        extraInput.value = '';
        imageInput.value = '';
    });

    // ===============================
    // PREVIEW TARJETAS
    // ===============================
    function renderPreview() {
        cardsPreview.innerHTML = '';

        cards.forEach((card, index) => {

            const wrapper = document.createElement('div');
            wrapper.className = 'flip-container';

            wrapper.innerHTML = `
                <div class="flip-card">
                    <button class="delete-card">✖</button>

                    <div class="card-face card-front">
                        ${card.imagen ? `<img src="${card.imagen}" class="card-img">` : ''}
                        <span>${card.concepto}</span>
                    </div>

                    <div class="card-face card-back">
                        <span>${card.definicion}</span>
                        <span class="card-small">${card.definicionExtra || ''}</span>
                    </div>
                </div>
            `;

            wrapper.addEventListener('click', () => {
                wrapper.querySelector('.flip-card').classList.toggle('flipped');
            });

            wrapper.querySelector('.delete-card').addEventListener('click', (e) => {
                e.stopPropagation();
                cards.splice(index, 1);
                renderPreview();
            });

            cardsPreview.appendChild(wrapper);
        });
    }

    // ===============================
    // GUARDAR TODO
    // ===============================
    saveBtn.addEventListener('click', async () => {

        if (cards.length === 0) {
            alert('Agrega al menos una tarjeta');
            return;
        }

        if (!categoryTitle.value.trim()) {
            alert("La categoría debe tener título");
            return;
        }

        try {
            const categoria = await saveCategory({
                nombre: categoryTitle.value.trim(),
                descripcion: categoryDescription.value.trim()
            });

            await saveCards(cards, categoria.id);
            window.location.href = 'dashboard.html';

        } catch (error) {
            console.error(error);
            alert("Error al guardar");
        }
    });

    // ===============================
    // GUARDAR TARJETAS
    // ===============================
    async function saveCards(cards, idCat) {
        for (const card of cards) {
            await saveCard({
                concepto: card.concepto,
                definicion: card.definicion,
                definicionExtra: card.definicionExtra,
                imagen: card.imagen || null // 👈 IMPORTANTE
            }, idCat);
        }
    }

    async function saveCard(card, idCat) {
        try {
            const response = await fetch(`${API}/cards/${idCat}/${user.id}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(card)
            });
            return await response.json();
        } catch (error) {
            console.error(error);
        }
    }

    // ===============================
    // GUARDAR CATEGORÍA
    // ===============================
    async function saveCategory(category) {
        try {
            const response = await fetch(`${API}/decks/${user.id}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(category)
            });

            if (!response.ok) throw new Error("Error al guardar categoría");
            return await response.json();

        } catch (error) {
            console.error(error);
        }
    }

});
