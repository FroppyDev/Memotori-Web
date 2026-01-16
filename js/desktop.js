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

    const btnMemorizar = document.getElementById("btn-memorizar");
    const btnOpcionMultiple = document.getElementById("btn-opcion-multiple");
    const btnVerdaderoFalso = document.getElementById("btn-verdadero-falso");
    const btnTestAbierto = document.getElementById("btn-test-abierto");
    const btnMixed = document.getElementById("btn-mixed");

    const title = document.getElementById('categoryTitle');
    const description = document.getElementById('categoryDescription');

    title.textContent = selectedCategory.nombre;
    description.textContent = selectedCategory.descripcion;

    let tempCards = [];
    let savedCards = [];

    async function getCards() {
        try {
            const res = await fetch(`${API}/cards/deck/${selectedCategory.id}/${user.id}`);
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

    async function deleteCardFromDB(cardId) {
        try {
            const res = await fetch(`${API}/cards/deck/${selectedCategory.id}/${cardId}`, {
                method: "DELETE"
            });

            if (!res.ok) {
                let errorText = "Error al eliminar la tarjeta";
                try {
                    const errJson = await res.json();
                    if (errJson.detail) errorText = errJson.detail;
                    else if (errJson.message) errorText = errJson.message;
                    else errorText = JSON.stringify(errJson);
                } catch {
                    errorText = await res.text();
                }
                alert(errorText);
                return false;
            }

            return true;
        } catch (err) {
            console.error(err);
            alert("Error al eliminar la tarjeta");
            return false;
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
        container.innerHTML = `
            <div class="flip-card">
                <button class="delete-card">✖</button>
                <div class="card-face card-front">
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
            if (!confirm("¿Seguro que quieres eliminar esta tarjeta?")) return;

            if (isSaved) {
                if (!card.id) {
                    alert("No se puede eliminar esta tarjeta, no tiene ID válido");
                    return;
                }
                const ok = await deleteCardFromDB(card.id);
                if (!ok) return;
                savedCards = savedCards.filter(c => c.id !== card.id);
            } else {
                tempCards.splice(tempIndex, 1);
            }

            renderCards();
        });

        return container;
    }

    closeDialogBtn.addEventListener("click", () => {
        tempCards = [];
        dialog.close();
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

    function goToGame(mode) {
        localStorage.setItem('selectedCategory', JSON.stringify(selectedCategory));
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("mode", mode);
        window.location.href = 'juegos.html';
    }

    btnMemorizar.onclick = () => goToGame("MEMORIZAR");
    btnOpcionMultiple.onclick = () => goToGame("MULTIPLE_CHOICE");
    btnTestAbierto.onclick = () => goToGame("QUIZZ");
    btnVerdaderoFalso.onclick = () => goToGame("TRUE_OR_FALSE");
    btnMixed.onclick = () => goToGame("MIXED");

    renderCards();
    setInterval(renderCards, 3000);
});
