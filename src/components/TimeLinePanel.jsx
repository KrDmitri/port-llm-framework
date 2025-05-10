import React, { useState, useRef, useEffect } from 'react';

function TimeLinePanel({
  start = new Date(2022, 0, 1),
  end = new Date(2023, 11, 1),
  onDateSelect,
  selectedDate,
}) {
  const containerRef = useRef(null);
  const [offsetX, setOffsetX] = useState(0);
  const [containerWidth, setContainerWidth] = useState(600);
  const draggingRef = useRef(false);
  const startXRef = useRef(0);
  const prevOffsetRef = useRef(0);

  // 월 수 계산
  const monthsCount = Math.floor((end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth())) + 1;

  // 컨테이너 너비에 따라 spacing 동적 계산
  const getSpacing = () => {
    // 화면에 보이는 월 수를 12개로 설정
    const visibleMonths = 12;
    return containerWidth / visibleMonths;
  };

  // 컨테이너 크기 감지
  useEffect(() => {
    if (!containerRef.current) return;

    const updateWidth = () => {
      setContainerWidth(containerRef.current.clientWidth);
      // 초기 위치를 타임라인의 시작 부분으로 설정
      setOffsetX(0);
    };

    updateWidth();

    const observer = new ResizeObserver(updateWidth);
    observer.observe(containerRef.current);

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, []);

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

    const spacing = getSpacing();
    const timelineWidth = monthsCount * spacing;

    // 전체 타임라인이 보이도록 드래그 제한 설정
    const minOffset = -(timelineWidth - containerWidth);
    const maxOffset = 0;
    const clamped = Math.min(maxOffset, Math.max(minOffset, rawOffset));
    setOffsetX(clamped);
  };

  const onMouseUp = () => {
    draggingRef.current = false;
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
  };

  // 터치 이벤트 지원
  const onTouchStart = (e) => {
    draggingRef.current = true;
    startXRef.current = e.touches[0].clientX;
    prevOffsetRef.current = offsetX;
  };

  const onTouchMove = (e) => {
    if (!draggingRef.current || !containerRef.current) return;
    const dx = e.touches[0].clientX - startXRef.current;
    const rawOffset = prevOffsetRef.current + dx;

    const spacing = getSpacing();
    const timelineWidth = monthsCount * spacing;

    // 전체 타임라인이 보이도록 드래그 제한 설정
    const minOffset = -(timelineWidth - containerWidth);
    const maxOffset = 0;
    const clamped = Math.min(maxOffset, Math.max(minOffset, rawOffset));
    setOffsetX(clamped);
  };

  const onTouchEnd = () => {
    draggingRef.current = false;
  };

  // start~end 사이 월별 생성
  const months = [];
  let cur = new Date(start.getFullYear(), start.getMonth(), 1);
  while (cur <= end) {
    months.push(new Date(cur));
    cur = new Date(cur.getFullYear(), cur.getMonth() + 1, 1);
  }

  const spacing = getSpacing();
  const [selectedIdx, setSelectedIdx] = useState(null);

  const handleMonthSelect = (idx) => {
    setSelectedIdx(idx);
    if (onDateSelect) {
      onDateSelect(months[idx]);
    }
  };

  return (
    <div
      ref={containerRef}
      className="timeline-container"
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      style={{
        cursor: draggingRef.current ? 'grabbing' : 'grab',
        width: '100%',
        overflow: 'hidden',
        height: '100%',
        position: 'relative',
        touchAction: 'pan-y'
      }}
    >
      <svg
        width={monthsCount * spacing}
        height="100%"
        style={{
          position: 'absolute',
          left: 0,
          // transform: `translateX(${offsetX}px)`,
          transform: `translateX(calc(${offsetX}px)) translateY(-5px)`,
          userSelect: 'none',
        }}
      >
        <line x1={0} y1={50} x2={monthsCount * spacing} y2={50} stroke="#4A90E2" strokeWidth={2} />
        {months.map((date, idx) => {
          const x = idx * spacing + spacing / 2;
          return (
            <g key={idx} className="timeline-item">
              <circle
                cx={x}
                cy={50}
                r={selectedIdx === idx ? 10 : 8}
                fill={selectedIdx === idx ? '#4A90E2' : '#fff'}
                stroke={selectedIdx === idx ? '#005BB5' : '#4A90E2'}
                strokeWidth={selectedIdx === idx ? 3 : 2}
                onClick={() => handleMonthSelect(idx)}
                // onClick={() => {
                //   setSelectedIdx(idx);
                //   console.log(`Clicked: ${date.getFullYear()}-${date.getMonth() + 1}`);
                // }}
                style={{ cursor: 'pointer' }}
              />
              <text x={x} y={75} textAnchor="middle" fontSize={14}>
                {date.getMonth() + 1}월
              </text>
              {date.getMonth() === 0 && (
                <text x={x} y={30} textAnchor="middle" fontSize={14} fontWeight="bold">
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