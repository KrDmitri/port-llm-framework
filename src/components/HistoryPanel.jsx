// import React, { useState, useEffect } from 'react';

// function HistoryPanel() {
//   const [history, setHistory] = useState([]);

//   /* 1️⃣  새로고침(또는 탭 닫기) 직전에 chartHistory 비우기 */
//   useEffect(() => {
//     const clearHistoryOnLeave = () => {
//       localStorage.removeItem('chartHistory');
//     };
//     window.addEventListener('beforeunload', clearHistoryOnLeave);
//     return () => window.removeEventListener('beforeunload', clearHistoryOnLeave);
//   }, []);

//   /* 2️⃣  (페이지가 살아 있는 동안) 저장된 히스토리 불러오기 */
//   useEffect(() => {
//     const saved = JSON.parse(localStorage.getItem('chartHistory') || '[]');
//     saved.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
//     setHistory(saved);
//   }, []);

//   /* 3️⃣  LlmResultPanel이 보내는 실시간 ‘추가’ 이벤트 수신 */
//   useEffect(() => {
//     const handleUpdate = (e) => {
//       setHistory((prev) => [e.detail, ...prev]);
//     };
//     window.addEventListener('chartHistoryUpdated', handleUpdate);
//     return () => window.removeEventListener('chartHistoryUpdated', handleUpdate);
//   }, []);

//   if (history.length === 0) {
//     return <div>저장된 차트 히스토리가 없습니다.</div>;
//   }

//   return (
//     <div
//       style={{
//         display: 'grid',
//         // gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
//         gap: 16,
//       }}
//     >
//       {history.map((h, idx) => (
//         <div key={idx} style={{ border: '1px solid #ccc', padding: 8 }}>
//           <div style={{ fontSize: 12, marginBottom: 4 }}>
//             {new Date(h.timestamp).toLocaleString('ko-KR')}
//           </div>
//           <img
//             src={h.image}
//             alt={`chart-${idx}`}
//             style={{ width: '100%', height: 'auto' }}
//           />
//         </div>
//       ))}
//     </div>
//   );
// }

// export default HistoryPanel;



import React, { useState, useEffect } from 'react';

function HistoryPanel() {
  const [history, setHistory] = useState([]);

  /* 1️⃣ 새로고침·탭 종료 직전에 chartHistory 비우기 */
  useEffect(() => {
    const clearHistoryOnLeave = () => {
      localStorage.removeItem('chartHistory');
    };
    window.addEventListener('beforeunload', clearHistoryOnLeave);
    return () =>
      window.removeEventListener('beforeunload', clearHistoryOnLeave);
  }, []);

  /* 2️⃣ 로컬스토리지 → state 로드 */
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('chartHistory') || '[]');
    saved.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    setHistory(saved);
  }, []);

  /* 3️⃣ 실시간 추가 이벤트 수신 */
  useEffect(() => {
    const handleUpdate = (e) => {
      setHistory((prev) => [e.detail, ...prev]);
    };
    window.addEventListener('chartHistoryUpdated', handleUpdate);
    return () =>
      window.removeEventListener('chartHistoryUpdated', handleUpdate);
  }, []);

  /* 4️⃣ 카드 삭제 */
  const handleDelete = (idxToDelete) => {
    setHistory((prev) => {
      const updated = prev.filter((_, idx) => idx !== idxToDelete);
      localStorage.setItem('chartHistory', JSON.stringify(updated));
      return updated;
    });
  };

  if (history.length === 0) {
    return <div>저장된 차트 히스토리가 없습니다.</div>;
  }

  return (
    <div
      style={{
        display: 'grid',
        gap: 16,
      }}
    >
      {history.map((h, idx) => (
        <div
          key={h.timestamp} // timestamp 로 고유키
          style={{
            border: '1px solid #ccc',
            padding: 8,
            position: 'relative', // X 버튼 배치용
          }}
        >
          {/* ✖ 삭제 버튼 */}
          <button
            onClick={() => handleDelete(idx)}
            aria-label="delete"
            style={{
              position: 'absolute',
              top: 4,
              right: 4,
              background: 'transparent',
              border: 'none',
              fontSize: 16,
              fontWeight: 'bold',
              cursor: 'pointer',
              lineHeight: 1,
            }}
          >
            ×
          </button>

          <div style={{ fontSize: 12, marginBottom: 4 }}>
            {new Date(h.timestamp).toLocaleString('ko-KR')}
          </div>

          <img
            src={h.image}
            alt={`chart-${idx}`}
            style={{ width: '100%', height: 'auto' }}
          />
        </div>
      ))}
    </div>
  );
}

export default HistoryPanel;
