import React, { useState, useRef, useEffect } from 'react';
// import './TimeLinePanel.css';

/**
 * TimeLinePanel
 * - 좌우로 드래그 가능한 월 단위 타임라인
 * - 원(circle) 클릭 가능
 * - 월(month) 정보는 아래에, 연(year) 정보는 1월 위에만 표시
 *
 * Props:
 *  - start: Date (타임라인 시작 날짜, 기본 올해 1월 1일)
 *  - end: Date (타임라인 끝 날짜, 기본 올해 12월 1일)
 */
function TimeLinePanel({
  start = new Date(new Date().getFullYear() - 2, 0, 1),
  end = new Date(new Date().getFullYear(), 11, 1),
}) {
  const containerRef = useRef(null);
  const [offsetX, setOffsetX] = useState(0);
  const draggingRef = useRef(false);
  const startXRef = useRef(0);
  const prevOffsetRef = useRef(0);

  // 드래그 핸들러
  const onMouseDown = (e) => {
    draggingRef.current = true;
    startXRef.current = e.clientX;
    prevOffsetRef.current = offsetX;
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  const onMouseMove = (e) => {
    if (!draggingRef.current || !containerRef.current) return;
    const dx = e.clientX - startXRef.current;
    const rawOffset = prevOffsetRef.current + dx;
    // 경계 계산
    const containerWidth = containerRef.current.clientWidth;
    const monthsCount = Math.floor((end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth())) + 1;
    const spacing = 100;
    const timelineWidth = monthsCount * spacing;
    const minOffset = containerWidth - timelineWidth;
    const maxOffset = 0;
    const clamped = Math.min(maxOffset, Math.max(minOffset, rawOffset));
    setOffsetX(clamped);
  };

  const onMouseUp = () => {
    draggingRef.current = false;
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
  };

  // start~end 사이 월별 생성
  const months = [];
  let cur = new Date(start.getFullYear(), start.getMonth(), 1);
  while (cur <= end) {
    months.push(new Date(cur));
    cur = new Date(cur.getFullYear(), cur.getMonth() + 1, 1);
  }

  // viewWidth는 containerRef에서 동적으로 계산
  const viewWidth = containerRef.current?.clientWidth || 600;

  const [selectedIdx, setSelectedIdx] = useState(null);

  return (
    <div
      ref={containerRef}
      className="timeline-container"
      onMouseDown={onMouseDown}
      style={{ cursor: draggingRef.current ? 'grabbing' : 'grab', width: '100%', overflow: 'hidden', height: '100%', position: 'relative' }}
    >
      <svg
        width={viewWidth}
        style={{
          position: 'absolute',
          left: '50%',
          transform: `translateX(calc(-50% + ${offsetX}px)) translateY(-5px)`,
          userSelect: 'none',
          height: '100%',
        }}
      >
        <line x1={0} y1={50} x2={months.length * 100} y2={50} stroke="#4A90E2" strokeWidth={2} />
        {months.map((date, idx) => {
          const x = idx * 100 + 50;
          return (
            <g key={idx} className="timeline-item">
              <circle
                cx={x}
                cy={50}
                r={selectedIdx === idx ? 10 : 8}
                fill={selectedIdx === idx ? '#4A90E2' : '#fff'}
                stroke={selectedIdx === idx ? '#005BB5' : '#4A90E2'}
                strokeWidth={selectedIdx === idx ? 3 : 2}
                onClick={() => setSelectedIdx(idx)}
                style={{ cursor: 'pointer' }}
              />
              <text x={x} y={70} textAnchor="middle" fontSize={12}>
                {date.getMonth() + 1}월
              </text>
              {date.getMonth() === 0 && (
                <text x={x} y={30} textAnchor="middle" fontSize={12} fontWeight="bold">
                  {date.getFullYear()}년
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default TimeLinePanel;
