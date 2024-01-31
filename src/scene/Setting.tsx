import { useState } from "react";
import { DocumentData, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import CircularProgress from "@mui/material/CircularProgress";
import Button from "@mui/material/Button";

function Setting({ userData, enteringRoomData, theme, setTheme }: { userData: DocumentData, enteringRoomData: DocumentData, theme:string, setTheme:any }) {
  const [timeLimit, setTimeLimit] = useState<number>(1);
  const members: { [key: string]: any } = enteringRoomData?.members || {};

  const themes = [
    "コンビニの商品の人気",
    "100円ショップの商品の人気",
    "飲食店の人気",
    "駅の人気",
    "中華料理の人気",
    "学校給食の人気",
    "有名人の人気",
    "子供に人気なもの",
    "アニメ・漫画のキャラの人気",
    "ゲームキャラの人気",
    "キャラクターの人気",
    "プレゼント・お土産の人気",
    "建物の人気",
    "住みたい国や場所の人気",
    "アプリ・ウェブサービスの人気",
    "乗り物の人気",
    "俳優の人気",
    "悪役の人気",
    "食べ物の人気",
    "飲み物の人気",
    "生き物の人気",
    "おもちゃの人気",
    "電化製品の人気",
    "映画の人気",
    "ミュージシャンの人気",
    "お菓子・スイーツ・アイスの人気",
    "ペットの人気",
    "職業の人気",
    "おにぎりの具の人気",
    "パンの種類の人気",
    "趣味の人気",
    "メーカー（ブランド）の人気",
    "アニメ・漫画の人気",
    "ゲームの人気",
    "和食料理の人気",
    "洋食料理の人気",
    "歴史上の人物の人気",
    "声優の人気",
    "童話の人気",
    "歌・曲の人気",
    "映画の登場人物の人気",
    "アスリートの人気",
    "スポーツの人気",
    "テレビ番組の人気",
    "恋人にしたい職業の人気",
    "デートスポットの人気",
    "ハネムーンで行きたい場所の人気",
    "酒のつまみ・居酒屋メニューの人気",
    "化粧品の人気",
    "ボードゲームの人気",
    "資格・免許の人気",
    "旅行したい国や場所の人気",
    "旅行先に持っていきたいもの",
    "ゾンビと戦うときに持っていきたいもの",
    "無人島に持っていきたいもの",
    "一人暮らしに必要なもの",
    "美しいもの",
    "こわいもの",
    "楽しいこと",
    "嬉しいこと",
    "カバンに入っていたら嬉しいもの",
    "言われて嬉しい言葉",
    "なりたい生き物",
    "なりたい歴史上の人物",
    "なりたい有名人",
    "なりたいキャラ",
    "生き物の大きさ",
    "学校にあるものの大きさ",
    "歴史上の人物の強さ",
    "映画の登場人物の強さ",
    "生き物の強さ",
    "アニメ・漫画のキャラの強さ",
    "ゲームキャラの強さ",
    "強そうな言葉",
    "強そうな効果音",
    "有名人の年収・資産",
    "重そうなもの",
    "ボードゲームの（物理的な）重さ",
    "食べ物のカロリー",
    "モテる条件・特技",
    "やわらかそうなもの",
    "カッコいいもの",
    "カッコいいセリフ",
    "カッコいい苗字・名前",
    "かわいいもの",
    "小学生が好きな言葉",
    "中高生が好きな言葉",
    "人生で大切なもの・こと",
    "雪山で遭難したときにもっていたいもの",
    "地球観光に来た宇宙人にあげたいお土産",
    "テンションが上がるもの・こと",
    "時代遅れの言葉",
    "オタクが喜ぶセリフ・設定",
    "グッとくる仕草・行動",
    "結婚したい有名人",
    "結婚したいキャラ",
    "親になってほしいキャラ",
    "ほしい特殊能力・武器",
    "便利なもの",
    "されたいプロポーズ",
  ];

  const randomTheme = () => {
    const randomIndex = Math.floor(Math.random() * themes.length);
    setTheme(themes[randomIndex])
  }
  
  const gameStart = async() => {
    // 同じ部屋にいる人のシーン遷移
    const membersArray = Object.entries(members)
    membersArray.forEach(async(member, _) => {
      const userDocumentRef = doc(db, "users", member[0]);
      await updateDoc(userDocumentRef, {
        scene: "game",
      });
    });
    // ゲームルールの書き込み
    const enteringRoomDocumentRef = doc(db, "rooms", `room${userData?.enteringRoom}`);    
    await updateDoc(enteringRoomDocumentRef, {
      timeLimit: timeLimit,
      theme: theme.slice(0,20),
    });
  }

  return (
    <div>
      { userData?.uid === enteringRoomData?.host ? (
        <div>
          <div className="w-max mx-auto pt-[80px]">
            <div className="h-max">
              <p className="text-xs mb-2">※このページはホストにだけ表示されています</p>
              <p className="text-xl mb-2">お題📜</p>
              <div className="flex flex-col sm:flex-row">
                <input type="text"
                  placeholder="コンビニの商品の人気"
                  maxLength={ 20 }
                  value={ theme }
                  onChange={(e) => setTheme(e.target.value)}
                  className="w-[200px] mr-4 mb-2 border-black border-b-[1px] focus:border-purple-700 focus:border-b-[2px] outline-none"
                />
                <p
                  onClick={() => randomTheme()}
                  className="text-sm w-max border-gray-700 border-[1px] p-1 bg-gray-200 hover:bg-gray-400 transition-all cursor-pointer select-none"
                >ランダム生成</p>
              </div>
            </div>

            <div className="pt-12">
              <p className="text-xl mb-2">制限時間⌛</p>
              <input type="number"
                min="1" max="10"
                value={timeLimit}
                onChange={(e) => setTimeLimit(Number(e.target.value))}
                className="w-[40px] text-center border-black border-[1px] text-xl"
              /> 分
            </div>
            <div className="mt-[70px] float-right">
              <Button 
                variant="contained" 
                color="primary"
                onClick={() => gameStart()}
                disabled={theme.trim() === ""}
              >
                開始
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="h-[500px] flex flex-col justify-center w-max mx-auto">
          <p className="mb-8">ホストが設定をしています。</p>
          <div className="mx-auto">
            <CircularProgress />
          </div>
        </div>
      )}
    </div>
  )
}

export default Setting