import { DocumentData, doc, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../firebase";
import { Button, Dialog, DialogTitle, DialogActions } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencilAlt } from '@fortawesome/free-solid-svg-icons';


function Game({ userData, enteringRoomData }: { userData: DocumentData, enteringRoomData: DocumentData }) {
  const members: { [key: string]: any } = enteringRoomData?.members || {};
  const membersArray = Object.entries(members);
  const timeLimit = enteringRoomData?.timeLimit
  const [open, setOpen] = useState<boolean>(false);
  const [isHiddenCard, setIsHiddenCard] = useState<boolean>(false);
  const [isDisplayNumber, setIsDisplayNumber] = useState<boolean>(false);
  const [isItoEnd, setIsItoEnd] = useState<boolean>(false);


  // キーワードの変更
  const sendKeyWord = async(e:any) => {
    const enteringRoomDocumentRef = doc(db, "rooms", `room${userData?.enteringRoom}`);
    const newMembers = {...members };
    const val = e.target.value;
    newMembers[userData?.uid][2] = val.slice(0,10);
    await updateDoc(enteringRoomDocumentRef, {
      members: newMembers,
    });
  }

  // ゲーム終了
  const gameEnd = async() => {
    const tmp = userData?.enteringRoom;
    // 同じ部屋にいる人のシーン遷移
    const membersArray = Object.entries(members);
    membersArray.forEach(async(member, _) => {
      const userDocumentRef = doc(db, "users", member[0]);
      await updateDoc(userDocumentRef, {
        scene: "start",
        enteringRoomData: -1,
      });
    });

    // 部屋の初期化
    const enteringRoomDocumentRef = doc(db, "rooms", `room${tmp}`);    
    await updateDoc(enteringRoomDocumentRef, {
      status: "free",
      playerCount: 0,
      members: [],
      host: "",
      theme: "",
    });
  }

  // 初回の startTime 設定
  const [startTime, _] = useState<number>(Date.now());
  const [time, setTime] = useState<number>(timeLimit * 60000);
  const [isTimeUp, setIsTimeUp] = useState<boolean>(false);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(Math.max(timeLimit * 60000 - (Date.now() - startTime), 0));
    }, 100);
  
    // timeが0になったときに1度だけsetOpenを発火
    if (time === 0 && !isTimeUp && !isItoEnd) {
      setIsTimeUp(true);
      setOpen(true);
    }
    return () => {
      clearInterval(interval);
    };
  }, [time, startTime, timeLimit, isTimeUp, setOpen]);

  return (
    <div>
      <div className="absolute top-2 right-2 w-max text-center">
        <p>残り時間⌛</p>
        <p className={`${time==0 && "font-bold text-red-600"}`}>
          { ("00" + Math.floor(time/60000)).slice(-2) }:
          { ("00" + Math.floor(time/1000)%60).slice(-2) }
        </p>
      </div>

      <div className="w-[90%] mx-auto">

        <div className="w-max mx-auto pt-16">
          <p className="mb-2">お題📜</p>
          <p className="max-w-[300px] text-xl mb-2 border-b-black border-b-[1px] w-max px-4">{ enteringRoomData?.theme }</p>
        </div>

        <div className="relative w-max mx-auto mt-8 mb-8">
          <p className="text-xs mb-2">あなたのカード</p>
          <div className="relative w-[60px] h-[80px] border-black border-[1px] text-2xl font-bold text-center leading-[80px]">
            {isHiddenCard && <div className="absolute w-full h-full bg-gray-400"></div>}
            <p>{members[userData?.uid]?.[3]}</p>
          </div>
          <p 
            onClick={() => setIsHiddenCard((prev) => !prev)}
            className="absolute right-[-60px] bottom-0 text-sm p-1 text-white bg-red-500 rounded-lg shadow-md hover:bg-red-600 transition-all cursor-pointer select-none"
          >隠す</p>
        </div>
        <div className="w-max mx-auto mb-8">
        <FontAwesomeIcon icon={faPencilAlt} />
          <input type="text"
            placeholder="キーワード"
            maxLength={ 10 }
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                sendKeyWord(e)
              }
            }}
            className="ml-1 w-[200px] mr-4 border-black border-b-[1px] focus:border-purple-700 outline-none"
          />
        </div>

        <div className="mx-auto w-max">
          {membersArray.map((member, index) =>(
            <div key={index} className="grid grid-cols-5 gap-4 border-black border-b-[1px] p-2">
                <p className="col-span-2">{member[1][0]}{userData?.uid === member[0] && <span> (あなた)</span>}</p>
                <p className="col-span-2 text-gray-500">{member[1][2]}</p>
                {  isDisplayNumber &&
                  <p className="col-span-1 font-bold ">{member[1][3]} ({member[1][4]})</p>
                }
            </div>
          ))}
        </div>

        <div className="py-16 flex justify-end gap-8">
          { !isItoEnd &&
            <Button 
              variant="contained" 
              color="success"
              onClick={() => setOpen(true)}
            >
              結果
            </Button>
          }
          <Dialog open={open}>
            <DialogTitle>結果を見ますか?</DialogTitle>
            <DialogActions>
              <Button variant="contained" color="primary" onClick={() => {setOpen(false); setIsDisplayNumber(true); setIsItoEnd(true)}}>
                はい
              </Button>
              <Button variant="contained" color="error" onClick={() => {setOpen(false)}}>
                いいえ
              </Button>
            </DialogActions>
          </Dialog>
          <Button 
            variant="contained" 
            color="error"
            onClick={() => gameEnd()}
            disabled={!isItoEnd}
          >
            終了
          </Button>
        <div>

    </div>
        </div>
      </div>
    </div>
  )
}

export default Game