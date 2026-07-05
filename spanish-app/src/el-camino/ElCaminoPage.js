import { useEffect, useRef, useState } from "react";
import { createElCaminoGame } from "./game/createElCaminoGame";
import "./el-camino.css";
import SpeechButton from "../speech.js";

function getMapBounds(areas = []) {
  if (!areas.length) return { minX: 0, minY: 0, width: 1, height: 1 };
  const xs = areas.map((area) => area.position?.x || 0);
  const ys = areas.map((area) => area.position?.y || 0);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  return {
    minX,
    minY,
    width: maxX - minX + 1,
    height: maxY - minY + 1
  };
}

function getAreaMapStyle(area) {
  const maxSide = Math.max(area.width, area.height, 1);
  const tileSize = Math.max(3, Math.floor(84 / maxSide));
  return {
    gridTemplateColumns: `repeat(${area.width}, ${tileSize}px)`,
    gridTemplateRows: `repeat(${area.height}, ${tileSize}px)`
  };
}

export default function ElCaminoPage({ onExit }) {
  const gameHostRef = useRef(null);
  const gameRef = useRef(null);
  const holdTimerRef = useRef(null);
  const questionPromptRef = useRef(null);
  const speechRecognitionRef = useRef(null);
  const [statusText, setStatusText] = useState(null);
  const [questionPrompt, setQuestionPrompt] = useState(null);
  const [questionFeedback, setQuestionFeedback] = useState(null);
  const [answerText, setAnswerText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [playerProgress, setPlayerProgress] = useState({ coins: 0, inventory: [], badges: [], objective: "Loading El Camino..." });
  const [openPanel, setOpenPanel] = useState(null);
  const [bagTab, setBagTab] = useState("items");
  const [cantSpeak, setCantSpeak] = useState(false);

  useEffect(() => {
    if (!gameHostRef.current || gameRef.current) return;

    const game = createElCaminoGame(gameHostRef.current);
    gameRef.current = game;

    const handleStatus = (message) => {
      if (message && questionPromptRef.current) {
        setQuestionFeedback(message);
        return;
      }
      setStatusText(message);
      if (!message) setQuestionFeedback(null);
    };
    const handleQuestion = (question) => {
      questionPromptRef.current = question;
      setQuestionPrompt(question);
      setQuestionFeedback(null);
      setAnswerText("");
    };
    const handleProgress = (progress) => setPlayerProgress(progress);
    game.events.on("el-camino-status", handleStatus);
    game.events.on("el-camino-question", handleQuestion);
    game.events.on("el-camino-progress", handleProgress);

    return () => {
      stopHoldMove();
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.onresult = null;
        speechRecognitionRef.current.onerror = null;
        speechRecognitionRef.current.onend = null;
        speechRecognitionRef.current.stop();
        speechRecognitionRef.current = null;
      }
      game.events.off("el-camino-status", handleStatus);
      game.events.off("el-camino-question", handleQuestion);
      game.events.off("el-camino-progress", handleProgress);
      game.destroy(true);
      gameRef.current = null;
    };
  }, []);

  function sendMove(direction) {
    gameRef.current?.events.emit("el-camino-move", direction);
  }

  function sendChoice(index) {
    setQuestionFeedback(null);
    gameRef.current?.events.emit("el-camino-answer", index);
  }

  function sendAnswer(answer) {
    if (!answer?.trim()) {
      setQuestionFeedback("No te escuché. Intenta otra vez.");
      return;
    }
    setQuestionFeedback(null);
    gameRef.current?.events.emit("el-camino-answer", answer);
  }

  function returnToPlaza() {
    stopHoldMove();
    setOpenPanel(null);
    setQuestionFeedback(null);
    gameRef.current?.events.emit("el-camino-return-home");
  }

  function closeQuestionPrompt() {
    questionPromptRef.current = null;
    setQuestionPrompt(null);
    setQuestionFeedback(null);
    setAnswerText("");
  }

  function speakSpanish(text) {
    if (!text || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "es-MX";
    utterance.rate = 0.86;
    window.speechSynthesis.speak(utterance);
  }

  function startSpeechAnswer() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setQuestionFeedback("Este navegador no soporta reconocimiento de voz.");
      return;
    }

    if (isListening && speechRecognitionRef.current) {
      speechRecognitionRef.current.stop();
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "es-ES";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    speechRecognitionRef.current = recognition;

    let heardAnswer = false;
    let hadError = false;
    setIsListening(true);
    setQuestionFeedback(null);

    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript || "";
      heardAnswer = transcript.trim().length > 0;
      setAnswerText(transcript);
      recognition.stop();
      sendAnswer(transcript);
    };
    recognition.onerror = (event) => {
      hadError = true;
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        setQuestionFeedback("No tengo permiso para usar el micrófono.");
      } else if (event.error !== "aborted") {
        setQuestionFeedback("No te escuché bien. Intenta otra vez.");
      }
    };
    recognition.onend = () => {
      setIsListening(false);
      speechRecognitionRef.current = null;
      if (!heardAnswer && !hadError) {
        setQuestionFeedback("No te escuché. Intenta otra vez.");
      }
    };
    recognition.start();
  }

  function startHoldMove(direction, event) {
    event.preventDefault();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    stopHoldMove();
    sendMove(direction);
    holdTimerRef.current = window.setInterval(() => sendMove(direction), 45);
  }

  function stopHoldMove() {
    if (holdTimerRef.current) {
      window.clearInterval(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  }

  function moveButton(direction, className, label, content) {
    return (
      <button
        className={`camino-control ${className}`}
        onPointerDown={(event) => startHoldMove(direction, event)}
        onPointerUp={stopHoldMove}
        onPointerCancel={stopHoldMove}
        onLostPointerCapture={stopHoldMove}
        aria-label={label}
      >
        {content}
      </button>
    );
  }

  function renderRichText(text) {

    const messages = []
    
    if (text.includes("<dialogue>")) {
      text = text.replaceAll("<dialogue>","");
      let lines = text.split("<break>");
      for (const line of lines) {
        let splits = line.split("<name>");
        let m = {}
        if (splits.length == 0) {
          m = {
            name:"Narrador",
            text:"..."
          }
        } else if (splits.length == 1) {
          m = {
            name:"Narrador",
            text:splits[0]
          }
        }
        else {
          m = {
            name:splits[0],
            text:splits[1]
          }
        }
        messages.push(m);
      }
    } else {
      return text;
    }
    
    return (
      <>
            {messages.map((m) => (
          <div className="el-camino-dialogue-line" key={m.name + m.text}>
            <span className="el-camino-dialogue-name">{m.name}:</span><div className="el-camino-dialogue-text">{m.text}</div>
          </div>
            ))}  
      </>
    )
  }

  function renderChapterMap() {
    const chapterMap = playerProgress.map;
    if (!chapterMap?.areas?.length) {
      return <div className="el-camino-panel-empty">Map is loading.</div>;
    }

    const bounds = getMapBounds(chapterMap.areas);

    return (
      <>
        <div className="el-camino-panel-title">Map: {chapterMap.title}</div>
        <div className="el-camino-map-objective">{playerProgress.objective}</div>
        <div
          className="el-camino-chapter-map"
          style={{
            width: `${bounds.width * 150}px`,
            height: `${bounds.height * 142}px`
          }}
        >
          {chapterMap.areas.map((area) => {
            const isCurrentArea = area.id === chapterMap.currentAreaId;
            const left = ((area.position?.x || 0) - bounds.minX) * 150;
            const top = ((area.position?.y || 0) - bounds.minY) * 142;

            return (
              <div
                className={`el-camino-map-area${isCurrentArea ? " current" : ""}`}
                key={area.id}
                style={{ left, top }}
              >
                <div className="el-camino-map-area-name">{area.name}</div>
                <div className="el-camino-mini-map" style={getAreaMapStyle(area)}>
                  {area.rows.flatMap((row, y) => row.split("").map((tileKey, x) => {
                    const isPlayer = isCurrentArea && chapterMap.player?.x === x && chapterMap.player?.y === y;
                    return (
                      <span
                        className={`el-camino-mini-tile${isPlayer ? " player" : ""}`}
                        key={`${area.id}-${x}-${y}`}
                        style={{ backgroundColor: area.legend[tileKey] || "#84cc16" }}
                      />
                    );
                  }))}
                </div>
                <div className="el-camino-map-links">
                  {area.exits.length ? area.exits.map((exit) => (
                    <span key={`${area.id}-${exit.targetArea}`}>
                      {exit.locked ? "🔒" : "→"} {chapterMap.areas.find((candidate) => candidate.id === exit.targetArea)?.name || exit.targetArea}
                    </span>
                  )) : <span>No chapter exits</span>}
                </div>
              </div>
            );
          })}
        </div>
        <div className="el-camino-map-legend">● You are here. Locked paths show 🔒.</div>
      </>
    );
  }

  return (
    <div className="el-camino-root">
      <button className="el-camino-exit-button" onClick={onExit} aria-label="Exit El Camino">
        ×
      </button>

      <button className="el-camino-plaza-button" onClick={returnToPlaza}>
        Plaza
      </button>

      <div className="el-camino-top-actions">

        <div className="el-camino-coin-counter" aria-label={`${playerProgress.coins || 0} coins`}>
          <span className="el-camino-coin-icon">●</span>
          <span>{playerProgress.coins || 0}</span>
        </div>

        <button className="el-camino-panel-button" onClick={() => setOpenPanel(openPanel === "map" ? null : "map")}>
          Map
        </button>
        <button className="el-camino-panel-button" onClick={() => setOpenPanel(openPanel === "inventory" ? null : "inventory")}>
          Bag
        </button>
        <button className="el-camino-panel-button" onClick={() => setOpenPanel(openPanel === "help" ? null : "help")}>
          Help
        </button>
      </div>

      {openPanel && (
        <div className={`el-camino-info-panel${openPanel === "map" ? " map" : ""}`}>
          <button className="el-camino-panel-close" onClick={() => setOpenPanel(null)} aria-label="Close panel">×</button>
          {openPanel === "inventory" && (
            <>
              <div className="el-camino-panel-title">Bag</div>
              <div className="el-camino-bag-tabs">
                <button className={bagTab === "items" ? "active" : ""} onClick={() => setBagTab("items")}>Items</button>
                <button className={bagTab === "badges" ? "active" : ""} onClick={() => setBagTab("badges")}>Badges</button>
              </div>
              {bagTab === "items" && playerProgress.inventory?.length ? (
                <div className="el-camino-inventory-list">
                  {playerProgress.inventory.map((item) => (
                    <div className="el-camino-inventory-item" key={item.itemId}>
                      <span>{item.count}× {item.name}</span>
                      <span>{item.spanish}</span>
                    </div>
                  ))}
                </div>
              ) : bagTab === "items" ? (
                <div className="el-camino-panel-empty">Your bag is empty.</div>
              ) : playerProgress.badges?.length ? (
                <div className="el-camino-inventory-list">
                  {playerProgress.badges.map((item) => (
                    <div className="el-camino-inventory-item" key={item.itemId}>
                      <span>🏅 {item.name}</span>
                      <span>{item.spanish}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="el-camino-panel-empty">No badges yet.</div>
              )}
            </>
          )}
          {openPanel === "map" && renderChapterMap()}
          {openPanel === "help" && (
            <>
              <div className="el-camino-panel-title">What to do next</div>
              <div className="el-camino-help-text">{playerProgress.objective}</div>
            </>
          )}
        </div>
      )}

      <div className="el-camino-game-host" ref={gameHostRef} />

      {statusText && !questionPrompt && <div className="el-camino-status-box">{renderRichText(statusText)}</div>}

      {questionPrompt && (
        <div className="el-camino-choice-box">
          <button className="el-camino-choice-box-close" onClick={closeQuestionPrompt} aria-label="Close prompt">×</button>
          
          {questionFeedback && <div className="el-camino-question-feedback">{renderRichText(questionFeedback)}</div>}
          {questionPrompt.audioText && (
            // <button className="el-camino-audio-button" onClick={() => speakSpanish(questionPrompt.audioText)}>
            //   🔊 Play Spanish
            // </button>
            <SpeechButton text={questionPrompt.audioText} inSpanish={true} big={true} />
          )}

          <div className="el-camino-choice-prompt">{questionPrompt.prompt}</div>

          {["choice", "audioChoice"].includes(questionPrompt.kind) && questionPrompt.options.map((option) => (
              <button
                key={option.index}
                className="el-camino-choice-button"
                onClick={() => sendChoice(option.index)}
              >
                {option.label}
              </button>
            ))}

          {(questionPrompt.kind === "text" || (questionPrompt.kind === "speech" && cantSpeak)) && (
            <form
              className="el-camino-answer-form"
              onKeyDown={(event) => event.stopPropagation()}
              onKeyUp={(event) => event.stopPropagation()}
              onSubmit={(event) => {
                event.preventDefault();
                event.stopPropagation();
                sendAnswer(answerText);
              }}
            >
              <input
                className="el-camino-answer-input"
                value={answerText}
                onChange={(event) => setAnswerText(event.target.value)}
                onKeyDown={(event) => event.stopPropagation()}
                onKeyUp={(event) => event.stopPropagation()}
                placeholder={questionPrompt.placeholder || "Type your answer"}
                autoComplete="off"
              />
              <button className="el-camino-submit-button" type="submit">Check</button>
            </form>
          )}

          {questionPrompt.kind === "speech" && !cantSpeak && (
            <div className="el-camino-speech-actions">
              <button className="el-camino-submit-button" onClick={startSpeechAnswer}>
                {isListening ? "Stop listening" : "Speak answer"}
              </button>
              <button className="el-camino-cant-speak-button" onClick={() => setCantSpeak(true)}>Can't speak</button>
              {answerText && <div className="el-camino-transcript">Heard: {answerText}</div>}
            </div>
          )}
        </div>
      )}

      <div className="el-camino-controls" aria-label="El Camino movement controls">
        {moveButton("up", "camino-up", "Move up", "▲")}
        {moveButton("left", "camino-left", "Move left", "◀")}
        {moveButton("right", "camino-right", "Move right", "▶")}
        {moveButton("down", "camino-down", "Move down", "▼")}
      </div>
    </div>
  );
}
