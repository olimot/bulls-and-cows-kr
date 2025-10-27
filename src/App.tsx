import { useEffect, useRef, useState } from "react";

const createTheNumber = () => {
  const ns = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];
  const theNumber: number[] = [];
  for (let i = 0; i < 4; i += 1) {
    theNumber.push(...ns.splice(Math.floor(Math.random() * ns.length), 1));
  }
  return theNumber;
};

const mapToDigit = (value: string): number | null => {
  if (!value) return null;
  const digit = parseInt(value, 10);
  return Number.isInteger(digit) && digit >= 0 && digit < 10 ? digit : NaN;
};

export default function App() {
  const [theNumber, setTheNumber] = useState(createTheNumber);
  const [values, setValues] = useState<(number | null)[]>(Array(4).fill(null));
  const [history, setHistory] = useState<number[][]>([]);
  const [message, setMessage] = useState("");
  const firstInputRef = useRef<HTMLInputElement>(null);
  const resetButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (history.length || values.some((it) => it !== null)) return;
    firstInputRef.current?.focus();
  }, [values, history]);

  const onHit = () => {
    if (!values.every((it): it is number => it !== null)) {
      setMessage("제대로 입력하세요!");
    } else {
      const alreadyTried = history.findIndex((values0) =>
        values0.every((x, i) => (i < 4 ? x === values[i] : true))
      );
      if (alreadyTried !== -1) {
        setMessage(`${alreadyTried + 1}회차에 이미 시도했어요.`);
        firstInputRef.current?.focus();
      } else if (new Set(values).size !== 4) {
        setMessage("입력에 중복되는 숫자가 있습니다.");
        firstInputRef.current?.focus();
      } else {
        let [s, b] = [0, 0];
        for (let i = 0; i < 4; i += 1) {
          if (theNumber[i] === values[i]) s += 1;
          else if (values.includes(theNumber[i])) b += 1;
        }
        if (s === 4) {
          setMessage(`축하합니다! ${history.length + 1} 회차에 성공!`);
          resetButtonRef.current?.focus();
        } else if (history.length >= 8) {
          setMessage(`정답은 ${theNumber.join("")}였습니다.`);
          resetButtonRef.current?.focus();
        } else {
          setMessage("");
          firstInputRef.current?.focus();
        }
        setHistory((prev) => [...prev, [...values, s, b]]);
      }
    }
  };

  const gameEnded = history.length >= 9 || history.some((i) => i[4] === 4);

  return (
    <div className="screen">
      <div className="nes-box">
        {message && (
          <button className="alert-message" onClick={() => setMessage("")}>
            <div className="nes-box">{message}</div>
          </button>
        )}
        <h1 className="game-title">
          <span style={{ color: "var(--keyword-color)" }}>숫자야구</span> -{" "}
          <span style={{ color: "var(--escape-color)" }}>지능개발</span>,{" "}
          <span style={{ color: "var(--key-color-2)" }}>두뇌발전</span>!
        </h1>
        <form className="input-area" onSubmit={(e) => e.preventDefault()}>
          {Array.from(Array(4), (_, i) => i).map((i) => (
            <input
              key={i}
              ref={i === 0 ? firstInputRef : undefined}
              className="number-input"
              type="text"
              value={values[i] === null ? "" : `${values[i] as number}`}
              onFocus={(e) => e.currentTarget.select()}
              onClick={(e) => e.currentTarget.select()}
              onChange={(e) => {
                const value = mapToDigit(e.currentTarget.value);
                if (Number.isNaN(value)) return;
                setValues(values.map((x, j) => (i === j ? value : x)));
              }}
              onInput={(e) => {
                const value = mapToDigit(e.currentTarget.value);
                if (value === null) return;
                if ((Number.isNaN(value) ? values[i] : value) === null) return;
                (e.currentTarget.nextElementSibling as HTMLElement)?.focus();
              }}
              maxLength={1}
              disabled={gameEnded}
            />
          ))}
          <button
            type="submit"
            className="text-button"
            onClick={onHit}
            disabled={gameEnded}
          >
            맞히기
          </button>
          <button
            type="button"
            ref={resetButtonRef}
            className="text-button"
            id="reset-button"
            onClick={() => {
              setMessage("");
              setTheNumber(createTheNumber);
              setHistory([]);
              setValues(Array(4).fill(null));
            }}
          >
            다시시작
          </button>
        </form>
        <table className="scoreboard">
          <thead>
            <tr>
              {["", 1, 2, 3, 4, "S", "B", ""].map((it, i) => (
                <th key={i} className="scoreboard__cell">
                  {it}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from(Array(9), (_, i) => i).map((i) => {
              const item = history.at(i) ?? Array<number | null>(6).fill(null);
              return (
                <tr key={i}>
                  <td className="scoreboard__cell">{i + 1}</td>
                  {item.map((number, j) => {
                    let className = "history-number";
                    if (j === 4) className = "strike-result";
                    else if (j === 5) className = "ball-result";
                    return (
                      <td key={j} className="scoreboard__cell">
                        <span className={className}>{number}</span>
                      </td>
                    );
                  })}
                  <td className="scoreboard__cell">
                    {item[4] !== null && (
                      <span style={{ color: "var(--escape-color" }}>
                        {item[4] === 4 && "승리!"}
                        {i === 8 && item[4] !== 4 && "패배!"}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
