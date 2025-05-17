import React, {
  useEffect,
  useLayoutEffect,
  useState,
  useRef,
} from 'react';
import Papa from 'papaparse';
import parseAndClean from '../utils/ParseCsv';
import DynamicChart from './DynamicChart';
import { ResponsiveContainer } from 'recharts';

const VESSEL_CSV_URL = '/vessel_code.csv';
const DOM_OD_CSV_URL = '/dom_od_code.csv';

/** SVG 엘리먼트를 data:image/svg+xml;base64,… 로 직렬화 */
function captureSvg(svgEl) {
  if (!svgEl) return null;
  if (!svgEl.getAttribute('xmlns')) {
    svgEl.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  }
  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(svgEl);
  const encoded = btoa(unescape(encodeURIComponent(svgString)));
  return `data:image/svg+xml;base64,${encoded}`;
}

// 히스토리 최대 보관 개수 (넘치면 오래된 것부터 삭제)
const MAX_HISTORY_ITEMS = 3;
// 막대 애니메이션이 끝났다고 간주할 딜레이(ms)
const ANIMATION_BUFFER = 800;

let innerChartCode = null;

function LlmResultPanel({
  generatedCode,
  vesselData,
  selectedDate,
  selectedPortCode,
}) {
  const [csvRows, setCsvRows] = useState([]);
  const [vesselDict, setVesselDict] = useState({});
  const [domOdDict, setDomOdDict] = useState({});


  const containerRef = useRef(null);
  const capturedRef = useRef(false); // 같은 효과 안에서 중복 캡처 방지

  /* ---------------- CSV 업로드 혹은 배열 파싱 ---------------- */
  useEffect(() => {
    const cleanRows = (rows) =>
      rows.map((row) => {
        const cleaned = {};
        Object.entries(row).forEach(([key, value]) => {
          const k = key.trim();
          let v = value;
          if (typeof v === 'string') v = v.trim();
          cleaned[k] = v;
        });
        return cleaned;
      });

    if (vesselData instanceof File) {
      Papa.parse(vesselData, {
        header: true,
        skipEmptyLines: true,
        complete: ({ data, errors }) => {
          if (errors.length) console.error(errors);
          setCsvRows(cleanRows(data));
        },
      });
    } else if (Array.isArray(vesselData)) {
      setCsvRows(cleanRows(vesselData));
    } else {
      setCsvRows([]);
    }
  }, [vesselData]);

  /* ---------------- 정적 CSV 사전 두 개 로드 ---------------- */
  useEffect(() => {
    fetch(VESSEL_CSV_URL)
      .then((res) => res.text())
      .then((txt) => {
        const rows = parseAndClean(txt);
        const dict = {};
        rows.forEach((r) => {
          if (r['선박종류코드']) dict[r['선박종류코드']] = r['선박종류명'];
        });
        setVesselDict(dict);
      })
      .catch((err) => console.error('vessel CSV fetch error:', err));

    fetch(DOM_OD_CSV_URL)
      .then((res) => res.text())
      .then((txt) => {
        const rows = parseAndClean(txt);
        const dict = {};
        rows.forEach((r) => {
          if (r['DOM_OD']) dict[r['DOM_OD']] = r['PORT_NM'];
        });
        setDomOdDict(dict);
      })
      .catch((err) => console.error('dom_od CSV fetch error:', err));
  }, []);

  /* ---------------- 차트 캡처 & 히스토리 저장 ---------------- */
  useLayoutEffect(() => {
    capturedRef.current = false; // 새 차트 렌더링마다 초기화

    if (!generatedCode || !containerRef.current) return;

    const tryCapture = () => {
      if (capturedRef.current) return; // 이미 캡처 완료

      const svgEl = containerRef.current.querySelector('svg');
      if (!svgEl) {
        requestAnimationFrame(tryCapture);
        return;
      }

      const hasBars = svgEl.querySelector(
        '.recharts-rectangle, .recharts-bar-rectangle, path, rect',
      );

      if (!hasBars) {
        requestAnimationFrame(tryCapture);
        return;
      }

      // 애니메이션 여유시간 후 캡처
      setTimeout(() => {
        if (capturedRef.current) return; // 다른 루트에서 이미 캡처했을 경우
        const dataUrl = captureSvg(svgEl);
        if (!dataUrl) return;

        const existing = JSON.parse(
          localStorage.getItem('chartHistory') || '[]',
        );

        const newEntry = {
          image: dataUrl,
          timestamp: new Date().toISOString(),
          metadata: {
            rows: csvRows,
            date: selectedDate,
            port: selectedPortCode,
          },
        };

        // 오래된 항목 제거 (MAX_HISTORY_ITEMS 초과 시)
        const updated = [...existing, newEntry];
        while (updated.length > MAX_HISTORY_ITEMS) {
          updated.shift();
        }

        localStorage.setItem('chartHistory', JSON.stringify(updated));

        // 실시간 HistoryPanel 갱신
        window.dispatchEvent(
          new CustomEvent('chartHistoryUpdated', { detail: newEntry }),
        );

        capturedRef.current = true;
      }, ANIMATION_BUFFER);
    };

    requestAnimationFrame(tryCapture);
  }, [generatedCode, csvRows, selectedDate, selectedPortCode]);

  /* ---------------- LLM 이 준 JSX 문자열 가공 ---------------- */
  console.log('generatedCode:', generatedCode);

//   let innerChartCode = null;
  if (generatedCode && generatedCode !== '') {
    console.log("here");
    let trimmed = generatedCode.trim();
    if (trimmed.startsWith('<ResponsiveContainer')) {
      trimmed = trimmed
        .replace(/^<ResponsiveContainer[^>]*>/, '')
        .replace(/<\/ResponsiveContainer>\s*$/, '');
    }
    innerChartCode = trimmed;
  }

  const bindings = {
    csvRows,
    vesselDict,
    domOdDict,
    selectedDate,
    selectedPortCode,
    COLORS: [
      '#4E79A7',
      '#59A14F',
      '#F28E2B',
      '#E15759',
      '#76B7B2',
      '#EDC948',
      '#B07AA1',
      '#FF9DA7',
      '#9C755F',
      '#BAB0AC',
    ],
  };

  /* ---------------- 렌더 ---------------- */
  return (
    <>
      {!innerChartCode && <div>항마니가 그려줍니다.</div>}

      {innerChartCode && (
        <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <DynamicChart code={innerChartCode} bindings={bindings} />
          </ResponsiveContainer>
        </div>
      )}
    </>
  );
}

export default LlmResultPanel;

