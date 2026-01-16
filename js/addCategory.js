const API = "https://memotoriapi.onrender.com";

document.addEventListener('DOMContentLoaded', () => {

    const addCardBtn = document.getElementById('addCardBtn');
    const saveBtn = document.getElementById('saveBtn');
    const cardsPreview = document.getElementById('cardsPreview');

    const user = JSON.parse(localStorage.getItem('user'));


    const conceptInput = document.getElementById('cardConcept');
    const definitionInput = document.getElementById('cardDefinition');
    const extraInput = document.getElementById('cardExtra');

    const categoryFields = document.getElementById('categoryFields');
    const categoryTitle = document.getElementById("categoryName");
    const categoryDescription = document.getElementById("categoryDescription");
    const title = document.getElementById('formTitle');

    let cards = [];
    
    title.textContent = 'CREAR CATEGORÍA';
    saveBtn.textContent = '✓ Guardar categoría';
    

    addCardBtn.addEventListener('click', () => {

        const concepto = conceptInput.value.trim();
        const definicion = definitionInput.value.trim();
        const definicionExtra = extraInput.value.trim();

        if (!concepto || !definicion) {
            alert('Concepto y definición son obligatorios');
            return;
        }

        cards.push({ concepto: concepto, definicion: definicion, definicionExtra: definicionExtra });
        renderPreview();

        conceptInput.value = '';
        definitionInput.value = '';
        extraInput.value = '';
    });

    function renderPreview() {
        cardsPreview.innerHTML = '';

        cards.forEach((card, index) => {

            const wrapper = document.createElement('div');
            wrapper.className = 'flip-container';

            wrapper.innerHTML = `
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

            const idCategory = categoria.id;

            await saveCards(cards, idCategory);

            window.location.href = 'dashboard.html';

        } catch (error) {
            console.error(error);
            alert("Error al guardar");
        }
    });



    async function saveCards(cards, idCat) {

        for (const card of cards) {
            await saveCard({
                concepto: card.concepto,
                definicion: card.definicion,
                definicionExtra: card.definicionExtra,
                imagen: "miau"
            }, idCat);
        }
    }

    async function saveCard(card, idCat) {

        let userId = user.id;

        try{
            let response = await fetch(`${API}/cards/${idCat}/${userId}`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(card)
                });

            return await response.json();
        }catch(error){
            console.log(error);
        }
        
    }

    async function saveCategory(category) {

        let userId = user.id;


        try{
            let response = await fetch(`${API}/decks/${userId}`, {
                method: "POST",
                headers: {
                        "Content-Type": "application/json"
                    },
                body: JSON.stringify(category)
            });


            if (!response.ok) {
                throw new Error("Error al guardar categoría");
            }

            return await response.json();

        }catch(error){
            console.log(error);
        }

    }

});
