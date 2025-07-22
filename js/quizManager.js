class QuizManager {
    constructor() {
        this.currentWord = null;
        this.initialize();
    }

    async initialize() {
        try {
            if (window.WordsManager && typeof window.WordsManager.loadWords === 'function') {
                await window.WordsManager.loadWords();
            }
            this.showNewQuestion();
            this.updateUI();
        } catch (error) {
            console.error('Error inicializando el quiz:', error);
        }
    }

    showNewQuestion() {
        if (!window.WordsManager || typeof window.WordsManager.getRandomWord !== 'function') return;
        this.currentWord = window.WordsManager.getRandomWord();
        const wordDisplay = document.querySelector('.current-word');
        const optionsGrid = document.querySelector('.options-grid');
        if (!this.currentWord || !wordDisplay || !optionsGrid) return;

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
        if (!this.currentWord || !window.WordsManager || typeof window.WordsManager.getAllWords !== 'function') return [];
        const correctAnswer = this.currentWord.english;
        const allWords = window.WordsManager.getAllWords();
        let options = [correctAnswer];

        while (options.length < 4 && allWords.length > 0) {
            const randomWord = allWords[Math.floor(Math.random() * allWords.length)];
            if (randomWord && !options.includes(randomWord.english)) {
                options.push(randomWord.english);
            }
        }

        return options.sort(() => Math.random() - 0.5);
    }

    handleAnswer(event) {
        const selectedButton = event.target;
        const selectedAnswer = selectedButton.dataset.value;
        const isCorrect = this.currentWord && selectedAnswer === this.currentWord.english;

        document.querySelectorAll('.option-button').forEach(btn => btn.disabled = true);

        if (isCorrect) {
            selectedButton.classList.add('correct');
            if (window.GameLogic && typeof window.GameLogic.addPoints === 'function') {
                window.GameLogic.addPoints(10, "¡Respuesta correcta!");
            }
            if (window.GameLogic && typeof window.GameLogic.updateStreak === 'function') {
                window.GameLogic.updateStreak(true);
            }
            if (window.WordsManager && typeof window.WordsManager.markWord === 'function') {
                window.WordsManager.markWord(this.currentWord, true);
            }
        } else {
            selectedButton.classList.add('incorrect');
            if (this.currentWord) {
                const correctBtn = document.querySelector(`[data-value="${this.currentWord.english}"]`);
                if (correctBtn) correctBtn.classList.add('correct');
            }
            if (window.GameLogic && typeof window.GameLogic.updateStreak === 'function') {
                window.GameLogic.updateStreak(false);
            }
        }

        this.updateUI();
        this.updateProgress();

        setTimeout(() => this.showNewQuestion(), 1500);
    }

    updateUI() {
        try {
            const quizScore = document.getElementById('quiz-score');
            const quizStreak = document.getElementById('quiz-streak');
            if (quizScore && window.GameLogic) quizScore.textContent = window.GameLogic.points || 0;
            if (quizStreak && window.GameLogic) quizStreak.textContent = window.GameLogic.streak || 0;
        } catch (error) {
            console.error('Error actualizando UI:', error);
        }
    }

    updateProgress() {
        try {
            if (!window.WordsManager || typeof window.WordsManager.getProgress !== 'function') return;
            const progress = window.WordsManager.getProgress();
            const progressText = document.getElementById('progress-text');
            const progressBar = document.getElementById('progress-bar');
            if (progressText && progress) {
                progressText.textContent = `${progress.learned}/${progress.total} palabras`;
            }
            if (progressBar && progress && progress.total > 0) {
                progressBar.style.width = `${(progress.learned / progress.total) * 100}%`;
            }
        } catch (error) {
            console.error('Error actualizando progreso:', error);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new QuizManager();
});
