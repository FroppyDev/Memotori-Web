const API = "https://memotoriapi.onrender.com";

document.addEventListener('DOMContentLoaded', () => {

    const selectedIndex = JSON.parse(localStorage.getItem('selectedCategory'));
    const user = JSON.parse(localStorage.getItem('user'));
    let mode = localStorage.getItem("mode");
    localStorage.setItem("gameMode", mode);
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
    const progressDiv = document.querySelector(".progress");

    function updateProgress() {
        if (!cards || cards.length === 0) return;
        progressDiv.textContent = `${currentIndex + 1} / ${cards.length}`;
    }

    function renderMultipleChoice(card) {

        const container = document.getElementById("game-mode");
        const correctAnswer = card.concepto;

        const pool = cards.map(c => c.concepto).filter(c => c !== correctAnswer);
        pool.sort(() => Math.random() - 0.5);

        const wrongAnswers = pool.slice(0, 3);
        while (wrongAnswers.length < 3) wrongAnswers.push(correctAnswer);

        const allAnswers = [...wrongAnswers, correctAnswer].sort(() => Math.random() - 0.5);

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
                results.total++;

                if (btn.dataset.answer === correctAnswer) {
                    btn.style.backgroundColor = "#22c55e";
                    results.correct++;
                } else {
                    btn.style.backgroundColor = "#ef4444";
                    results.incorrect++;
                    results.incorrectCards.push(card);
                    optionButtons.forEach(b => {
                        if (b.dataset.answer === correctAnswer) {
                            b.style.backgroundColor = "#22c55e";
                        }
                    });
                }

                optionButtons.forEach(b => b.disabled = true);
                setTimeout(() => nextCard(), 700);
            });
        });

        updateProgress();
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

        const flipCard = document.querySelector(".memorizar-flip");
        flipCard.addEventListener("click", () => flipCard.classList.toggle("flipped"));

        document.getElementById("btnConocido").addEventListener("click", () => {
            results.total++;
            results.correct++;
            nextCard();
        });

        document.getElementById("btnDesconocido").addEventListener("click", () => {
            results.total++;
            results.incorrect++;
            results.incorrectCards.push(card);
            nextCard();
        });

        updateProgress();
    }

    function renderTrueOrFalse(card) {

        const isTrue = Math.random() > 0.5;
        const response = isTrue
            ? card.definicion
            : cards[Math.floor(Math.random() * cards.length)].definicion;

        const container = document.getElementById("game-mode");

        container.innerHTML = `
            <div class="mode-tor">
                <div class="tor-contenedor">
                    <div class="tor">
                        <div class="sides-contenedor">
                            <div class="side left">
                                <label class="subtitulo">Termino</label>
                                <p class="texto-tarjeta">${card.concepto}</p>
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

        document.getElementById("btnVerdadero").addEventListener("click", () => {
            results.total++;
            if (isTrue) results.correct++;
            else {
                results.incorrect++;
                results.incorrectCards.push(card);
            }
            nextCard();
        });

        document.getElementById("btnFalso").addEventListener("click", () => {
            results.total++;
            if (!isTrue) results.correct++;
            else {
                results.incorrect++;
                results.incorrectCards.push(card);
            }
            nextCard();
        });

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
                    </div>
                </div>
                <div class="answer-question">${card.definicion}</div>
                <div class="answer-input-section">
                    <label>Tu respuesta</label>
                    <input type="text" id="quizzInput" placeholder="Escribe la respuesta aqui"/>
                </div>
                <div class="answer-footer">
                    <button class="next-btn" id="btnNext">Siguiente</button>
                </div>
            </div>
        </div>
        `;

        document.getElementById("btnNext").addEventListener("click", () => {
            const userAnswer = document.getElementById("quizzInput").value.trim();

            results.total++;
            if (userAnswer.toLowerCase() === card.concepto.toLowerCase()) {
                results.correct++;
            } else {
                results.incorrect++;
                results.incorrectCards.push(card);
            }

            nextCard();
        });

        updateProgress();
    }

    function nextCard() {
        if (currentIndex < cards.length - 1) {
            currentIndex++;
            gameMode(mode);
        } else {
            localStorage.setItem("gameResults", JSON.stringify(results));
            window.location.href = "resultados.html";
        }
    }

    function mixed() {
        const modes = ["MEMORIZAR", "MULTIPLE_CHOICE", "QUIZZ", "TRUE_OR_FALSE"];
        gameMode(modes[Math.floor(Math.random() * modes.length)]);
    }

    function gameMode(currentMode) {
        if (!cards.length) return;

        switch (currentMode) {
            case "MEMORIZAR": renderMemorizar(cards[currentIndex]); break;
            case "MULTIPLE_CHOICE": renderMultipleChoice(cards[currentIndex]); break;
            case "QUIZZ": renderQuizzAbierto(cards[currentIndex]); break;
            case "TRUE_OR_FALSE": renderTrueOrFalse(cards[currentIndex]); break;
            case "MIXED": mixed(); break;
        }
    }

    async function getCards() {
        const res = await fetch(`${API}/cards/deck/${selectedIndex.id}/${user.id}`);
        return res.json();
    }

    async function loadGame() {
        cards = await getCards();
        if (!cards || cards.length === 0) return alert("No hay tarjetas");
        currentIndex = 0;
        updateProgress();
        gameMode(mode);
    }

    loadGame();
});
