import { signInWithPopup, signOut } from "firebase/auth";
import { db, auth, googleProvider } from "../firebase";
import { User } from 'firebase/auth';
import { doc, setDoc, updateDoc } from "firebase/firestore";
import favicon from "../assets/favicon.png"

const AuthComponent = ({ user } : { user: User|null|undefined }) => {

  // サインイン時、ユーザの追加
  const addUser = async(user: User) => {
    const usersDocumentRef = doc(db, "users", user?.uid); 
    if(user && user?.displayName){
      await setDoc(usersDocumentRef,  {
          uid: user?.uid,
          handleName: user?.displayName.slice(0, 8),
          enteringRoom: -1,
          scene: "start"
        }
      );
    }
  }
  
  // サインアウト時、ユーザの初期化
  const initUser = async(user: User) => {
    const usersDocumentRef = doc(db, "users", user?.uid); 
    await updateDoc(usersDocumentRef,  {
        enteringRoom: -1,
        scene: "logout"
      }
    );
  }

  // サインイン
  const handleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      addUser(result.user)
      console.log("ログインしました", result.user);
    } catch (error) {
      console.error("ログインエラー", error);
    }
  };

  // サインアウト
  const handleSignOut = async () => {
    try {
      console.log("ログアウトしました")
      await signOut(auth);
      if(user){
        initUser(user)
      }
    } catch (error) {
      console.error("ログアウトエラー:", error);
    }
  };

  return (
    <div className="h-[80px] flex items-center">
      {user ? (
        <div className="w-[150px] flex justify-between">
          <img src={ user.photoURL || favicon } className="rounded-[50%]" width="40" height="40"/>
          <p onClick={ handleSignOut } className="text-white p-2 border-[1px] rounded-lg cursor-pointer">ログアウト</p>
        </div>
      ) : (
        <div>
          <button onClick={handleSignIn} className="text-white p-2 border-[1px] rounded-lg cursor-pointer">ログイン</button>
        </div>
      )}
    </div>
  );
};

export default AuthComponent;