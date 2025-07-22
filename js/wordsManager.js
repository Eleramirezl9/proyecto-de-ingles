const WordsManager = {
  words: [],

  loadWords: async function() {
    try {
      const response = await fetch('data/words.json');
      if (!response.ok) throw new Error('No se pudo cargar words.json');
      
      this.words = await response.json();
      const savedProgress = JSON.parse(localStorage.getItem('wordsProgress')) || {};
      
      this.words = this.words.map(word => ({
        ...word,
        learned: savedProgress[word.english]?.learned || false,
        difficulty: savedProgress[word.english]?.difficulty || 0
      }));
    } catch (error) {
      if (document.getElementById('error-message')) {
        document.getElementById('error-message').style.display = 'block';
        document.getElementById('error-message').textContent =
            'Error cargando las palabras. Abre el proyecto con un servidor local (por ejemplo, python -m http.server o Live Server en VS Code).';
      }
      console.error('Error loading words:', error);
      // Datos de respaldo
      this.words = [
        { english: "apple", spanish: "manzana", category: "food", learned: false, difficulty: 0 },
        { english: "run", spanish: "correr", category: "verb", learned: false, difficulty: 0 },
        { english: "happy", spanish: "feliz", category: "adjective", learned: false, difficulty: 0 }
      ];
    }
  },

  getRandomWord: function() {
    if (this.words.length === 0) return null;
    
    const unlearnedWords = this.words.filter(word => !word.learned || word.difficulty > 0);
    if (unlearnedWords.length === 0) {
      return this.words[Math.floor(Math.random() * this.words.length)];
    }
    
    const totalDifficulty = unlearnedWords.reduce((sum, word) => sum + (word.difficulty + 1), 0);
    let random = Math.random() * totalDifficulty;
    
    for (const word of unlearnedWords) {
      random -= (word.difficulty + 1);
      if (random <= 0) return word;
    }
    
    return unlearnedWords[unlearnedWords.length - 1];
  },

  markWord: function(word, learned = false, difficult = false) {
    const index = this.words.findIndex(w => w.english === word.english);
    if (index !== -1) {
      this.words[index].learned = learned;
      this.words[index].difficulty = difficult ? 1 : 0;
      this.saveProgress();
      
      // Emitir evento de cambio
      const event = new CustomEvent('wordStatusChanged', { 
        detail: { word: this.words[index], learned, difficult } 
      });
      document.dispatchEvent(event);
    }
  },

  saveProgress: function() {
    try {
      localStorage.setItem('wordsProgress', JSON.stringify(this.words));
    } catch (e) {
      console.error('Error guardando progreso:', e);
    }
  },

  getProgress: function() {
    const learned = this.words.filter(word => word.learned).length;
    return { learned, total: this.words.length };
  },

  // Nuevos métodos para vincular con GameLogic
  markWordQuiz(word, learned, isQuiz = false) {
    if (!word) return;
    const foundWord = this.words.find(w => w.english === word.english);
    if (foundWord) {
      foundWord.learned = learned;
      
      // Añadir puntos según la acción
      if (learned) {
        GameLogic.addPoints(isQuiz ? 10 : 5, 
            isQuiz ? "¡Respuesta correcta!" : "Palabra aprendida");
        GameLogic.updateStreak(true);
      } else {
        GameLogic.updateStreak(false);
      }

      // Registrar palabra reciente
      GameLogic.addRecentWord(word);
      
      // Actualizar progreso
      this.updateProgress();
      // If you have a saveToLocalStorage method, call it here. Otherwise, use saveProgress.
      if (typeof this.saveToLocalStorage === "function") {
        this.saveToLocalStorage();
      } else {
        this.saveProgress();
      }
    }
  },

  updateProgress() {
    const progress = this.getProgress();
    document.getElementById('progress-text').textContent = 
        `${progress.learned}/${progress.total} palabras`;
    document.getElementById('progress-bar').style.width = 
        `${(progress.learned / progress.total) * 100}%`;
  },

  getQuizWords() {
    // Priorizar palabras recientes
    const recentWords = GameLogic.getRecentWords();
    const otherWords = this.words.filter(w => 
        !recentWords.find(rw => rw.english === w.english));
    
    return [...recentWords, ...otherWords];
  },

  getAllWords: function() {
    // Devuelve todas las palabras cargadas
    return this.words || [];
  },
};
// Exportar al scope global para otros scripts
window.WordsManager = WordsManager;