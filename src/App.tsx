import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { collection, doc } from "firebase/firestore";
import "./App.css"
import { db, auth } from "./firebase"
import CircularProgress from '@mui/material/CircularProgress';

// コンポーネント
import Header from "./components/Header"
import Footer from "./components/Footer"

// シーン
import Logout from "./scene/Logout";
import Start from "./scene/Start";
import Ready from "./scene/Ready";
import Setting from "./scene/Setting";
import Game from "./scene/Game";

function App() {
  const [user, loading] = useAuthState(auth);
  const [scene, setScene] = useState<string>("");

  const userDocmentRef = user ? doc(db, "users", user.uid) : null;
  // users
  const [userData] = useDocumentData(userDocmentRef, {});
  const [handleName, setHandleName] = useState<string>("");
  
  // rooms
  const roomsCollectionRef = collection(db, "rooms");
  const enteringRoomDocmentRef = userData ? doc(db, "rooms", `room${userData.enteringRoom}`) : null;
  const [roomsData] = useCollectionData(roomsCollectionRef);
  const [enteringRoomData] = useDocumentData(enteringRoomDocmentRef, {});
  const [theme, setTheme] = useState<string>("")

  // others  
  const [isStatable, setIsStatable] = useState<boolean>(false);

  // users/user?.uidの監視
  useEffect(() => {
    if (userData) {
      const userScene = userData.scene || "";
      setScene(userScene);
      setHandleName(userData?.handleName.slice(0, 8));
    } else {
      setScene("logout");
    }
  }, [userData]);

  // rooms/enteringRoomの監視
  useEffect(()=>{
    if (enteringRoomData?.members) {
      const members = enteringRoomData?.members;
      const hasFalseValues = Object.values<[string, boolean]>(members).some(([_, booleanValue]) => booleanValue === false);
      if(hasFalseValues || enteringRoomData.playerCount < 2) {
        setIsStatable(false);
      } else {
        setIsStatable(true);
      }
      setTheme(enteringRoomData?.theme);
    }
  }, [enteringRoomData])

  return (
    <>
      <Header user={user} />
      <div className={`relative max-w-[500px] w-[90vw] ${scene!=="game" ? "h-[500px]" : "h-max"} mx-auto my-[100px] outline outline-2`}>
      { loading &&
        <div className="abslute w-[100%] h-[100%] flex justify-center items-center">
          <CircularProgress />
        </div>
      }
      {scene == "logout" && <Logout />}
      {scene == "start" && userData && roomsData && <Start userData={userData} roomsData={roomsData} handleName={handleName} setHandleName={setHandleName}/>}
      {scene == "ready" && userData && enteringRoomData && <Ready userData={userData} enteringRoomData={enteringRoomData} isStartable={isStatable}/>}
      {scene == "setting" && userData && enteringRoomData && <Setting userData={userData} enteringRoomData={enteringRoomData} theme={theme} setTheme={setTheme}/>}
      {scene == "game" && userData && enteringRoomData && <Game userData={userData} enteringRoomData={enteringRoomData} />}
    </div>
      <Footer />
    </>
  )
}

export default App
