class QuizManager {
    constructor() {
        this.currentWord = null;
        this.initialize();
    }

    async initialize() {
        try {
            await WordsManager.loadWords();
            this.showNewQuestion();
            this.updateUI();
        } catch (error) {
            console.error('Error inicializando el quiz:', error);
        }
    }

    showNewQuestion() {
        this.currentWord = WordsManager.getRandomWord();
        const wordDisplay = document.querySelector('.current-word');
        const optionsGrid = document.querySelector('.options-grid');
        
        // Mostrar la palabra en español
        wordDisplay.textContent = this.currentWord.spanish;
        
        // Generar y mostrar opciones
        const options = this.generateOptions();
        optionsGrid.innerHTML = options
            .map(option => `<button class="option-button" data-value="${option}">${option}</button>`)
            .join('');
            
        // Añadir event listeners
        document.querySelectorAll('.option-button').forEach(button => {
            button.addEventListener('click', (e) => this.handleAnswer(e));
        });
    }

    generateOptions() {
        const correctAnswer = this.currentWord.english;
        const allWords = WordsManager.getAllWords();
        let options = [correctAnswer];
        
        while (options.length < 4) {
            const randomWord = allWords[Math.floor(Math.random() * allWords.length)];
            if (!options.includes(randomWord.english)) {
                options.push(randomWord.english);
            }
        }
        
        return options.sort(() => Math.random() - 0.5);
    }

    handleAnswer(event) {
        const selectedButton = event.target;
        const selectedAnswer = selectedButton.dataset.value;
        const isCorrect = selectedAnswer === this.currentWord.english;
        
        document.querySelectorAll('.option-button').forEach(btn => btn.disabled = true);
        
        if (isCorrect) {
            selectedButton.classList.add('correct');
            // Usar GameLogic para los puntos
            GameLogic.addPoints(10, "¡Respuesta correcta!");
            GameLogic.updateStreak(true);
            WordsManager.markWord(this.currentWord, true);
        } else {
            selectedButton.classList.add('incorrect');
            document.querySelector(`[data-value="${this.currentWord.english}"]`)
                .classList.add('correct');
            GameLogic.updateStreak(false);
        }
        
        // Actualizar UI directamente
        this.updateUI();
        this.updateProgress();
        
        setTimeout(() => this.showNewQuestion(), 1500);
    }

    updateUI() {
        try {
            const quizScore = document.getElementById('quiz-score');
            const quizStreak = document.getElementById('quiz-streak');
            
            if (quizScore) quizScore.textContent = GameLogic.points;
            if (quizStreak) quizStreak.textContent = GameLogic.streak;
        } catch (error) {
            console.error('Error actualizando UI:', error);
        }
    }

    updateProgress() {
        try {
            const progress = WordsManager.getProgress();
            const progressText = document.getElementById('progress-text');
            const progressBar = document.getElementById('progress-bar');
            
            if (progressText) {
                progressText.textContent = `${progress.learned}/${progress.total} palabras`;
            }
            if (progressBar) {
                progressBar.style.width = `${(progress.learned / progress.total) * 100}%`;
            }
        } catch (error) {
            console.error('Error actualizando progreso:', error);
        }
    }
}

// Inicializar el quiz cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new QuizManager();
});
