import { db } from "../firebase"
import { DocumentData } from "firebase/firestore";
import { doc, getDoc } from "firebase/firestore";
import { updateDoc } from "firebase/firestore";
import { useState } from "react";

function Start({userData, roomsData, handleName, setHandleName} : {userData: DocumentData, roomsData : DocumentData[], handleName: string, setHandleName: any}) {
  // 連続でボタンを押せなくする
  const [isButtonAbled, setIsButtonAbled] = useState(true);

  const handleClick = () => {
    setIsButtonAbled(false);
    setTimeout(() => {
      setIsButtonAbled(true);
    }, 1000);
  }
  const enterRoom = async (roomIndex: number) => {
    // rooms/enteringRoomの更新
    const enteringRoomDocumentRef = doc(db, "rooms", `room${roomIndex}`);
    try {
      const enteringRoomSnapshot = await getDoc(enteringRoomDocumentRef);
      const enteringRoomData = enteringRoomSnapshot.data();
      if (enteringRoomData) {
        if (enteringRoomData.playerCount >= 6 || enteringRoomData.status === "full" || enteringRoomData.status === "game") {
          return 
        }
        let status: string = "";
        if(enteringRoomData.playerCount == 5){
          status = "full";
        } else { 
          status = "recruit";
        }
        
        if(enteringRoomData.playerCount == 0) {
          await updateDoc(enteringRoomDocumentRef, {
            host: userData?.uid
          });
        }
        // ルームにユーザーを追加
        await updateDoc(enteringRoomDocumentRef, {
          [`members.${userData?.uid}`]: [handleName, false, "キーワード", -1, -1],
          playerCount: Object.entries(enteringRoomData?.members).length + 1,
          status: status,
        });
      };
    } catch (error) {
      console.error("Error entering room:", error);
    }

    // users/user?.uidのシーン遷移
    const usersDocumentRef = doc(db, "users", userData?.uid); 
    await updateDoc(usersDocumentRef,  {
        handleName: handleName.slice(0,8),
        enteringRoom: roomIndex,
        scene: "ready"
      }
    );
  };


  return (
    <div className="w-[90%] md:w-[70%] mx-auto pt-[70px]">
      {/* ルームボックス */}
      <div className="relative h-[260px] border-black border-[2px] mb-[40px] flex flex-wrap justify-around overflow-x-hidden cursor-pointer">
        {handleName.trim() === "" && 
          <div className="absolute w-[100%] h-[424px] bg-gray-500 opacity-60 flex justify-center items-center"></div>
        }
        {roomsData.map((roomData: any, roomIndex: number) => (
          <div key={roomIndex} 
            className={`w-[42%] p-4 mx-2 my-4 rounded-lg shadow-lg transition-all ${
              roomData.status === "free" ? "bg-blue-200 hover:bg-blue-400"
            : roomData.status === "recruit" ? "bg-green-200 hover:bg-green-400"
            : roomData.status === "full" ? "bg-red-200"
            : "bg-yellow-200"
            }`}
            onClick={() => {isButtonAbled && handleName.trim() !== "" && enterRoom(roomIndex); handleClick()}}
          >
            <p className="font-bold border-black border-b-[1px] mb-2">ルーム { roomIndex+1 }</p>
            <p className="mb-1 text-sm">人数 : { roomData.playerCount } / 6</p>
            <p className="text-sm">状態 :
              <span>
                  {
                    roomData.status === "free" ? " 空室"
                    : roomData.status === "recruit" ? " 募集中"
                    : roomData.status === "full" ? " 満室"
                    : "ゲーム中"
                  }
              </span>
            </p>
          </div>
        ))}
      </div>

      <div>
        <div className="w-max mx-auto">
          <p className="mb-2">名前を入力してください (最大8文字) <span className="text-xs text-red-700">必須</span></p>
          <input type="text"
            placeholder="名前"
            onChange={(e) => setHandleName(e.target.value)}
            value={handleName}
            maxLength={8}
            className="w-[200px] border-black border-b-[1px] focus:border-purple-700 focus:border-b-[2px] outline-none"
          />
        </div>
      </div>

    </div>
  )
}

export default Start