import React, { useEffect, useState } from 'react';

const createTheNumber = () => {
  const ns = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];
  const theNumber: number[] = [];
  for (let i = 0; i < 4; i += 1) {
    theNumber.push(...ns.splice(Math.floor(Math.random() * ns.length), 1));
  }
  return theNumber;
};

export default function App() {
  const [theNumber, setTheNumber] = useState(createTheNumber);
  const [values, setValues] = useState<(number | null)[]>([null, null, null, null]);
  const [history, setHistory] = useState<number[][]>([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (message) {
      const onclick = () => setMessage('');
      window.addEventListener('click', onclick);
      return () => window.removeEventListener('click', onclick);
    }
    return () => undefined;
  }, [message]);
  useEffect(() => {
    if (values[0] === null && values[1] === null && values[2] === null && values[3] === null && !history.length)
      document.querySelector<HTMLInputElement>('.number-input')?.focus();
  }, [values, history]);
  const onHit = () => {
    if (!values.every((v): v is number => typeof v === 'number')) {
      setMessage('제대로 입력하세요!');
      return;
    }
    const alreadyTried = history.findIndex(
      (a) => a[0] === values[0] && a[1] === values[1] && a[2] === values[2] && a[3] === values[3],
    );
    if (alreadyTried !== -1) {
      setMessage(`${alreadyTried + 1}회차에 이미 시도했어요.`);
      document.querySelector<HTMLInputElement>('.number-input')?.focus();
      return;
    }
    if (new Set(values).size !== 4) {
      setMessage('입력에 중복되는 숫자가 있습니다.');
      document.querySelector<HTMLInputElement>('.number-input')?.focus();
      return;
    }

    let [s, b] = [0, 0];
    for (let i = 0; i < 4; i += 1) {
      if (theNumber[i] === values[i]) s += 1;
      else if (values.includes(theNumber[i])) b += 1;
    }
    if (s === 4) {
      setMessage(`축하합니다! ${history.length + 1} 회차에 성공!`);
    } else if (history.length >= 8) {
      setMessage(`정답은 ${theNumber.join('')}였습니다.`);
    }
    if (s === 4 || history.length >= 8) document.querySelector<HTMLButtonElement>('#reset-button')?.focus();
    else document.querySelector<HTMLInputElement>('.number-input')?.focus();
    setHistory((prev) => [...prev, [...values, s, b]]);
  };
  const resetGame = () => {
    setTheNumber(createTheNumber);
    setHistory([]);
    setValues([null, null, null, null]);
  };
  const gameEnded = history.length >= 9 || history.some((i) => i[4] === 4);
  return (
    <div className="screen">
      <div className="nes-box">
        {message && (
          <div className="alert-message">
            <div className="nes-box">{message}</div>
          </div>
        )}
        <h1 className="game-title">
          <span style={{ color: 'var(--keyword-color)' }}>숫자야구</span> -{' '}
          <span style={{ color: 'var(--escape-color)' }}>지능개발</span>,{' '}
          <span style={{ color: 'var(--key-color-2)' }}>두뇌발전</span>!
        </h1>
        <form className="input-area" onSubmit={(e) => e.preventDefault()}>
          {Array.from(Array(4), (_, i) => i).map((digit) => (
            <input
              key={digit}
              className="number-input"
              type="text"
              value={values[digit] === null ? '' : `${values[digit] as number}`}
              onFocus={(e) => e.target.select()}
              onChange={(e) => {
                const value = parseInt(e.target.value, 10);
                setValues((prev) => Object.assign([...prev], { [digit]: Number.isNaN(value) ? null : value }));
              }}
              onInput={(e) => {
                // 값이 바뀌지 않았더라도 다음 칸으로 넘기기 위해서 onChange 대신 onInput에서 처리
                const target = e.target as HTMLInputElement;
                const value = parseInt(target.value, 10);
                if (!Number.isNaN(value)) (target.nextElementSibling as HTMLElement)?.focus();
              }}
              maxLength={1}
              disabled={gameEnded}
            />
          ))}
          <button type="submit" onClick={onHit} disabled={gameEnded}>
            맞히기
          </button>
          <button type="button" id="reset-button" onClick={resetGame}>
            다시시작
          </button>
        </form>
        <table className="scoreboard">
          <thead>
            <tr>
              <th className="scoreboard__cell">&nbsp;</th>
              <th className="scoreboard__cell">1</th>
              <th className="scoreboard__cell">2</th>
              <th className="scoreboard__cell">3</th>
              <th className="scoreboard__cell">4</th>
              <th className="scoreboard__cell">S</th>
              <th className="scoreboard__cell">B</th>
              <th className="scoreboard__cell">&nbsp;&nbsp;&nbsp;&nbsp;</th>
            </tr>
          </thead>
          <tbody>
            {Array.from(Array(9), (_, i) => i).map((key) => {
              const [fst, snd, trd, fth, s, b] = history[key] || ['', '', '', '', ''];
              return (
                // eslint-disable-next-line react/no-array-index-key
                <tr key={key}>
                  <td className="scoreboard__cell">{key + 1}</td>
                  <td className="scoreboard__cell">
                    <span className="history-number">{fst}</span>
                  </td>
                  <td className="scoreboard__cell">
                    <span className="history-number">{snd}</span>
                  </td>
                  <td className="scoreboard__cell">
                    <span className="history-number">{trd}</span>
                  </td>
                  <td className="scoreboard__cell">
                    <span className="history-number">{fth}</span>
                  </td>
                  <td className="scoreboard__cell">
                    <span className="strike-result">{s}</span>
                  </td>
                  <td className="scoreboard__cell">
                    <span className="ball-result">{b}</span>
                  </td>
                  <td className="scoreboard__cell">
                    {s === 4 && <span style={{ color: 'var(--escape-color' }}>승리!</span>}
                    {history.length >= 9 && key === 8 && s !== 4 && (
                      <span style={{ color: 'var(--escape-color' }}>패배!</span>
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
