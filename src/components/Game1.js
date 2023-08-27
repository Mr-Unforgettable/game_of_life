import React, { useState, useRef } from 'react';
import './Game.css';

const CELL_SIZE = 20;
const WIDTH = 800;
const HEIGHT = 600;

function Cell({ x, y }) {
    return (
        <div className="Cell" style={{
            left: `${CELL_SIZE * x + 1}px`,
            top: `${CELL_SIZE * y + 1}px`,
            width: `${CELL_SIZE - 1}px`,
            height: `${CELL_SIZE - 1}px`,
        }} />
    );
}

function Game() {
    const [cells, setCells] = useState([]);
    const [isRunning, setIsRunning] = useState(false);
    const [intervalTime, setIntervalTime] = useState(100);

    const rows = HEIGHT / CELL_SIZE;
    const cols = WIDTH / CELL_SIZE;

    const board = useRef(makeEmptyBoard());

    function makeEmptyBoard() {
        const board = [];
        for (let y = 0; y < rows; y++) {
            board[y] = [];
            for (let x = 0; x < cols; x++) {
                board[y][x] = false;
            }
        }
        return board;
    }

    function getElementOffset() {
        const rect = boardRef.current.getBoundingClientRect();
        const doc = document.documentElement;

        return {
            x: (rect.left + window.pageXOffset) - doc.clientLeft,
            y: (rect.top + window.pageYOffset) - doc.clientTop,
        };
    }

    function makeCells() {
        const newCells = [];
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                if (board.current[y][x]) {
                    newCells.push({ x, y });
                }
            }
        }
        return newCells;
    }

    const boardRef = useRef(null);

    function handleClick(event) {
        const elemOffset = getElementOffset();
        const offsetX = event.clientX - elemOffset.x;
        const offsetY = event.clientY - elemOffset.y;

        const x = Math.floor(offsetX / CELL_SIZE);
        const y = Math.floor(offsetY / CELL_SIZE);

        if (x >= 0 && x <= cols && y >= 0 && y <= rows) {
            board.current[y][x] = !board.current[y][x];
        }

        setCells(makeCells());
    }

    function handleIntervalChange(event) {
        setIntervalTime(event.target.value);
    }

    function handleClear() {
        board.current = makeEmptyBoard();
        setCells(makeCells());
    }

    function runGame() {
        setIsRunning(true);
        runIteration();
    }

    function stopGame() {
        setIsRunning(false);
        if (timeoutHandler.current) {
            window.clearTimeout(timeoutHandler.current);
            timeoutHandler.current = null;
        }
    }

    function calculateNeighbors(board, x, y) {
        let neighbors = 0;
        const dirs = [[-1, -1], [-1, 0], [-1, 1], [0, 1], [1, 1], [1, 0], [1, -1], [0, -1]];
        for (let i = 0; i < dirs.length; i++) {
            const dir = dirs[i];
            let y1 = y + dir[0];
            let x1 = x + dir[1];

            if (x1 >= 0 && x1 < cols && y1 >= 0 && y1 < rows && board[y1][x1]) {
                neighbors++;
            }
        }

        return neighbors;
    }

    const timeoutHandler = useRef(null);

    function runIteration() {
        const newBoard = makeEmptyBoard();

        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                const neighbors = calculateNeighbors(board.current, x, y);
                if (board.current[y][x]) {
                    if (neighbors === 2 || neighbors === 3) {
                        newBoard[y][x] = true;
                    } else {
                        newBoard[y][x] = false;
                    }
                } else {
                    if (!board.current[y][x] && neighbors === 3) {
                        newBoard[y][x] = true;
                    }
                }
            }
        }

        board.current = newBoard;
        setCells(makeCells());

        timeoutHandler.current = window.setTimeout(() => {
            runIteration();
        }, intervalTime);
    }

    function handleRandom() {
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                board.current[y][x] = Math.random() >= 0.5;
            }
        }

        setCells(makeCells());
    }

    return (
        <div>
            <div className="Board"
                style={{ width: WIDTH, height: HEIGHT, backgroundSize: `${CELL_SIZE}px ${CELL_SIZE}px` }}
                onClick={handleClick}
                ref={boardRef}>

                {cells.map(cell => (
                    <Cell x={cell.x} y={cell.y} key={`${cell.x},${cell.y}`} />
                ))}
            </div>

            <div className="controls">
                Update every <input value={intervalTime} onChange={handleIntervalChange} /> msec
                {isRunning ?
                    <button className="button" onClick={stopGame}>Stop</button> :
                    <button className="button" onClick={runGame}>Run</button>
                }
                <button className="button" onClick={handleRandom}>Random</button>
                <button className="button" onClick={handleClear}>Clear</button>
            </div>
        </div>
    );
}

export default Game;
