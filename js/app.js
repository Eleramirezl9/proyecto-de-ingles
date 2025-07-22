let currentWord = null;

document.addEventListener('DOMContentLoaded', async () => {
    try {
        await WordsManager.loadWords();
        currentWord = WordsManager.getRandomWord();
        
        // Event listeners
        document.getElementById('flashcard-container').addEventListener('click', flipCard);
        document.getElementById('mark-learned').addEventListener('click', () => {
            WordsManager.markWord(currentWord, true);
            // Actualizar puntuación del quiz si existe
            const quizManager = window.quizManager;
            if (quizManager) {
                quizManager.score += 5;
                quizManager.updateUI();
            }
            nextCard();
        });
        document.getElementById('mark-difficult').addEventListener('click', () => {
            WordsManager.markWord(currentWord, false, true);
            nextCard();
        });
        document.getElementById('next-card').addEventListener('click', nextCard);
        document.getElementById('toggle-dark-mode').addEventListener('click', toggleDarkMode);
        document.getElementById('submit-quiz').addEventListener('click', submitQuizAnswer);
        
        updateUI();
        updateFlashcard();
        
        // Inicializar QuizManager después de cargar las palabras
        window.quizManager = new QuizManager();
    } catch (error) {
        console.error("Error inicializando la app:", error);
        document.querySelector('.front').textContent = 'Error cargando la aplicación';
    }
});

function flipCard() {
    document.getElementById('flashcard').classList.toggle('flipped');
    // Añadir puntos por interacción
    GameLogic.addPoints(1, "¡Practicando!");
}

function nextCard() {
    currentWord = WordsManager.getRandomWord();
    updateFlashcard();
    updateUI();
    GameLogic.addRecentWord(currentWord);
}

function updateFlashcard() {
  const flashcard = document.getElementById('flashcard');
  if (currentWord) {
    flashcard.querySelector('.front').textContent = currentWord.english;
    flashcard.querySelector('.back').textContent = currentWord.spanish;
  }
  flashcard.classList.remove('flipped');
}

function updateUI() {
  const { learned, total } = WordsManager.getProgress();
  document.getElementById('progress-text').textContent = `${learned}/${total} palabras`;
  document.getElementById('progress-bar').style.width = `${(learned / total) * 100}%`;
  
  // Actualizar estadísticas del juego
  if (typeof GameLogic !== 'undefined') {
    document.getElementById('points').textContent = GameLogic.getPoints();
    document.getElementById('level').textContent = GameLogic.getLevel();
    document.getElementById('streak').textContent = `${GameLogic.getStreak()} días`;
  }
}

function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
}

function submitQuizAnswer() {
  // Busca la opción seleccionada (asumiendo que son radio buttons con name="quiz-option")
  const selected = document.querySelector('input[name="quiz-option"]:checked');
  if (!selected) {
    alert('Por favor selecciona una respuesta.');
    return;
  }
  const answer = selected.value;
  // Aquí puedes agregar la lógica para verificar la respuesta
  // Por ejemplo:
  if (answer === currentWord.spanish) {
    alert('¡Correcto!');
    // Actualiza puntos, etc.
    if (typeof GameLogic !== 'undefined') {
      GameLogic.addPoint();
      updateUI();
    }
  } else {
    alert('Incorrecto. La respuesta correcta es: ' + currentWord.spanish);
  }
  // Puedes cargar una nueva pregunta si lo deseas
  nextCard();
}
