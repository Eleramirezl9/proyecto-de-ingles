let currentWord = null;

document.addEventListener('DOMContentLoaded', async () => {
    try {
        await WordsManager.loadWords();
        currentWord = WordsManager.getRandomWord();

        // Event listeners
        const flashcardContainer = document.getElementById('flashcard-container');
        if (flashcardContainer) {
            flashcardContainer.addEventListener('click', flipCard);
        }

        const btnMarkLearned = document.getElementById('mark-learned');
        if (btnMarkLearned) {
            btnMarkLearned.addEventListener('click', () => {
                WordsManager.markWord(currentWord, true);
                const quizManager = window.quizManager;
                if (quizManager) {
                    quizManager.score += 5;
                    quizManager.updateUI();
                }
                nextCard();
            });
        }

        const btnMarkDifficult = document.getElementById('mark-difficult');
        if (btnMarkDifficult) {
            btnMarkDifficult.addEventListener('click', () => {
                WordsManager.markWord(currentWord, false, true);
                nextCard();
            });
        }

        const btnNextCard = document.getElementById('next-card');
        if (btnNextCard) {
            btnNextCard.addEventListener('click', nextCard);
        }

        const btnToggleDark = document.getElementById('toggle-dark-mode');
        if (btnToggleDark) {
            btnToggleDark.addEventListener('click', toggleDarkMode);
        }

        const btnSubmitQuiz = document.getElementById('submit-quiz');
        if (btnSubmitQuiz) {
            btnSubmitQuiz.addEventListener('click', submitQuizAnswer);
        }

        updateUI();
        updateFlashcard();

        // Inicializar QuizManager después de cargar las palabras
        window.quizManager = new QuizManager();
    } catch (error) {
        console.error("Error inicializando la app:", error);
        const front = document.querySelector('.front');
        if (front) front.textContent = 'Error cargando la aplicación';
    }
});

function flipCard() {
    const flashcard = document.getElementById('flashcard');
    if (flashcard) {
        flashcard.classList.toggle('flipped');
        if (window.GameLogic && typeof GameLogic.addPoints === 'function') {
            GameLogic.addPoints(1, "¡Practicando!");
        }
    }
}

function nextCard() {
    if (window.WordsManager && typeof WordsManager.getRandomWord === 'function') {
        currentWord = WordsManager.getRandomWord();
        updateFlashcard();
        updateUI();
        if (window.GameLogic && typeof GameLogic.addRecentWord === 'function') {
            GameLogic.addRecentWord(currentWord);
        }
    }
}

function updateFlashcard() {
    const flashcard = document.getElementById('flashcard');
    if (flashcard && currentWord) {
        const front = flashcard.querySelector('.front');
        const back = flashcard.querySelector('.back');
        if (front) front.textContent = currentWord.english;
        if (back) back.textContent = currentWord.spanish;
        flashcard.classList.remove('flipped');
    }
}

function updateUI() {
    const progress = WordsManager.getProgress();
    const progressText = document.getElementById('progress-text');
    const progressBar = document.getElementById('progress-bar');
    if (progressText && progress) {
        progressText.textContent = `${progress.learned}/${progress.total} palabras`;
    }
    if (progressBar && progress && progress.total > 0) {
        progressBar.style.width = `${(progress.learned / progress.total) * 100}%`;
    }

    // Actualizar estadísticas del juego
    if (window.GameLogic) {
        const points = (typeof GameLogic.getPoints === 'function') ? GameLogic.getPoints() : 0;
        const level = (typeof GameLogic.getLevel === 'function') ? GameLogic.getLevel() : 1;
        const streak = (typeof GameLogic.getStreak === 'function') ? GameLogic.getStreak() : 0;
        const pointsElem = document.getElementById('points');
        const levelElem = document.getElementById('level');
        const streakElem = document.getElementById('streak');
        if (pointsElem) pointsElem.textContent = points;
        if (levelElem) levelElem.textContent = level;
        if (streakElem) streakElem.textContent = `${streak} días`;
    }
}

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
}

function submitQuizAnswer() {
    const selected = document.querySelector('input[name="quiz-option"]:checked');
    if (!selected) {
        alert('Por favor selecciona una respuesta.');
        return;
    }
    const answer = selected.value;
    if (answer === currentWord.spanish) {
        alert('¡Correcto!');
        if (window.GameLogic && typeof GameLogic.addPoint === 'function') {
            GameLogic.addPoint();
            updateUI();
        }
    } else {
        alert('Incorrecto. La respuesta correcta es: ' + currentWord.spanish);
    }
    nextCard();
}
