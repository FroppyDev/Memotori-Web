const API = "https://memotoriapi.onrender.com";

document.addEventListener('DOMContentLoaded', () => {

    const selectedIndex = JSON.parse(localStorage.getItem('selectedCategory'));
    const user = JSON.parse(localStorage.getItem('user'));

    if (!selectedIndex || !user) {
        window.location.href = 'dashboard.html';
        return;
    }

    const dialog = document.getElementById("cardsDialog");
    const closeDialogBtn = document.getElementById("closeDialogBtn");
    const addCardBtn = document.getElementById("addCardDialogBtn");

    const conceptInput = document.getElementById("conceptInput");
    const definitionInput = document.getElementById("definitionInput");
    const extraInput = document.getElementById("extraInput");
    const preview = document.getElementById("dialogCardsPreview");

    const btnMemorizar = document.getElementById("btn-memorizar");
    const btnOpcionMultiple = document.getElementById("btn-opcion-multiple");
    const btnVerdaderoFalso = document.getElementById("btn-verdadero-falso");
    const btnTestAbierto = document.getElementById("btn-test-abierto");
    const btnMixed = document.getElementById("btn-mixed");

    const title = document.getElementById('categoryTitle');
    const description = document.getElementById('categoryDescription');
    const zone = document.getElementById('cardsZone');

    title.textContent = selectedIndex.nombre;
    description.textContent = selectedIndex.descripcion;

    let tempCards = [];


    async function getCards() {
        try {
            const res = await fetch(`${API}/cards/deck/${selectedIndex.id}/${user.id}`);
            if (!res.ok) throw new Error("HTTP " + res.status);
            return await res.json();
        } catch (err) {
            console.error(err);
            return [];
        }
    }

    async function saveCard(card) {
        try {
            await fetch(`${API}/cards/${selectedIndex.id}/${user.id}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(card)
            });
        } catch (err) {
            console.error("Error al guardar tarjeta", err);
        }
    }

    async function renderCards() {
        const cards = await getCards();
        const newHash = hashCards(cards);

        if (newHash === lastCardsHash) return; 
        lastCardsHash = newHash;

        zone.innerHTML = '';

        cards.forEach(card => {
            const container = document.createElement('div');
            container.className = 'flip-container';

            container.innerHTML = `
                <div class="flip-card">
                    <div class="card-face card-front">
                        <span>${card.concepto}</span>
                        <div class="divider"></div>
                    </div>

                    <div class="card-face card-back">
                        <span>${card.definicion}</span>
                        <div class="divider"></div>
                        <div class="img-container back-info">
                            <span class="card-small">${card.definicionExtra || ''}</span>
                        </div>
                    </div>
                </div>
            `;

            container.addEventListener('click', () => {
                container.querySelector('.flip-card').classList.toggle('flipped');
            });

            zone.appendChild(container);
        });

        const addBtn = document.createElement('button');
        addBtn.className = 'add-card-btn';
        addBtn.textContent = '+ Añadir tarjeta';
        addBtn.onclick = () => {
            tempCards = [];
            dialog.showModal();
        };

        zone.appendChild(addBtn);
    }


    closeDialogBtn.addEventListener("click", () => {
        tempCards = [];
        dialog.close();
    });

    addCardBtn.addEventListener("click", () => {
        if (!conceptInput.value || !definitionInput.value) return;

        const card = {
            concepto: conceptInput.value,
            definicion: definitionInput.value,
            definicionExtra: extraInput.value,
            imagen: ""
        };

        tempCards.push(card);
        saveCard(card);

        conceptInput.value = "";
        definitionInput.value = "";
        extraInput.value = "";

        renderDialogCards();
    });

    function renderDialogCards() {
        preview.innerHTML = "";

        tempCards.forEach((card, index) => {
            const div = document.createElement("div");
            div.className = "dialog-card";

            div.innerHTML = `
                <button>×</button>
                <strong>${card.concepto}</strong>
                <p>${card.definicion}</p>
                <small>${card.definicionExtra || ""}</small>
            `;

            div.querySelector("button").onclick = () => {
                tempCards.splice(index, 1);
                renderDialogCards();
            };

            preview.appendChild(div);
        });
    }

    function goToGame(mode) {
        localStorage.setItem('selectedCategory', JSON.stringify(selectedIndex));
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("mode", mode);
        window.location.href = 'juegos.html';
    }

    btnMemorizar.onclick = () => goToGame("MEMORIZAR");
    btnOpcionMultiple.onclick = () => goToGame("MULTIPLE_CHOICE");
    btnTestAbierto.onclick = () => goToGame("QUIZZ");
    btnVerdaderoFalso.onclick = () => goToGame("TRUE_OR_FALSE");
    btnMixed.onclick = () => goToGame("MIXED");

    let lastCardsHash = '';


    function hashCards(cards) {
        return JSON.stringify(cards.map(c => ({
            id: c.id,
            concepto: c.concepto,
            definicion: c.definicion,
            definicionExtra: c.definicionExtra,
            imagen: c.imagen
        })));
    }


    renderCards();
    setInterval(renderCards, 3000);
    
});
