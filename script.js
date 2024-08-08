const ws = new WebSocket('ws://localhost:3000');
let isPlayingOnline = false;
let gameId = '';
let isMyTurn = false;

document.getElementById('playWithAI').addEventListener('click', () => {
    isPlayingOnline = false;
    startGame('Play with AI');
});

document.getElementById('playOnline').addEventListener('click', () => {
    document.getElementById('menu').style.display = 'none';
    document.getElementById('onlineMenu').style.display = 'block';
});

document.getElementById('createGame').addEventListener('click', () => {
    ws.send(JSON.stringify({ type: 'createGame' }));
});

document.getElementById('joinGame').addEventListener('click', () => {
    gameId = document.getElementById('gameIdInput').value;
    ws.send(JSON.stringify({ type: 'joinGame', gameId }));
});

ws.onmessage = (event) => {
    const data = JSON.parse(event.data);

    switch (data.type) {
        case 'gameCreated':
            gameId = data.gameId;
            startGame('Play Online', true);
            break;
        case 'gameJoined':
            startGame('Play Online', true);
            updateBoard(data.board);
            isMyTurn = data.turn === 0;
            break;
        case 'moveMade':
            updateBoard(data.board);
            isMyTurn = data.turn === 0;
            break;
        case 'error':
            alert(data.message);
            break;
    }
};

function startGame(title, online = false) {
    document.getElementById('gameTitle').textContent = title;
    document.getElementById('gameArea').style.display = 'block';
    document.getElementById('onlineMenu').style.display = 'none';
    document.getElementById('menu').style.display = 'none';
    initGameBoard();
    if (online) {
        document.getElementById('restartGame').style.display = 'none';
    } else {
        document.getElementById('restartGame').style.display = 'block';
    }
}

function initGameBoard() {
    const board = document.getElementById('gameBoard');
    board.innerHTML = '';
    for (let i = 0; i < 9; i++) {
        const cell = document.createElement('div');
        cell.addEventListener('click', () => {
            if (isPlayingOnline && isMyTurn) {
                ws.send(JSON.stringify({ type: 'makeMove', gameId, move: i }));
            } else if (!isPlayingOnline) {
                makeMoveAI(i);
            }
        });
        board.appendChild(cell);
    }
}

function updateBoard(boardState) {
    const cells = document.getElementById('gameBoard').children;
    boardState.forEach((cell, index) => {
        cells[index].textContent = cell;
    });
}

function makeMoveAI(index) {
    const boardState = Array.from(document.getElementById('gameBoard').children).map(cell => cell.textContent);
    if (!boardState[index]) {
        boardState[index] = 'X';
        updateBoard(boardState);
        if (checkWin(boardState)) {
            setTimeout(() => alert('You win!'), 100);
            return;
        }
        // AI makes a move
        const emptyIndices = boardState.map((cell, i) => cell === '' ? i : null).filter(i => i !== null);
        const aiMove = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
        boardState[aiMove] = 'O';
        updateBoard(boardState);
        if (checkWin(boardState)) {
            setTimeout(() => alert('AI wins!'), 100);
        }
    }
}

function checkWin(board) {
    const winningCombos = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
        [0, 4, 8], [2, 4, 6] // Diagonals
    ];
    return winningCombos.some(combo => {
        const [a, b, c] = combo;
        return board[a] && board[a] === board[b] && board[a] === board[c];
    });
}

document.getElementById('restartGame').addEventListener('click', () => {
    startGame('Play with AI');
});
