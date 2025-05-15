// // DynamicChart.jsx
// import React, { useMemo } from 'react';
// import * as RechartsAll from 'recharts';

// export default function DynamicChart({ code, data, bindings = {} }) {
//   // 모든 필요한 recharts 컴포넌트와 바인딩을 포함한 컨텍스트 생성
//   const context = {
//     React,
//     ...RechartsAll,
//     ...bindings,
//   };
  
//   // 문자열 코드를 함수로 변환
//   const ChartComponent = useMemo(() => {
//     try {
//       // Function 생성자를 사용해 문자열 코드를 실행 가능한 함수로 변환
//       const keys = Object.keys(context);
//       const values = keys.map(key => context[key]);
      
//       // 함수 생성 (모든 context 변수를 인자로 받아서 사용)
//       const ComponentFunction = new Function(...keys, `
//         try {
//           return (${code});
//         } catch (error) {
//           console.error("Error executing chart code:", error);
//           return null;
//         }
//       `);
      
//       // 함수 실행하여 React 컴포넌트/JSX 반환
//       return () => ComponentFunction(...values);
//     } catch (error) {
//       console.error("Error creating chart component:", error);
//       return () => <div>차트 생성 중 오류가 발생했습니다.</div>;
//     }
//   }, [code, JSON.stringify(bindings)]);

//   // 생성된 컴포넌트 렌더링
//   return <ChartComponent />;
// }


// 수정된 DynamicChart.jsx - 접근법 2: 함수 코드만 분리하여 실행
import React, { useMemo } from 'react';
import {
  ResponsiveContainer, BarChart, PieChart, Pie, Cell, Legend, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, LabelList, Label
} from 'recharts';

export default function DynamicChart({ code, bindings = {} }) {
  // 데이터 생성 부분과 JSX 렌더링 부분 분리
  const { dataProcessingCode, jsxCode } = extractDataAndJsx(code);
  
  // 데이터 처리 함수를 동적으로 생성하고 실행
  const processedData = useMemo(() => {
    if (!dataProcessingCode) return null;
    
    try {
      // 모든 바인딩을 포함하는 함수 생성
      const keys = Object.keys(bindings);
      const values = keys.map(key => bindings[key]);
      
      // 함수 생성 및 실행
      const dataFunction = new Function(...keys, `
        try {
          return ${dataProcessingCode};
        } catch (error) {
          console.error("Error processing chart data:", error);
          return [];
        }
      `);
      
      // 함수 실행하여 처리된 데이터 반환
      return dataFunction(...values);
    } catch (error) {
      console.error("Error creating data processing function:", error);
      return [];
    }
  }, [dataProcessingCode, JSON.stringify(bindings)]);
  
  // 미리 정의된 컴포넌트 렌더링 (하드코딩된 방식)
  // 실제로는 더 많은 차트 유형을 처리해야 함
  return useMemo(() => {
    if (!jsxCode || !processedData) {
      return <div>데이터 처리 중 오류가 발생했습니다.</div>;
    }
    
    // BarChart 케이스
    if (jsxCode.includes('BarChart')) {
      // 마진 추출 (선택적)
      const marginMatch = jsxCode.match(/margin=\{\{\s*top:\s*(\d+),\s*right:\s*(\d+),\s*left:\s*(\d+),\s*bottom:\s*(\d+)\s*\}\}/);
      const margin = marginMatch ? {
        top: parseInt(marginMatch[1]),
        right: parseInt(marginMatch[2]),
        left: parseInt(marginMatch[3]),
        bottom: parseInt(marginMatch[4])
      } : { top: 20, right: 30, left: 20, bottom: 40 };
      
      // 색상 추출
      const fillMatch = jsxCode.match(/fill=["']([^"']*)["']/);
      const fill = fillMatch ? fillMatch[1] : "#8884d8";
      
      // X축/Y축 레이블 추출
      const xLabelMatch = jsxCode.match(/XAxis[^>]*label=\{\{\s*value:\s*["']([^"']*)["']/);
      const xLabelValue = xLabelMatch ? xLabelMatch[1] : "";
      
      const yLabelMatch = jsxCode.match(/value=["']([^"']*)["']\s*angle=/);
      const yLabelValue = yLabelMatch ? yLabelMatch[1] : "";
      
      // BarChart 렌더링
      return (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={processedData} margin={margin}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="type" label={{ value: xLabelValue, position: 'insideBottom', offset: -10 }} />
            <YAxis>
              <Label value={yLabelValue} angle={-90} position="insideLeft" offset={10} />
            </YAxis>
            <Tooltip formatter={(v) => `${v} 척`} />
            <Bar dataKey="count" name="척수" fill={fill}>
              <LabelList dataKey="count" position="top" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      );
    }
    
    // PieChart 케이스
    else if (jsxCode.includes('PieChart')) {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={processedData}
              dataKey="ton" // 또는 데이터에 맞게 수정
              nameKey="od" // 또는 데이터에 맞게 수정
              cx="50%"
              cy="50%"
              outerRadius={120}
              label={({ name, value, percent }) => `${name} (${(percent * 100).toFixed(1)}%)`}
            >
              {processedData.map((entry, idx) => (
                <Cell key={idx} fill={bindings.COLORS[idx % bindings.COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => `${value.toLocaleString()} 톤`} />
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </ResponsiveContainer>
      );
    }
    
    // 기본 대체 차트
    return <div>지원되지 않는 차트 유형입니다.</div>;
  }, [jsxCode, processedData, JSON.stringify(bindings)]);
}

// JSX 코드에서 데이터 처리 부분과 JSX 렌더링 부분을 분리하는 함수
function extractDataAndJsx(code) {
  // 데이터 처리 코드 추출 (IIFE 형태로 되어 있는)
  const dataMatch = code.match(/data=\{(\(\(\) => \{[\s\S]*?\}\)\(\))\}/);
  const dataProcessingCode = dataMatch ? dataMatch[1] : null;
  
  // JSX 코드 그대로 유지
  const jsxCode = code;
  
  return { dataProcessingCode, jsxCode };
}