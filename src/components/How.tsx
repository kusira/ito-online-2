import React from "react"
import { Button, Dialog, DialogTitle, DialogContentText, DialogActions } from "@mui/material";
function How() {
  const [open, setOpen] = React.useState(false);
  return (
    <div>
      <div 
        onClick={() => setOpen(true)}
        className="absolute bottom-2 left-2 text-white font-bold w-[30px] h-[30px] rounded-[50%] text-center leading-[30px] bg-green-600 hover:bg-green-700 transition-all cursor-pointer shadow-md"
      >？</div>
      <Dialog open={open}>
        <DialogTitle>ルール</DialogTitle>
        <DialogContentText>
          <div className="p-4">
            <p className="mb-2">itoは協力パーティゲームです。</p>
            <p className="mb-2">1人1枚ずつ、1から100までの異なるカードが配られます。</p>
            <p className="mb-2">プレイヤーは、自分の手持ちのカードの数字を直接口に出さず、テーマに沿った表現で伝えます。</p>
            <p className="mb-2">協力してカードを小さい順に出して全員のカードを出し切ることが目標です。</p>
          </div>
        </DialogContentText>
  

        <DialogActions>
          <Button variant="contained" color="primary" onClick={() => setOpen(false)}>
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

export default How