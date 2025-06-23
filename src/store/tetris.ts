import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type TetrominoType = 'I' | 'O' | 'T' | 'L' | 'J' | 'S' | 'Z'

interface TetrominoShape {
  shape: number[][]
  color: string
}

const TETROMINOES: Record<TetrominoType, TetrominoShape> = {
  I: {
    shape: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ],
    color: '#00f0f0'
  },
  O: {
    shape: [
      [1, 1],
      [1, 1]
    ],
    color: '#f0f000'
  },
  T: {
    shape: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0]
    ],
    color: '#a000f0'
  },
  L: {
    shape: [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0]
    ],
    color: '#f0a000'
  },
  J: {
    shape: [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0]
    ],
    color: '#0000f0'
  },
  S: {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0]
    ],
    color: '#00f000'
  },
  Z: {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0]
    ],
    color: '#f00000'
  }
}

export const BOARD_WIDTH = 10
export const BOARD_HEIGHT = 20

const createEmptyBoard = () => 
  Array.from({ length: BOARD_HEIGHT }, () => 
    Array(BOARD_WIDTH).fill(null)
  )

interface Piece extends TetrominoShape {
  pos: { x: number; y: number }
}

const getRandomTetromino = (): Piece => {
  const tetrominoes = Object.keys(TETROMINOES) as TetrominoType[]
  const randTetromino = tetrominoes[Math.floor(Math.random() * tetrominoes.length)] as TetrominoType
  return {
    ...TETROMINOES[randTetromino],
    pos: { x: Math.floor(BOARD_WIDTH / 2) - 1, y: 0 }
  }
}

interface Controls {
  moveLeft: string
  moveRight: string
  moveDown: string
  rotate: string
  hardDrop: string
  hold: string
  pause: string
}

const DEFAULT_CONTROLS: Controls = {
  moveLeft: 'ArrowLeft',
  moveRight: 'ArrowRight',
  moveDown: 'ArrowDown',
  rotate: 'ArrowUp',
  hardDrop: 'Space',
  hold: 'ShiftLeft',
  pause: 'KeyP'
}

interface TetrisState {
  board: (string | null)[][]
  currentPiece: Piece | null
  nextPiece: Piece | null
  heldPiece: Piece | null
  canHold: boolean
  score: number
  level: number
  isPlaying: boolean
  gameOver: boolean
  highScore: number
  controls: Controls
  initGame: () => void
  moveLeft: () => void
  moveRight: () => void
  moveDown: () => void
  rotate: () => void
  hardDrop: () => void
  holdPiece: () => void
  togglePlay: () => void
  updateBoard: () => (string | null)[][]
  updateControl: (key: keyof Controls, value: string) => void
  resetControls: () => void
}

export const useTetrisStore = create<TetrisState>()(
  persist(
    (set, get) => ({
      board: createEmptyBoard(),
      currentPiece: null,
      nextPiece: null,
      heldPiece: null,
      canHold: true,
      score: 0,
      level: 1,
      isPlaying: false,
      gameOver: false,
      highScore: 0,
      controls: DEFAULT_CONTROLS,

      initGame: () => {
        set({
          board: createEmptyBoard(),
          currentPiece: getRandomTetromino(),
          nextPiece: getRandomTetromino(),
          heldPiece: null,
          canHold: true,
          score: 0,
          level: 1,
          isPlaying: false,
          gameOver: false
        })
      },

      moveLeft: () => {
        const { currentPiece, board } = get()
        if (!currentPiece || !get().isPlaying) return

        const newX = currentPiece.pos.x - 1
        if (isValidMove(currentPiece.shape, board, newX, currentPiece.pos.y)) {
          set({
            currentPiece: {
              ...currentPiece,
              pos: { ...currentPiece.pos, x: newX }
            }
          })
        }
      },

      moveRight: () => {
        const { currentPiece, board } = get()
        if (!currentPiece || !get().isPlaying) return

        const newX = currentPiece.pos.x + 1
        if (isValidMove(currentPiece.shape, board, newX, currentPiece.pos.y)) {
          set({
            currentPiece: {
              ...currentPiece,
              pos: { ...currentPiece.pos, x: newX }
            }
          })
        }
      },

      moveDown: () => {
        const { currentPiece, board, nextPiece } = get()
        if (!currentPiece || !get().isPlaying || !nextPiece) return

        const newY = currentPiece.pos.y + 1
        if (isValidMove(currentPiece.shape, board, currentPiece.pos.x, newY)) {
          set({
            currentPiece: {
              ...currentPiece,
              pos: { ...currentPiece.pos, y: newY }
            }
          })
        } else {
          const newBoard = mergePieceToBoard(currentPiece, board)
          const { clearedBoard, linesCleared } = clearLines(newBoard)
          const additionalScore = calculateScore(linesCleared, get().level)
          const newLevel = Math.floor((get().score + additionalScore) / 1000) + 1

          if (!isValidMove(nextPiece.shape, clearedBoard, nextPiece.pos.x, nextPiece.pos.y)) {
            set({
              gameOver: true,
              isPlaying: false,
              highScore: Math.max(get().score + additionalScore, get().highScore)
            })
          } else {
            set({
              board: clearedBoard,
              currentPiece: nextPiece,
              nextPiece: getRandomTetromino(),
              score: get().score + additionalScore,
              level: newLevel,
              canHold: true
            })
          }
        }
      },

      rotate: () => {
        const { currentPiece, board } = get()
        if (!currentPiece || !get().isPlaying) return

        const rotatedShape = rotateMatrix(currentPiece.shape)
        if (isValidMove(rotatedShape, board, currentPiece.pos.x, currentPiece.pos.y)) {
          set({
            currentPiece: {
              ...currentPiece,
              shape: rotatedShape
            }
          })
        }
      },

      hardDrop: () => {
        const { currentPiece, board } = get()
        if (!currentPiece || !get().isPlaying) return

        let newY = currentPiece.pos.y
        while (isValidMove(currentPiece.shape, board, currentPiece.pos.x, newY + 1)) {
          newY++
        }
        set({
          currentPiece: {
            ...currentPiece,
            pos: { ...currentPiece.pos, y: newY }
          }
        })
        get().moveDown()
      },

      holdPiece: () => {
        const { currentPiece, heldPiece, nextPiece, canHold } = get()
        if (!currentPiece || !get().isPlaying || !canHold) return

        if (!heldPiece) {
          set({
            heldPiece: {
              ...currentPiece,
              pos: { x: Math.floor(BOARD_WIDTH / 2) - 1, y: 0 }
            },
            currentPiece: nextPiece,
            nextPiece: getRandomTetromino(),
            canHold: false
          })
        } else {
          const tempPiece = {
            ...currentPiece,
            pos: { x: Math.floor(BOARD_WIDTH / 2) - 1, y: 0 }
          }
          set({
            currentPiece: {
              ...heldPiece,
              pos: { x: Math.floor(BOARD_WIDTH / 2) - 1, y: 0 }
            },
            heldPiece: tempPiece,
            canHold: false
          })
        }
      },

      togglePlay: () => {
        const { isPlaying, gameOver } = get()
        if (gameOver) {
          get().initGame()
        }
        set({ isPlaying: !isPlaying })
      },

      updateBoard: () => {
        const { currentPiece, board } = get()
        if (!currentPiece) return board

        const newBoard = board.map(row => [...row])
        currentPiece.shape.forEach((row, y) => {
          row.forEach((value, x) => {
            if (value) {
              const boardY = y + currentPiece.pos.y
              const boardX = x + currentPiece.pos.x
              if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
                newBoard[boardY]![boardX] = currentPiece.color
              }
            }
          })
        })
        return newBoard
      },

      updateControl: (key, value) => {
        set((state) => ({
          controls: {
            ...state.controls,
            [key]: value
          }
        }))
      },

      resetControls: () => {
        set({ controls: DEFAULT_CONTROLS })
      }
    }),
    {
      name: 'tetris-storage',
      partialize: (state) => ({
        highScore: state.highScore,
        controls: state.controls
      })
    }
  )
)

function isValidMove(shape: number[][], board: (string | null)[][], newX: number, newY: number): boolean {
  return shape.every((row, y) =>
    row.every((value, x) => {
      if (!value) return true
      const boardY = newY + y
      const boardX = newX + x
      return (
        boardY >= 0 &&
        boardY < BOARD_HEIGHT &&
        boardX >= 0 &&
        boardX < BOARD_WIDTH &&
        board[boardY]?.[boardX] === null
      )
    })
  )
}

function mergePieceToBoard(piece: Piece, board: (string | null)[][]): (string | null)[][] {
  const newBoard = board.map(row => [...row])
  piece.shape.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value) {
        const boardY = y + piece.pos.y
        const boardX = x + piece.pos.x
        if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
          newBoard[boardY]![boardX] = piece.color
        }
      }
    })
  })
  return newBoard
}

function clearLines(board: (string | null)[][]): { clearedBoard: (string | null)[][], linesCleared: number } {
  let linesCleared = 0
  const clearedBoard = board.filter(row => {
    const isLineFull = row.every(cell => cell !== null)
    if (isLineFull) linesCleared++
    return !isLineFull
  })

  while (clearedBoard.length < BOARD_HEIGHT) {
    clearedBoard.unshift(Array(BOARD_WIDTH).fill(null))
  }

  return { clearedBoard, linesCleared }
}

function calculateScore(linesCleared: number, level: number): number {
  const basePoints = [0, 40, 100, 300, 1200]
  return (basePoints[linesCleared] || 0) * level
}

function rotateMatrix(matrix: number[][]): number[][] {
  const N = matrix.length
  const rotated = matrix.map((row, i) =>
    row.map((_, j) => matrix[N - 1 - j][i] || 0)
  )
  return rotated
}

export const GAME_SPEEDS: Record<number, number> = {
  1: 1000,
  2: 900,
  3: 800,
  4: 700,
  5: 600,
  6: 500,
  7: 400,
  8: 300,
  9: 200,
  10: 100
}