import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Settings } from "lucide-react"
import { useTetrisStore } from "@/store/tetris"
import { useCallback } from "react"

export function TetrisSettings() {
  const { controls, updateControl, resetControls } = useTetrisStore()

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>, controlKey: keyof typeof controls) => {
    e.preventDefault()
    updateControl(controlKey, e.code)
  }, [updateControl])

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="border-gray-500 bg-gray-800 text-white hover:bg-gray-700">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-900 text-white border-gray-700">
        <DialogHeader>
          <DialogTitle>游戏按键设置</DialogTitle>
          <DialogDescription className="text-gray-400">
            点击输入框并按下键盘按键来设置对应的操作按键
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="moveLeft" className="text-right">
              向左移动
            </Label>
            <Input
              id="moveLeft"
              value={controls.moveLeft}
              className="col-span-3 bg-gray-800 border-gray-700"
              onKeyDown={(e) => handleKeyDown(e, "moveLeft")}
              readOnly
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="moveRight" className="text-right">
              向右移动
            </Label>
            <Input
              id="moveRight"
              value={controls.moveRight}
              className="col-span-3 bg-gray-800 border-gray-700"
              onKeyDown={(e) => handleKeyDown(e, "moveRight")}
              readOnly
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="moveDown" className="text-right">
              向下移动
            </Label>
            <Input
              id="moveDown"
              value={controls.moveDown}
              className="col-span-3 bg-gray-800 border-gray-700"
              onKeyDown={(e) => handleKeyDown(e, "moveDown")}
              readOnly
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="rotate" className="text-right">
              旋转方块
            </Label>
            <Input
              id="rotate"
              value={controls.rotate}
              className="col-span-3 bg-gray-800 border-gray-700"
              onKeyDown={(e) => handleKeyDown(e, "rotate")}
              readOnly
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="hardDrop" className="text-right">
              快速下落
            </Label>
            <Input
              id="hardDrop"
              value={controls.hardDrop}
              className="col-span-3 bg-gray-800 border-gray-700"
              onKeyDown={(e) => handleKeyDown(e, "hardDrop")}
              readOnly
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="hold" className="text-right">
              保存方块
            </Label>
            <Input
              id="hold"
              value={controls.hold}
              className="col-span-3 bg-gray-800 border-gray-700"
              onKeyDown={(e) => handleKeyDown(e, "hold")}
              readOnly
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="pause" className="text-right">
              暂停游戏
            </Label>
            <Input
              id="pause"
              value={controls.pause}
              className="col-span-3 bg-gray-800 border-gray-700"
              onKeyDown={(e) => handleKeyDown(e, "pause")}
              readOnly
            />
          </div>
        </div>
        <div className="flex justify-end">
          <Button 
            variant="outline" 
            className="border-gray-500 bg-gray-800 text-white hover:bg-gray-700"
            onClick={resetControls}
          >
            重置按键
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 