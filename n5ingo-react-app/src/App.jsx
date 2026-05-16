import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { CheckCircle2, XCircle, Volume2, Mic, RotateCcw } from "lucide-react";
import { motion } from "framer-motion";
import "./style.css";

const lessons = [
  {
    id: 1,
    title: "選擇聽到的內容",
    target: "たなかさんはわたしのともだちです",
    display: "田中さんはわたしの友達です。",
    romaji: "Tanaka san wa watashi no tomodachi desu.",
    zh: "田中先生是我的朋友。",
    chunks: [
      { jp: "たなか", romaji: "ta na ka" },
      { jp: "さん", romaji: "sa n" },
      { jp: "は", romaji: "wa" },
      { jp: "わたし", romaji: "wa ta shi" },
      { jp: "の", romaji: "no" },
      { jp: "ともだち", romaji: "to mo da chi" },
      { jp: "です", romaji: "de su" }
    ],
    distractors: [
      { jp: "みず", romaji: "mi zu" },
      { jp: "あかるい", romaji: "a ka ru i" },
      { jp: "ひと", romaji: "hi to" },
      { jp: "か", romaji: "ka" }
    ]
  },
  {
    id: 2,
    title: "選擇聽到的內容",
    target: "これはにほんごのほんです",
    display: "これは日本語の本です。",
    romaji: "Kore wa nihongo no hon desu.",
    zh: "這是日語書。",
    chunks: [
      { jp: "これ", romaji: "ko re" },
      { jp: "は", romaji: "wa" },
      { jp: "にほんご", romaji: "ni ho n go" },
      { jp: "の", romaji: "no" },
      { jp: "ほん", romaji: "ho n" },
      { jp: "です", romaji: "de su" }
    ],
    distractors: [
      { jp: "それ", romaji: "so re" },
      { jp: "かばん", romaji: "ka ba n" },
      { jp: "どこ", romaji: "do ko" }
    ]
  }
];

function shuffle(arr) {
  return arr
    .map((v) => ({ ...v, key: Math.random().toString(36).slice(2) }))
    .sort(() => Math.random() - 0.5);
}

function speakJapanese(text, slow = false) {
  if (!window.speechSynthesis) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "ja-JP";
  utterance.rate = slow ? 0.65 : 0.9;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

function normalizeJapanese(text) {
  return text
    .replace(/[。！？、\s]/g, "")
    .replace(/私/g, "わたし")
    .replace(/友達/g, "ともだち")
    .replace(/日本語/g, "にほんご")
    .replace(/本/g, "ほん")
    .toLowerCase();
}

function App() {
  const [lessonIndex, setLessonIndex] = useState(0);
  const [mode, setMode] = useState("listen");
  const lesson = lessons[lessonIndex];

  const [selected, setSelected] = useState([]);
  const [bank, setBank] = useState(() => shuffle([...lessons[0].chunks, ...lessons[0].distractors]));
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);

  const [speechText, setSpeechText] = useState("");
  const [listening, setListening] = useState(false);
  const [speechResult, setSpeechResult] = useState(null);

  const answer = selected.map((x) => x.jp).join("");
  const correct = answer === lesson.target;
  const progress = Math.round(((lessonIndex + (checked || speechResult ? 1 : 0)) / lessons.length) * 100);

  function chooseWord(item) {
    if (checked) return;
    setSelected([...selected, item]);
    setBank(bank.filter((x) => x.key !== item.key));
  }

  function removeWord(item) {
    if (checked) return;
    setBank([...bank, item]);
    setSelected(selected.filter((x) => x.key !== item.key));
  }

  function resetCurrent() {
    setSelected([]);
    setBank(shuffle([...lesson.chunks, ...lesson.distractors]));
    setChecked(false);
    setSpeechText("");
    setSpeechResult(null);
  }

  function nextLesson() {
    const next = lessonIndex + 1;
    if (next >= lessons.length) {
      resetCurrent();
      return;
    }
    const nextLesson = lessons[next];
    setLessonIndex(next);
    setSelected([]);
    setBank(shuffle([...nextLesson.chunks, ...nextLesson.distractors]));
    setChecked(false);
    setSpeechText("");
    setSpeechResult(null);
    setMode("listen");
  }

  function checkSentence() {
    setChecked(true);
    if (correct) setScore((s) => s + 1);
  }

  function startSpeechCheck() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechResult("unsupported");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "ja-JP";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    setListening(true);
    setSpeechText("");
    setSpeechResult(null);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setSpeechText(transcript);

      const heard = normalizeJapanese(transcript);
      const target = normalizeJapanese(lesson.display);
      const isGood = heard.includes(target) || target.includes(heard);

      setSpeechResult(isGood ? "good" : "tryAgain");
      if (isGood) setScore((s) => s + 1);
    };

    recognition.onerror = () => setSpeechResult("error");
    recognition.onend = () => setListening(false);
    recognition.start();
  }

  return (
    <div className="app">
      <div className="phone">
        <header className="topbar">
          <div className="logo">N5ingo</div>
          <div className="energy">⚡ {21 - lessonIndex}</div>
        </header>

        <div className="progress-wrap">
          <div className="progress">
            <div style={{ width: `${progress}%` }} />
          </div>
          <span>{progress}%</span>
        </div>

        <div className="mode-tabs">
          <button className={mode === "listen" ? "active" : ""} onClick={() => setMode("listen")}>聽力重組</button>
          <button className={mode === "speak" ? "active" : ""} onClick={() => setMode("speak")}>跟讀檢查</button>
        </div>

        {mode === "listen" && (
          <motion.main initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <h1>{lesson.title}</h1>

            <section className="speech-card">
              <div className="avatar">🧕</div>
              <button className="audio-bubble" onClick={() => speakJapanese(lesson.display)}>
                <Volume2 />
                <span>▁▂▃▅▆▅▃▂▁</span>
              </button>
              <button className="slow" onClick={() => speakJapanese(lesson.display, true)}>慢速</button>
            </section>

            <section className="answer-area">
              {selected.length === 0 && <p>點選下面詞卡，重組你聽到的句子</p>}
              {selected.map((item) => (
                <button key={item.key} className="word selected" onClick={() => removeWord(item)}>
                  <small>{item.romaji}</small>
                  <strong>{item.jp}</strong>
                </button>
              ))}
            </section>

            <section className="bank">
              {bank.map((item) => (
                <button key={item.key} className="word" onClick={() => chooseWord(item)}>
                  <small>{item.romaji}</small>
                  <strong>{item.jp}</strong>
                </button>
              ))}
            </section>

            {!checked && (
              <div className="actions">
                <button className="check" disabled={selected.length === 0} onClick={checkSentence}>檢查</button>
                <button className="reset" onClick={resetCurrent}><RotateCcw /></button>
              </div>
            )}

            {checked && (
              <div className={correct ? "result good" : "result bad"}>
                <h2>{correct ? <CheckCircle2 /> : <XCircle />} {correct ? "非常好！" : "差一點！"}</h2>
                <p>意思是：{lesson.zh}</p>
                <p>正確答案：{lesson.display}</p>
                <button onClick={nextLesson}>繼續</button>
              </div>
            )}
          </motion.main>
        )}

        {mode === "speak" && (
          <motion.main initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <h1>跟著例句讀出來</h1>

            <section className="read-card">
              <button onClick={() => speakJapanese(lesson.display)}>
                <Volume2 />
              </button>
              <div>
                <small>{lesson.romaji}</small>
                <h2>{lesson.display}</h2>
                <p>{lesson.zh}</p>
              </div>
            </section>

            <button className={listening ? "mic listening" : "mic"} onClick={startSpeechCheck}>
              <Mic />
            </button>

            <p className="hint">{listening ? "正在聽你朗讀……" : "按下麥克風開始朗讀"}</p>

            {speechText && (
              <section className="heard">
                <small>程式聽到：</small>
                <strong>{speechText}</strong>
              </section>
            )}

            {speechResult && (
              <section className={speechResult === "good" ? "speech-result good" : "speech-result warn"}>
                {speechResult === "good" && <h2>非常好！發音聽起來正確。</h2>}
                {speechResult === "tryAgain" && <h2>再試一次，可以慢一點讀。</h2>}
                {speechResult === "unsupported" && <h2>這個瀏覽器不支援語音辨識，請試 Chrome。</h2>}
                {speechResult === "error" && <h2>沒有聽清楚，請再試一次。</h2>}
                <button onClick={startSpeechCheck}>再讀一次</button>
              </section>
            )}
          </motion.main>
        )}

        <footer>分數：{score} · 零成本語音版本</footer>
      </div>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);