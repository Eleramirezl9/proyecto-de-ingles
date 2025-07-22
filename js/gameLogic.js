class GameLogic {
    static points = 0;
    static streak = 0;
    static recentWords = [];

    static addPoints(amount, reason) {
        this.points += amount;
        this.showToast(`+${amount} puntos - ${reason}`);
        this.updateStats();
    }

    static updateStreak(correct) {
        if (correct) {
            this.streak++;
            if (this.streak % 5 === 0) {
                this.showToast(`¡Racha de ${this.streak}! 🔥`);
            }
        } else {
            this.streak = 0;
        }
        this.updateStats();
    }

    static showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => toast.remove(), 300);
            }, 2000);
        }, 100);
    }

    static updateStats() {
        // Actualizar todos los elementos que muestran puntos
        document.getElementById('points').textContent = this.points;
        document.getElementById('quiz-score').textContent = this.points;
        document.getElementById('streak').textContent = `${this.streak} días`;
        document.getElementById('level').textContent = Math.floor(this.points / 100) + 1;
    }

    static addRecentWord(word) {
        this.recentWords.unshift(word);
        if (this.recentWords.length > 10) this.recentWords.pop();
    }

    static getRecentWords() {
        return this.recentWords;
    }

    static getPoints() {
        // Devuelve los puntos actuales
        return this.points || 0;
    }
}

// Exportar al scope global para otros scripts
window.GameLogic = GameLogic;