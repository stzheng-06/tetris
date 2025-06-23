'use client'

import { Button } from '@/components/ui/button'
import { useTetrisStore, GAME_SPEEDS, BOARD_WIDTH, BOARD_HEIGHT } from '@/store/tetris'
import { Play, Pause, RotateCw } from 'lucide-react'
import { useEffect, useCallback, useMemo } from 'react'
import { toast } from 'sonner'
import { TetrisSettings } from '@/components/TetrisSettings'

/**
 * @description 这只是个示例页面，你可以随意修改这个页面或进行全面重构
 */
export default function TetrisGame() {
	const {
		board,
		currentPiece,
		nextPiece,
		heldPiece,
		score,
		level,
		isPlaying,
		gameOver,
		highScore,
		controls,
		initGame,
		moveLeft,
		moveRight,
		moveDown,
		rotate,
		hardDrop,
		holdPiece,
		togglePlay,
		updateBoard
	} = useTetrisStore()

	// 计算预览位置
	const ghostPiecePosition = useMemo(() => {
		if (!currentPiece || !isPlaying) return null

		let newY = currentPiece.pos.y
		const shape = currentPiece.shape
		const currentBoard = board

		// 找到最低可能的位置
		while (newY < BOARD_HEIGHT) {
			if (!shape.every((row, y) =>
				row.every((value, x) => {
					if (!value) return true
					const boardY = newY + y + 1
					const boardX = currentPiece.pos.x + x
					return (
						boardY < BOARD_HEIGHT &&
						boardX >= 0 &&
						boardX < BOARD_WIDTH &&
						!currentBoard[boardY]?.[boardX]
					)
				})
			)) break
			newY++
		}

		return {
			...currentPiece,
			pos: { ...currentPiece.pos, y: newY }
		}
	}, [currentPiece, board, isPlaying])

	// 键盘控制
	const handleKeyPress = useCallback((event: KeyboardEvent) => {
		if (gameOver) return

		switch (event.code) {
			case controls.moveLeft:
				moveLeft()
				break
			case controls.moveRight:
				moveRight()
				break
			case controls.moveDown:
				moveDown()
				break
			case controls.rotate:
				rotate()
				break
			case controls.hardDrop:
				event.preventDefault()
				hardDrop()
				break
			case controls.hold:
				holdPiece()
				break
			case controls.pause:
				togglePlay()
				break
			default:
				break
		}
	}, [gameOver, moveLeft, moveRight, moveDown, rotate, hardDrop, holdPiece, togglePlay, controls])

	// 自动下落
	useEffect(() => {
		if (!isPlaying) return

		const speed = GAME_SPEEDS[level as keyof typeof GAME_SPEEDS] || GAME_SPEEDS[10]
		const interval = setInterval(() => {
			moveDown()
		}, speed)

		return () => clearInterval(interval)
	}, [isPlaying, level, moveDown])

	// 键盘事件监听
	useEffect(() => {
		window.addEventListener('keydown', handleKeyPress)
		return () => window.removeEventListener('keydown', handleKeyPress)
	}, [handleKeyPress])

	// 初始化游戏
	useEffect(() => {
		initGame()
	}, [initGame])

	// 渲染游戏板
	const renderBoard = () => {
		const displayBoard = updateBoard()
		return displayBoard.map((row, y) => (
			<div key={y} className="flex">
				{row.map((cell, x) => {
					// 检查是否是预览方块的位置
					let isGhost = false
					if (ghostPiecePosition && currentPiece) {
						const ghostY = y - ghostPiecePosition.pos.y
						const ghostX = x - ghostPiecePosition.pos.x
						if (
							ghostY >= 0 &&
							ghostY < ghostPiecePosition.shape.length &&
							ghostX >= 0 &&
							ghostX < ghostPiecePosition.shape[0].length
						) {
							isGhost = ghostPiecePosition.shape[ghostY][ghostX] === 1
						}
					}

					return (
						<div
							key={`${x}-${y}`}
							className={`w-6 h-6 border border-gray-700 transition-colors duration-200 ${
								cell ? 'animate-pop' : ''
							}`}
							style={{
								backgroundColor: cell || (isGhost ? '#363636' : '#1a1a1a'),
							}}
						/>
					)
				})}
			</div>
		))
	}

	// 渲染预览区
	const renderPreview = (piece: typeof nextPiece | typeof heldPiece) => {
		if (!piece) return null
		const previewBoard = Array(4).fill(null).map(() => Array(4).fill(null))
		piece.shape.forEach((row, y) => {
			row.forEach((value, x) => {
				if (value) {
					previewBoard[y][x] = piece.color
				}
			})
		})

		return previewBoard.map((row, y) => (
			<div key={y} className="flex">
				{row.map((cell, x) => (
					<div
						key={`preview-${x}-${y}`}
						className="w-4 h-4 border border-gray-700"
						style={{
							backgroundColor: cell || '#1a1a1a',
						}}
					/>
				))}
			</div>
		))
	}

	return (
		<main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-gray-900 to-black p-8 text-white">
			<div className="flex gap-8">
				{/* 操作说明区 */}
				<div className="flex w-48 flex-col gap-6 rounded-lg border border-gray-700 bg-black/50 p-4 backdrop-blur-sm">
					<div className="rounded-lg bg-gray-800/50 p-4 text-sm backdrop-blur-sm">
						<h3 className="mb-2 font-semibold">操作说明</h3>
						<ul className="space-y-1 text-gray-400">
							<li>← → : 左右移动</li>
							<li>↓ : 加速下落</li>
							<li>↑ : 旋转方块</li>
							<li>空格 : 直接下落</li>
							<li>左Shift : 保存方块</li>
							<li>P : 暂停/继续</li>
						</ul>
					</div>
				</div>

				{/* 游戏区 */}
				<div className="relative rounded-lg border-2 border-gray-600 bg-black/50 p-4 backdrop-blur-sm">
					<div className="border-2 border-gray-600 bg-black/80 p-1">
						{renderBoard()}
					</div>
					
					{/* 游戏结束遮罩 */}
					{gameOver && (
						<div className="absolute inset-0 flex items-center justify-center bg-black/90 backdrop-blur-sm">
							<div className="text-center">
								<h2 className="mb-4 animate-bounce text-2xl font-bold text-red-500">游戏结束</h2>
								<Button
									onClick={() => {
										initGame()
										togglePlay()
									}}
									variant="outline"
									className="border-gray-500 bg-gray-800 text-white hover:bg-gray-700"
								>
									<RotateCw className="mr-2 h-4 w-4" />
									重新开始
								</Button>
							</div>
						</div>
					)}
				</div>

				{/* 信息区 */}
				<div className="flex w-48 flex-col gap-6 rounded-lg border border-gray-700 bg-black/50 p-4 backdrop-blur-sm">
					<div className="space-y-2">
						<div className="flex items-center justify-between">
							<h2 className="text-lg font-semibold">下一个方块</h2>
							<TetrisSettings />
						</div>
						<div className="border border-gray-600 bg-black/80 p-2">
							{renderPreview(nextPiece)}
						</div>
					</div>

					<div className="space-y-2">
						<h2 className="text-lg font-semibold">保存的方块</h2>
						<div className="border border-gray-600 bg-black/80 p-2">
							{renderPreview(heldPiece)}
						</div>
					</div>

					<div className="space-y-4">
						<div>
							<p className="text-sm text-gray-400">当前分数</p>
							<p className="text-2xl font-bold">{score}</p>
						</div>
						<div>
							<p className="text-sm text-gray-400">最高分数</p>
							<p className="text-xl font-semibold text-yellow-500">{highScore}</p>
						</div>
						<div>
							<p className="text-sm text-gray-400">当前等级</p>
							<p className="text-xl">{level}</p>
						</div>
					</div>

					<div>
						<Button
							onClick={togglePlay}
							variant="outline"
							className="w-full border-gray-500 bg-gray-800 text-white hover:bg-gray-700"
							disabled={gameOver}
						>
							{isPlaying ? (
								<>
									<Pause className="mr-2 h-4 w-4" />
									暂停
								</>
							) : (
								<>
									<Play className="mr-2 h-4 w-4" />
									开始
								</>
							)}
						</Button>
					</div>
				</div>
			</div>
		</main>
	)
}
