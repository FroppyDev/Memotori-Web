const API = "https://memotoriapi.onrender.com";


document.addEventListener('DOMContentLoaded', () => {

    const selectedIndex = JSON.parse(localStorage.getItem('selectedCategory'));
    const user = JSON.parse(localStorage.getItem('user'));
    let mode = localStorage.getItem("mode");
    let cards = [];

    let currentIndex = 0;

    let results = {
    total: 0,
    correct: 0,
    incorrect: 0,
    incorrectCards: []
    };
    
    const userBtn = document.getElementById("userBtn");
    const userDropdown = document.getElementById("userDropdown");
    const cardMemorizar = document.getElementById("memorizar-content");
    const progressDiv = document.querySelector(".progress");

    /* ======================= PROGRESO DINÁMICO ======================= */
    function updateProgress() {
        if (!cards || cards.length === 0) return;
        progressDiv.textContent = `${currentIndex + 1} / ${cards.length}`;
    }


    function renderMultipleChoice(card) {

        const container = document.getElementById("game-mode");

        const correctAnswer = card.concepto;

        // Pool de respuestas únicas (sin repetir la correcta)
        const pool = cards
            .map(c => c.concepto)
            .filter(c => c !== correctAnswer);

        // Mezclar pool
        pool.sort(() => Math.random() - 0.5);

        // Tomar hasta 3 incorrectas
        const wrongAnswers = pool.slice(0, 3);

        // Rellenar si hay pocas cards
        while (wrongAnswers.length < 3) {
            wrongAnswers.push(correctAnswer);
        }

        // Mezclar con la correcta
        const allAnswers = [...wrongAnswers, correctAnswer]
            .sort(() => Math.random() - 0.5);

        // Render SIN cambiar estructura
        container.innerHTML = `
            <div class="mode multiple-choice">

                <div class="game-content">
                    <div class="card question-card">
                        <p>${card.definicion}</p>
                    </div>

                    <div class="options">
                        <div class="options column first">
                            <button class="card option-card"></button>
                            <button class="card option-card"></button>
                        </div>
                        <div class="options column second">
                            <button class="card option-card"></button>
                            <button class="card option-card"></button>
                        </div>
                    </div>
                </div>

            </div>
        `;

        const optionButtons = document.querySelectorAll(".option-card");

        optionButtons.forEach((btn, index) => {
            btn.textContent = allAnswers[index];
            btn.dataset.answer = allAnswers[index];
            btn.disabled = false;
            btn.style.backgroundColor = "";
        });

        optionButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const selected = btn.dataset.answer;
            results.total++;
            if (selected === correctAnswer) {
                btn.style.backgroundColor = "#22c55e";
                results.correct++;
            } else {
                btn.style.backgroundColor = "#ef4444";
                results.incorrect++;
                results.incorrectCards.push(card);
                optionButtons.forEach(b => {
                    if (b.dataset.answer === correctAnswer) b.style.backgroundColor = "#22c55e";
                });
            }
            optionButtons.forEach(b => b.disabled = true);
            setTimeout(() => nextCard(), 700);
        });
    });
    }



    function renderMemorizar(card) {
        
        const container = document.getElementById("game-mode");

        container.innerHTML = `
        <div class="contMemo">
            <div class="mode memorizar">

            <div class="memorizar-content">

                <div class="memorizar-flip">
                <div class="memorizar-card face">
                    <p>${card.concepto}</p>
                </div>

                <div class="memorizar-card back">
                    <div class="pista">
                        <label>Definicion extra</label>
                    </div>
                    <p>${card.definicion}</p>
                </div>
                </div>

                <div class="memorizar-options">
                    <button class="memorizar-option" id="btnDesconocido">Desconocido</button>
                    <button class="memorizar-img">Imagen</button>
                    <button class="memorizar-option" id="btnConocido">Conocido</button>
                </div>

            </div>

            </div>
            </div>`;


        const btnConocido = document.getElementById("btnConocido");
        const btnDesconocido = document.getElementById("btnDesconocido");


        const flipCard = document.querySelector(".memorizar-flip");

        flipCard.addEventListener("click", () => {
            flipCard.classList.toggle("flipped");
        });

        btnConocido.addEventListener("click", () => {
            nextCard();
        });

        btnDesconocido.addEventListener("click", () =>{
            nextCard()
        })

        updateProgress();

    }

    function getRandomArbitrary(min, max) {
        return Math.random() * (max - min) + min;
     }

    function renderTrueOrFalse(currentCard) {

        let probabilidad = getRandomArbitrary(0, 2);
        let response;
        
        if(probabilidad == 1){
            response = currentCard.definicion
        } else {
            response = cards[Math.floor(Math.random() * cards.length)].definicion;
        }

        const container = document.getElementById("game-mode");

        container.innerHTML = `
            <div class="mode-tor">

                <div class="tor-contenedor">

                    <div class="tor">

                    <div class="sides-contenedor">
                        <div class="side left">
                        <label class="subtitulo">Termino</label>
                        <p class="texto-tarjeta">${currentCard.concepto}</p>
                        </div>
                        <div class="divisor"></div>
                        <div class="side right">
                        <label class="subtitulo">Definicion</label>
                        <p class="texto-tarjeta">${response}</p>
                        </div>
                    </div>
                    <label class="subtitulo selecciona">Selecciona la respuesta</label>
                    <div class="contenedor-respuestas">
                        <button class="respuestas" id="btnVerdadero">Verdadero</button>
                        <button class="respuestas" id="btnFalso">Falso</button>
                    </div>

                    </div>

                </div>

            </div>
        `;

        const btnVerdadero = document.getElementById("btnVerdadero");
        const btnFalso = document.getElementById("btnFalso");

        btnFalso.addEventListener("click", () => {
            nextCard();
        });

        btnVerdadero.addEventListener("click", () => {
            nextCard();
        })

        updateProgress();

    }

    function renderQuizzAbierto(card) {
        const container = document.getElementById("game-mode");

        container.innerHTML = `

        <div class="answer-mode">

            <div class="answer-card">

                <div class="answer-header">
                <div class="answer-title">
                    <span>Definición</span>
                    <button class="audio-btn"></button>
                </div>
                </div>

                <div class="answer-question">
                ${card.definicion}
                </div>

                <div class="answer-input-section">
                <label>Tu respuesta</label>
                <input 
                    type="text" 
                    placeholder="Escribe la respuesta aqui"
                />
                </div>

                <div class="answer-footer">
                <button class="next-btn" id="btnNext">Siguiente</button>
                </div>

            </div>

        </div>
        `;

        const btnNext = document.getElementById("btnNext");

        btnNext.addEventListener("click", () => {

            nextCard();

        })
        updateProgress();

    }

    function initListeners(){
        userBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            userDropdown.style.display =
            userDropdown.style.display === "flex" ? "none" : "flex";
        });

        document.addEventListener("click", () => {
            userDropdown.style.display = "none";
        });

    }

    async function getCards() {
        try{
            const res = await fetch(`${API}/cards/deck/${selectedIndex.id}/${user.id}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            });

            if(!res.ok){
                throw new Error("Error HTTP " + res.status);
            }

            console.log(JSON.stringify(res));

            return res.json();

        } catch(error){
            console.error("error al recuperar tarjetas", error);
        }        
    }

    function nextCard() {
        if (currentIndex < cards.length - 1) {
            currentIndex++;
            updateProgress();
            gameMode(mode);
        } else {
            alert("¡Terminaste!");
            window.location.href = 'desktop.html';
            return;
        }
    }

    function mixed(){
        const modes = ["MEMORIZAR", "MULTIPLE_CHOICE", "QUIZZ", "TRUE_OR_FALSE"];
        const randomMode = modes[Math.floor(Math.random() * modes.length)];
                
        gameMode(randomMode);
    }


    async function gameMode(gameMode){

        if (!cards || cards.length === 0) return;


        switch (gameMode){

            case "MEMORIZAR":

                renderMemorizar(cards[currentIndex]);

                break;
            case "MULTIPLE_CHOICE":

                renderMultipleChoice(cards[currentIndex]);

                break;
            case "QUIZZ":

                renderQuizzAbierto(cards[currentIndex]);

                break;
            case "TRUE_OR_FALSE":

                renderTrueOrFalse(cards[currentIndex]);

                break;
            case "MIXED":

                mixed();

                break;


                break;

        }
        
    }

    async function loadGame() {
        cards = await getCards();

        if (!cards || cards.length === 0) {
            alert("No hay tarjetas");
            return;
        }

        currentIndex = 0;
        updateProgress();
        gameMode(mode);
    }

    
    loadGame();
    initListeners();

});
