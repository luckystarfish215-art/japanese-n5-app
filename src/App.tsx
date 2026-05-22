import { useEffect, useMemo, useState } from 'react';

type KanaType = 'gojuon' | 'dakuon' | 'youon' | 'sokuon';
type Example = { word: string; romaji: string; zh: string; en: string; emoji: string };
type KanaItem = { char: string; romaji: string; type: KanaType; group: string; note?: string; examples: Example[] };
type Question = { prompt: string; speak: string; correct: string; options: string[]; hint: string };

const STORAGE_KEY = 'kana-quest-progress-v1';

const gojuon: KanaItem[] = [
  ['あ','a','A','あい','ai','愛','love','❤️'], ['い','i','A','いえ','ie','家','house','🏠'], ['う','u','A','うみ','umi','海','sea','🌊'], ['え','e','A','えき','eki','車站','station','🚉'], ['お','o','A','おと','oto','聲音','sound','🔊'],
  ['か','ka','KA','かさ','kasa','雨傘','umbrella','☂️'], ['き','ki','KA','き','ki','樹','tree','🌳'], ['く','ku','KA','くち','kuchi','嘴巴','mouth','👄'], ['け','ke','KA','け','ke','毛髮','hair','🪮'], ['こ','ko','KA','ここ','koko','這裡','here','📍'],
  ['さ','sa','SA','さかな','sakana','魚','fish','🐟'], ['し','shi','SA','すし','sushi','壽司','sushi','🍣'], ['す','su','SA','すいか','suika','西瓜','watermelon','🍉'], ['せ','se','SA','せかい','sekai','世界','world','🌏'], ['そ','so','SA','そら','sora','天空','sky','🌤️'],
  ['た','ta','TA','たこ','tako','章魚','octopus','🐙'], ['ち','chi','TA','ちち','chichi','爸爸','father','👨'], ['つ','tsu','TA','つき','tsuki','月亮','moon','🌙'], ['て','te','TA','て','te','手','hand','✋'], ['と','to','TA','とり','tori','鳥','bird','🐦'],
  ['な','na','NA','なつ','natsu','夏天','summer','☀️'], ['に','ni','NA','にく','niku','肉','meat','🥩'], ['ぬ','nu','NA','いぬ','inu','狗','dog','🐶'], ['ね','ne','NA','ねこ','neko','貓','cat','🐱'], ['の','no','NA','のり','nori','海苔','seaweed','🍙'],
  ['は','ha','HA','はな','hana','花 / 鼻','flower / nose','🌸'], ['ひ','hi','HA','ひと','hito','人','person','👤'], ['ふ','fu','HA','ふゆ','fuyu','冬天','winter','❄️'], ['へ','he','HA','へや','heya','房間','room','🚪'], ['ほ','ho','HA','ほし','hoshi','星星','star','⭐'],
  ['ま','ma','MA','まち','machi','城鎮','town','🏘️'], ['み','mi','MA','みず','mizu','水','water','💧'], ['む','mu','MA','むし','mushi','昆蟲','bug','🐛'], ['め','me','MA','め','me','眼睛','eye','👁️'], ['も','mo','MA','もも','momo','桃','peach','🍑'],
  ['や','ya','YA','やま','yama','山','mountain','🗻'], ['ゆ','yu','YA','ゆき','yuki','雪','snow','❄️'], ['よ','yo','YA','よる','yoru','夜晚','night','🌙'],
  ['ら','ra','RA','さくら','sakura','櫻花','cherry blossom','🌸'], ['り','ri','RA','りす','risu','松鼠','squirrel','🐿️'], ['る','ru','RA','はる','haru','春天','spring','🌱'], ['れ','re','RA','れきし','rekishi','歷史','history','📜'], ['ろ','ro','RA','ろく','roku','六','six','6️⃣'],
  ['わ','wa','WA','わたし','watashi','我','I','🙋'], ['を','wo','WA','ほんをよむ','hon o yomu','讀書','read a book','📖'], ['ん','n','N','ほん','hon','書','book','📚']
].map(([char, romaji, group, word, wromaji, zh, en, emoji]) => ({ char, romaji, type: 'gojuon', group, examples: [{ word, romaji: wromaji, zh, en, emoji }] } as KanaItem));

const dakuon: KanaItem[] = [
  ['が','ga','G','か + ゛','がっこう','gakkou','學校','school','🏫'], ['ぎ','gi','G','き + ゛','ぎんこう','ginkou','銀行','bank','🏦'], ['ぐ','gu','G','く + ゛','ぐあい','guai','情況','condition','🩺'], ['げ','ge','G','け + ゛','げんき','genki','精神 / 健康','well','💪'], ['ご','go','G','こ + ゛','ごはん','gohan','飯','rice / meal','🍚'],
  ['ざ','za','Z','さ + ゛','ざっし','zasshi','雜誌','magazine','📰'], ['じ','ji','Z','し + ゛','じかん','jikan','時間','time','⏰'], ['ず','zu','Z','す + ゛','みず','mizu','水','water','💧'], ['ぜ','ze','Z','せ + ゛','ぜんぶ','zenbu','全部','all','✅'], ['ぞ','zo','Z','そ + ゛','ぞう','zou','大象','elephant','🐘'],
  ['だ','da','D','た + ゛','だれ','dare','誰','who','❓'], ['ぢ','ji','D','ち + ゛，少見','ちぢむ','chijimu','縮小','shrink','↘️'], ['づ','zu','D','つ + ゛，少見','つづく','tsuzuku','繼續','continue','➡️'], ['で','de','D','て + ゛','でんしゃ','densha','電車','train','🚃'], ['ど','do','D','と + ゛','どこ','doko','哪裡','where','📍'],
  ['ば','ba','B','は + ゛','ばん','ban','晚上 / 號碼','night / number','🌃'], ['び','bi','B','ひ + ゛','びょういん','byouin','醫院','hospital','🏥'], ['ぶ','bu','B','ふ + ゛','ぶた','buta','豬','pig','🐷'], ['べ','be','B','へ + ゛','べんきょう','benkyou','學習','study','✏️'], ['ぼ','bo','B','ほ + ゛','ぼうし','boushi','帽子','hat','🧢'],
  ['ぱ','pa','P','は + ゜','パン','pan','麵包','bread','🍞'], ['ぴ','pi','P','ひ + ゜','ぴかぴか','pikapika','閃亮','shiny','✨'], ['ぷ','pu','P','ふ + ゜','ぷにぷに','punipuni','軟綿綿','squishy','🫧'], ['ぺ','pe','P','へ + ゜','ペン','pen','筆','pen','🖊️'], ['ぽ','po','P','ほ + ゜','さんぽ','sanpo','散步','walk','🚶']
].map(([char, romaji, group, note, word, wromaji, zh, en, emoji]) => ({ char, romaji, type: 'dakuon', group, note, examples: [{ word, romaji: wromaji, zh, en, emoji }] } as KanaItem));

const youon: KanaItem[] = [
  ['きゃ','kya','き + 小ゃ','きゃく','kyaku','客人','guest','🧑‍🤝‍🧑'], ['きゅ','kyu','き + 小ゅ','きゅう','kyuu','九 / 休','nine / rest','9️⃣'], ['きょ','kyo','き + 小ょ','きょう','kyou','今天','today','📅'],
  ['しゃ','sha','し + 小ゃ','しゃしん','shashin','相片','photo','📷'], ['しゅ','shu','し + 小ゅ','しゅくだい','shukudai','功課','homework','📚'], ['しょ','sho','し + 小ょ','しょくどう','shokudou','飯堂','cafeteria','🍽️'],
  ['ちゃ','cha','ち + 小ゃ','おちゃ','ocha','茶','tea','🍵'], ['ちゅ','chu','ち + 小ゅ','ちゅうがく','chuugaku','中學','junior high','🏫'], ['ちょ','cho','ち + 小ょ','ちょっと','chotto','一點點 / 等等','a little','🤏'],
  ['にゃ','nya','に + 小ゃ','にゃあ','nyaa','喵','meow','🐱'], ['にゅ','nyu','に + 小ゅ','にゅうがく','nyuugaku','入學','enter school','🎒'], ['にょ','nyo','に + 小ょ','にょう','nyou','音讀例','nyou sound','🔤'],
  ['ひゃ','hya','ひ + 小ゃ','ひゃく','hyaku','一百','hundred','💯'], ['ひゅ','hyu','ひ + 小ゅ','ひゅう','hyuu','風聲','whoosh','💨'], ['ひょ','hyo','ひ + 小ょ','ひょう','hyou','表 / 冰雹','table / hail','📋'],
  ['みゃ','mya','み + 小ゃ','みゃく','myaku','脈','pulse','💓'], ['みゅ','myu','み + 小ゅ','ミュージック','myuujikku','音樂','music','🎵'], ['みょ','myo','み + 小ょ','みょうじ','myouji','姓氏','surname','🪪'],
  ['りゃ','rya','り + 小ゃ','りゃく','ryaku','省略','abbreviation','✂️'], ['りゅ','ryu','り + 小ゅ','りゅう','ryuu','龍 / 流','dragon / style','🐉'], ['りょ','ryo','り + 小ょ','りょこう','ryokou','旅行','travel','🧳'],
  ['ぎゃ','gya','ぎ + 小ゃ','ぎゃく','gyaku','相反','opposite','🔁'], ['ぎゅ','gyu','ぎ + 小ゅ','ぎゅうにゅう','gyuunyuu','牛奶','milk','🥛'], ['ぎょ','gyo','ぎ + 小ょ','ぎょうざ','gyouza','餃子','dumplings','🥟'],
  ['じゃ','ja','じ + 小ゃ','じゃあ','jaa','那麼','well then','➡️'], ['じゅ','ju','じ + 小ゅ','じゅう','juu','十','ten','🔟'], ['じょ','jo','じ + 小ょ','じょうず','jouzu','擅長','skillful','👏'],
  ['びゃ','bya','び + 小ゃ','びゃく','byaku','白的音讀','white reading','⚪'], ['びゅ','byu','び + 小ゅ','デビュー','debyuu','出道','debut','🎤'], ['びょ','byo','び + 小ょ','びょういん','byouin','醫院','hospital','🏥'],
  ['ぴゃ','pya','ぴ + 小ゃ','ぴゃっ','pya','擬聲例','sound effect','💥'], ['ぴゅ','pyu','ぴ + 小ゅ','ぴゅう','pyuu','風聲','whoosh','💨'], ['ぴょ','pyo','ぴ + 小ょ','ぴょん','pyon','跳一下','hop','🐰']
].map(([char, romaji, note, word, wromaji, zh, en, emoji]) => ({ char, romaji, type: 'youon', group: 'YOUON', note, examples: [{ word, romaji: wromaji, zh, en, emoji }] } as KanaItem));

const sokuon: KanaItem[] = [
  { char: 'っか', romaji: 'kka', type: 'sokuon', group: 'small tsu', note: '小っ = 停一拍，再爆破下一個音', examples: [{ word: 'がっこう', romaji: 'gakkou', zh: '學校', en: 'school', emoji: '🏫' }, { word: 'にっき', romaji: 'nikki', zh: '日記', en: 'diary', emoji: '📓' }] },
  { char: 'っさ', romaji: 'ssa', type: 'sokuon', group: 'small tsu', note: '下一個子音加倍，例如 ss', examples: [{ word: 'ざっし', romaji: 'zasshi', zh: '雜誌', en: 'magazine', emoji: '📰' }] },
  { char: 'った', romaji: 'tta', type: 'sokuon', group: 'small tsu', note: '下一個子音加倍，例如 tt', examples: [{ word: 'きって', romaji: 'kitte', zh: '郵票', en: 'stamp', emoji: '🏷️' }] },
  { char: 'っぱ', romaji: 'ppa', type: 'sokuon', group: 'small tsu', note: '下一個子音加倍，例如 pp', examples: [{ word: 'いっぱい', romaji: 'ippai', zh: '很多 / 一杯', en: 'full / one cup', emoji: '🥤' }] },
  { char: 'っちゃ', romaji: 'ccha', type: 'sokuon', group: 'small tsu + youon', note: '小っ + 拗音，例如 ccha', examples: [{ word: 'ちょっと', romaji: 'chotto', zh: '一點點 / 等等', en: 'a little', emoji: '🤏' }] }
];

const allKana = [...gojuon, ...dakuon, ...youon, ...sokuon];
const tabs = [
  { id: 'gojuon' as KanaType, label: '基本', en: 'Gojuon', icon: 'あ' },
  { id: 'dakuon' as KanaType, label: '濁音', en: 'Dakuon', icon: 'が' },
  { id: 'youon' as KanaType, label: '拗音', en: 'Youon', icon: 'きゃ' },
  { id: 'sokuon' as KanaType, label: '促音', en: 'Sokuon', icon: 'っ' }
];

function shuffle<T>(arr: T[]) { return [...arr].sort(() => Math.random() - 0.5); }
function speak(text: string) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'ja-JP';
  u.rate = 0.82;
  window.speechSynthesis.speak(u);
}
function loadProgress(): Record<string, number> {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch { return {}; }
}

export default function App() {
  const [tab, setTab] = useState<KanaType>('gojuon');
  const [view, setView] = useState<'home' | 'learn' | 'drill'>('home');
  const [selected, setSelected] = useState<KanaItem | null>(null);
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [questions, setQuestions] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState('');
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => setProgress(loadProgress()), []);
  useEffect(() => localStorage.setItem(STORAGE_KEY, JSON.stringify(progress)), [progress]);

  const list = useMemo(() => allKana.filter(k => k.type === tab), [tab]);
  const studied = Object.values(progress).filter(v => v > 0).length;
  const percent = Math.round((studied / allKana.length) * 100);

  function openKana(item: KanaItem) {
    setSelected(item);
    setProgress(p => ({ ...p, [item.char]: (p[item.char] || 0) + 1 }));
    setView('learn');
  }

  function startDrill(scope: KanaType = tab) {
    const pool = allKana.filter(k => k.type === scope);
    const allRomaji = allKana.map(k => k.romaji);
    const qs = shuffle(pool).slice(0, Math.min(10, pool.length)).map((item, i) => {
      const ex = item.examples[0];
      const useWord = i % 3 === 0;
      const correct = useWord ? ex.romaji : item.romaji;
      return {
        prompt: useWord ? ex.word : item.char,
        speak: useWord ? ex.word : item.char,
        correct,
        options: shuffle([correct, ...shuffle(allRomaji.filter(r => r !== correct)).slice(0, 3)]),
        hint: useWord ? `${ex.emoji} ${ex.zh} / ${ex.en}` : (item.note || `${item.char} = ${item.romaji}`)
      };
    });
    setQuestions(qs); setIndex(0); setPicked(''); setChecked(false); setScore(0); setView('drill');
  }

  function checkAnswer() {
    if (!picked) return;
    if (!checked) {
      if (picked === questions[index].correct) setScore(s => s + 1);
      setChecked(true);
      return;
    }
    if (index + 1 < questions.length) { setIndex(i => i + 1); setPicked(''); setChecked(false); }
    else { setIndex(questions.length); }
  }

  const finished = view === 'drill' && questions.length > 0 && index >= questions.length;

  if (view === 'learn' && selected) {
    return <main className="screen dark-screen">
      <div className="phone dark-phone">
        <header className="topbar"><button onClick={() => setView('home')}>‹</button><div><small>LEARN CARD</small><h2>{selected.type.toUpperCase()}</h2></div><button onClick={() => speak(selected.char)}>🔊</button></header>
        <section className="hero-card">
          <div><div className="big-kana">{selected.char}</div><div className="romaji-large">{selected.romaji}</div></div>
          <div className="rule"><small>RULE</small><b>{selected.note || `${selected.group} row`}</b></div>
        </section>
        <section className="actions"><button onClick={() => speak(selected.char)}>🔊 聽單音</button><button onClick={() => startDrill(selected.type)}>✨ 練這組</button></section>
        <section className="sheet"><h2>例字 Examples</h2>{selected.examples.map(ex => <button className="example" onClick={() => speak(ex.word)} key={ex.word}><span>{ex.emoji}</span><div><b>{ex.word}</b><code>{ex.romaji}</code><p>{ex.zh} / {ex.en}</p></div><i>🔊</i></button>)}<div className="tip"><b>學習提示</b><p>{selected.type === 'dakuon' ? '濁音是在假名右上加 ゛ 或 ゜，聲音會變濁，例如 か ka → が ga。' : selected.type === 'youon' ? '拗音的第二個假名要寫小，例如 きや = kiya，但 きゃ = kya。' : selected.type === 'sokuon' ? '促音小っ 讀音停一拍，羅馬音通常把下一個子音寫兩次。' : '先熟基本五十音，再學濁音、拗音和促音會容易很多。'}</p></div></section>
      </div>
    </main>;
  }

  if (view === 'drill' && questions.length && !finished) {
    const q = questions[index];
    return <main className="screen"><div className="phone drill-phone"><header className="drill-head"><button onClick={() => setView('home')}>✕</button><div className="progress"><div><span>{index + 1}/{questions.length}</span><span>{score} correct</span></div><meter min="0" max={questions.length} value={index + 1} /></div><button onClick={() => speak(q.speak)}>🔊</button></header><section className="question"><small>CHOOSE ROMAJI</small><div>{q.prompt}</div><p>{q.hint}</p></section><section className="options">{q.options.map(o => <button key={o} disabled={checked} onClick={() => setPicked(o)} className={`${picked === o ? 'picked' : ''} ${checked && o === q.correct ? 'right' : ''} ${checked && picked === o && o !== q.correct ? 'wrong' : ''}`}>{o}</button>)}</section>{checked && <div className={picked === q.correct ? 'feedback ok' : 'feedback no'}>{picked === q.correct ? '答對！' : `不對，正確答案是 ${q.correct}`}</div>}<button className="primary" disabled={!picked} onClick={checkAnswer}>{checked ? '下一題' : '確認答案'}</button></div></main>;
  }

  if (finished) {
    return <main className="screen dark-screen"><div className="phone result"><div className="trophy">✨</div><small>DRILL COMPLETE</small><h1>完成練習</h1><p>今次分數</p><div className="score">{score}<span>/{questions.length}</span></div><div className="result-buttons"><button onClick={() => startDrill(tab)}>再試</button><button onClick={() => setView('home')}>返回</button></div></div></main>;
  }

  return <main className="screen"><div className="phone">
    <header className="home-hero"><small>KANA QUEST</small><div className="hero-row"><h1>日語假名訓練</h1><button onClick={() => startDrill(tab)}>Drill</button></div><div className="stats"><div><span>學習進度</span><b>{percent}%</b></div><p>{studied} / {allKana.length}<br/>已打開假名</p></div><div className="bar"><i style={{ width: `${percent}%` }} /></div></header>
    <nav className="tabs">{tabs.map(t => <button key={t.id} onClick={() => setTab(t.id)} className={tab === t.id ? 'active' : ''}><b>{t.icon}</b><span>{t.label}</span><small>{t.en}</small></button>)}</nav>
    <section className="section-title"><div><h2>{tabs.find(t => t.id === tab)?.label}練習卡</h2><p>{tab === 'sokuon' ? '小っ 不是發音，是停一拍' : '點擊卡片聽發音及看例字'}</p></div><b>{list.length} 張</b></section>
    <section className={tab === 'sokuon' ? 'kana-list wide' : 'kana-list'}>{list.map(item => <button key={`${item.type}-${item.char}`} onClick={() => openKana(item)} className={progress[item.char] ? 'seen' : ''}><em>{progress[item.char] || 0}</em><strong>{item.char}</strong><code>{item.romaji}</code>{item.note && <small>{item.note}</small>}</button>)}</section>
    <footer className="bottom"><button onClick={() => startDrill(tab)}>🎮 開始測驗</button><button onClick={() => speak('あいうえお')}>🎧</button></footer>
  </div></main>;
}
