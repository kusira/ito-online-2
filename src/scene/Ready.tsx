import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { DocumentData } from "firebase/firestore";
import Button from "@mui/material/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";


function Ready({ userData, enteringRoomData, isStartable }: { userData: DocumentData, enteringRoomData: DocumentData, isStartable: boolean }) {
  const members: { [key: string]: any } = enteringRoomData?.members || {};
  
  const exitRoom = async() => {
    // rooms/enteringRoomの更新
    const enteringRoomDocumentRef = doc(db, "rooms", `room${userData.enteringRoom}`);
    try {
      if (enteringRoomData) {
        let status: string = "";
        if(enteringRoomData.playerCount == 1){
          status = "free";
        } else { 
          status = "recruit";
        }
        delete members[userData?.uid]
        await updateDoc(enteringRoomDocumentRef, {
          members,
          playerCount: enteringRoomData.playerCount - 1,
          status: status,
        });
      };
    } catch (error) {
      console.error("Error exiting room:", error);
    }

    // users/user?.uidのシーン遷移
    const userDocumentRef = doc(db, "users", userData?.uid); 
    await updateDoc(userDocumentRef,  {
      enteringRoom: -1,
      scene: "start"
    });
  
    // ホスト権限の譲渡
    const nextHost = Object.keys(members || {}).filter(key => key !== userData?.uid)[0];
    await updateDoc(enteringRoomDocumentRef, {
      host: nextHost || "",
    });
  }

  // 準備の切り替え
  const handleReady = async() => {
    const enteringRoomDocumentRef = doc(db, "rooms", `room${userData?.enteringRoom}`);
    const newMembers = {...members };
    newMembers[userData?.uid][1] = !enteringRoomData.members[userData?.uid][1];
    await updateDoc(enteringRoomDocumentRef, {
      members: newMembers,
    });
  }

  // ゲームスタート
  const settingStart = async()=> {
    // 同じ部屋にいる人のシーン遷移
    const membersArray = Object.entries(members);
    membersArray.forEach(async(member, _) => {
      const userDocumentRef = doc(db, "users", member[0]);
      await updateDoc(userDocumentRef, {
        scene: "setting",
      });
    });
    
    // カードの割り当て
    const enteringRoomDocumentRef = doc(db, "rooms", `room${userData?.enteringRoom}`);
    const shuffleArray = (array) => {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
    };
    
    const originalArray = Array.from({ length: 100 }, (_, index) => index + 1);
    
    shuffleArray(originalArray);
    const cards = originalArray.slice(0, enteringRoomData?.playerCount );
    
    let newMembers = { ...members };
    function compareNumbers(a:number, b:number) {
      return a - b;
    }
    
    // カードに番号をつける
    const sortedCards = [...cards]
    sortedCards.sort(compareNumbers)
    const numberedCards:number[] = [];
    sortedCards.forEach((sortedCard, _)=>{
        numberedCards.push(cards.indexOf(sortedCard)+1)
    })
    console.log(cards)
    console.log(numberedCards)
    
    membersArray.forEach(async(member, index) => {
      newMembers[member[0]][3] = cards[index]
      newMembers[member[0]][4] = numberedCards[index]
    });

    // ゲームステータスの変更
    await updateDoc(enteringRoomDocumentRef, {
      members: newMembers,
      status: "game",
    });
  }

  return (
    <div className="w-[70%] mx-auto py-[40px]">
      <div
        onClick={() => exitRoom()}
        className="w-max text-xl text-red-600 underline hover:opacity-80 transition-all cursor-pointer"
      >↩退出する</div>
      <div>
        <div className="h-[260px] my-[30px] border-black border-2 overflow-y-scroll">
        {members && Object.entries(members).map((member: any, index: number) => (
          <div key={index} className="px-4 border-black border-b-[1px] flex justify-between">
            <p className="leading-[50px]"><span className="mr-4">{ index+1 }.</span>{ member[1][0] } <span>{ member[0]===enteringRoomData.host && " 👑"}</span></p>
            <p className=" mr-8 text-green-700 text-[26px] leading-[50px]">{ member[1][1] && "✓" }</p>
          </div>
        ))}
        </div>
        <div className="flex justify-around">
          <Button 
            variant="contained" 
            color="secondary"
            onClick={() => handleReady()}
          >{enteringRoomData && enteringRoomData.members && enteringRoomData.members[userData?.uid] && enteringRoomData.members[userData?.uid][1] ? "取り消す" : "準備OK"}
          </Button>

          {enteringRoomData && enteringRoomData.host && userData?.uid === enteringRoomData.host &&
            <Button 
              variant="contained" 
              color="primary"
              onClick={() => settingStart()}
              disabled={!isStartable}
            >開始<FontAwesomeIcon icon={faPaperPlane} className="pl-2"/>
            </Button>
          }

        </div>
      </div>
    </div>
  )
}

export default Ready