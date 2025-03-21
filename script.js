class NecroPuzzle {
    constructor() {
        this.container = document.getElementById('puzzle-container');
        this.startButton = document.getElementById('start-game');
        this.resetButton = document.getElementById('reset-game');
        this.movesDisplay = document.getElementById('moves');
        this.timeDisplay = document.getElementById('time');
        this.winAnimation = document.getElementById('win-animation');
        this.musicButton = document.getElementById('toggle-music');
        this.backgroundMusic = document.getElementById('background-music');
        this.pieces = [];
        this.moves = 0;
        this.startTime = null;
        this.timer = null;
        this.draggedPiece = null;
        
        this.startButton.addEventListener('click', () => this.startGame());
        this.resetButton.addEventListener('click', () => this.resetGame());
        this.musicButton.addEventListener('click', () => this.toggleMusic());
        
        // Устанавливаем начальную громкость
        this.backgroundMusic.volume = 0.5;
        
        // Добавляем обработчик ошибок для аудио
        this.backgroundMusic.addEventListener('error', (e) => {
            console.error('Ошибка загрузки музыки:', e);
            this.musicButton.style.opacity = '0.5';
        });
    }

    toggleMusic() {
        try {
            if (this.backgroundMusic.paused) {
                this.backgroundMusic.play();
                this.musicButton.classList.add('playing');
                this.musicButton.querySelector('.music-icon').textContent = '⏸️';
            } else {
                this.backgroundMusic.pause();
                this.musicButton.classList.remove('playing');
                this.musicButton.querySelector('.music-icon').textContent = '🎵';
            }
        } catch (error) {
            console.error('Ошибка воспроизведения:', error);
        }
    }

    resetGame() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        this.container.innerHTML = '';
        this.pieces = [];
        this.moves = 0;
        this.movesDisplay.textContent = '0';
        this.timeDisplay.textContent = '00:00';
        this.startTime = null;
        this.winAnimation.classList.remove('show');
    }

    startGame() {
        this.resetGame();
        this.startTime = Date.now();
        this.timer = setInterval(() => this.updateTimer(), 1000);

        const positions = Array.from({length: 9}, (_, i) => i);
        
        // Перемешиваем позиции
        for (let i = positions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [positions[i], positions[j]] = [positions[j], positions[i]];
        }

        positions.forEach((pos, index) => {
            const piece = document.createElement('div');
            piece.className = 'puzzle-piece';
            piece.dataset.index = index;
            piece.draggable = true;
            
            const img = document.createElement('img');
            img.src = `images/img/${pos + 1}.png`;
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'cover';
            
            piece.appendChild(img);
            
            piece.addEventListener('dragstart', (e) => this.dragStart(e, index));
            piece.addEventListener('dragend', () => this.dragEnd());
            piece.addEventListener('dragover', (e) => this.dragOver(e));
            piece.addEventListener('drop', (e) => this.drop(e, index));
            
            this.container.appendChild(piece);
            this.pieces.push(piece);
        });
    }

    dragStart(e, index) {
        this.draggedPiece = index;
        e.target.style.opacity = '0.4';
        e.dataTransfer.effectAllowed = 'move';
    }

    dragEnd() {
        this.pieces.forEach(piece => piece.style.opacity = '1');
        this.draggedPiece = null;
    }

    dragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }

    drop(e, targetIndex) {
        e.preventDefault();
        
        if (this.draggedPiece === null || this.draggedPiece === targetIndex) return;
        
        // Меняем местами изображения
        const draggedImg = this.pieces[this.draggedPiece].querySelector('img');
        const targetImg = this.pieces[targetIndex].querySelector('img');
        
        const tempSrc = draggedImg.src;
        draggedImg.src = targetImg.src;
        targetImg.src = tempSrc;
        
        this.moves++;
        this.movesDisplay.textContent = this.moves;

        if (this.checkWin()) {
            clearInterval(this.timer);
            setTimeout(() => {
                alert('Поздравляем! Вы собрали пазл!');
            }, 500);
        }
    }

    isAdjacent(index1, index2) {
        const row1 = Math.floor(index1 / 3);
        const col1 = index1 % 3;
        const row2 = Math.floor(index2 / 3);
        const col2 = index2 % 3;
        
        return (Math.abs(row1 - row2) === 1 && col1 === col2) ||
               (Math.abs(col1 - col2) === 1 && row1 === row2);
    }

    checkWin() {
        const isWin = this.pieces.every((piece, index) => {
            const img = piece.querySelector('img');
            return img.src.endsWith(`${index + 1}.png`);
        });

        if (isWin) {
            clearInterval(this.timer);
            this.winAnimation.classList.add('show');
            setTimeout(() => {
                alert('Поздравляем! Вы собрали пазл!');
            }, 500);
        }

        return isWin;
    }

    updateTimer() {
        const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        this.timeDisplay.textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
}

// Инициализация игры
const game = new NecroPuzzle(); 