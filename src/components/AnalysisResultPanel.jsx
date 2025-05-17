import React, { useMemo, useEffect, useState } from 'react';
import Papa from 'papaparse';
import {
    ResponsiveContainer,
    BarChart,
    PieChart,
    Pie,
    Cell,
    Legend,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    LabelList,
    Label
} from 'recharts';
import parseAndClean from '../utils/ParseCsv';
import DynamicChart from './DynamicChart'; // Assuming you have a DynamicChart component

const VESSEL_CSV_URL = '/vessel_code.csv';
const DOM_OD_CSV_URL = '/dom_od_code.csv';

export default function AnalysisResultPanel({
    vesselData,
    selectedDate,
    selectedPortCode,
    generatedCode
}) {
    const [csvRows, setCsvRows] = useState([]);
    const [vesselDict, setVesselDict] = useState({});
    const [domOdDict, setDomOdDict] = useState({});

    // Parse uploaded or passed vessel data
    useEffect(() => {
        const cleanRows = rows =>
            rows.map(row => {
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
                }
            });
        } else if (Array.isArray(vesselData)) {
            setCsvRows(cleanRows(vesselData));
        } else {
            setCsvRows([]);
        }
    }, [vesselData]);

    // Load static CSV dictionaries
    useEffect(() => {
        fetch(VESSEL_CSV_URL)
            .then(res => res.text())
            .then(txt => {
                const rows = parseAndClean(txt);
                const dict = {};
                rows.forEach(r => {
                    if (r['선박종류코드']) dict[r['선박종류코드']] = r['선박종류명'];
                });
                setVesselDict(dict);
            })
            .catch(err => console.error('vessel CSV fetch error:', err));

        fetch(DOM_OD_CSV_URL)
            .then(res => res.text())
            .then(txt => {
                const rows = parseAndClean(txt);
                const dict = {};
                rows.forEach(r => {
                    if (r['DOM_OD']) dict[r['DOM_OD']] = r['PORT_NM'];
                });
                setDomOdDict(dict);
            })
            .catch(err => console.error('dom_od CSV fetch error:', err));
    }, []);

    // Aggregate by vessel type (척수)
    const aggregatedByType = useMemo(() => {
        const acc = {};
        csvRows.forEach(row => {
            const port = row['청코드'];
            if (selectedPortCode && port !== selectedPortCode) return;

            const year = String(row['년']);
            const month = String(row['월']).padStart(2, '0');
            if (selectedDate?.year && selectedDate?.month) {
                const sy = String(selectedDate.year);
                const sm = String(selectedDate.month).padStart(2, '0');
                if (year !== sy || month !== sm) return;
            }

            const typeCode = row['선종코드'];
            const count = Number(row['척수']) || 0;
            if (!typeCode) return;

            acc[typeCode] = (acc[typeCode] || 0) + count;
        });

        return Object.entries(acc).map(([code, cnt]) => ({
            type: vesselDict[code] || code,
            count: cnt
        }));
    }, [csvRows, selectedDate, selectedPortCode, vesselDict]);

    // Aggregate by domestic OD (총톤수)
    const dataByOd = useMemo(() => {
        const acc = {};
        csvRows.forEach(row => {
            const port = row['청코드'];
            if (selectedPortCode && port !== selectedPortCode) return;

            const year = String(row['년']);
            const month = String(row['월']).padStart(2, '0');
            if (selectedDate?.year && selectedDate?.month) {
                const sy = String(selectedDate.year);
                const sm = String(selectedDate.month).padStart(2, '0');
                if (year !== sy || month !== sm) return;
            }

            const odCode = row['국내 OD'];
            const ton = Number(row['총톤수']) || 0;
            if (!odCode) return;

            acc[odCode] = (acc[odCode] || 0) + ton;
        });

        return Object.entries(acc)
            .map(([code, tn]) => ({ od: domOdDict[code] || code, ton: tn }));
    }, [csvRows, selectedDate, selectedPortCode, domOdDict]);

    // Prepare pie chart data with "기타"
    const chartData = useMemo(() => {
        const total = dataByOd.reduce((sum, item) => sum + item.ton, 0);
        const threshold = 0.05;
        const main = [];
        let others = 0;

        dataByOd.forEach(item => {
            if (item.ton / total >= threshold) {
                main.push(item);
            } else {
                others += item.ton;
            }
        });

        if (others > 0) main.push({ od: '기타', ton: others });
        return main;
    }, [dataByOd]);

    // No data fallback
    const noData = aggregatedByType.length === 0 && chartData.length === 0;

    // Force wrap generatedCode with percent height
    // const wrappedJSX = generatedCode
    //     ? `<ResponsiveContainer width=\"100%\" height={400}>${generatedCode.trim()}</ResponsiveContainer>`
    //     : null;
    let finalJSX = null;
    if (generatedCode) {
        const trimmed = generatedCode.trim();
        finalJSX = trimmed.startsWith('<ResponsiveContainer')
            ? trimmed
            : `<ResponsiveContainer width="100%" height="100%">
        ${trimmed}
        </ResponsiveContainer>`;
    }

    let innerChartJSX = null;
    if (generatedCode) {
        let trimmed = generatedCode.trim();
        // remove outer ResponsiveContainer if LLM accidentally included it
        if (trimmed.startsWith('<ResponsiveContainer')) {
            trimmed = trimmed.replace(/^<ResponsiveContainer[^>]*>/, '').replace(/<\/ResponsiveContainer>\s*$/, '');
        }
        innerChartJSX = trimmed;
    }

    let innerChartCode = null;
    if (generatedCode) {
        let trimmed = generatedCode.trim();
        // 외부 ResponsiveContainer 제거
        if (trimmed.startsWith('<ResponsiveContainer')) {
            trimmed = trimmed.replace(/^<ResponsiveContainer[^>]*>/, '').replace(/<\/ResponsiveContainer>\s*$/, '');
        }
        innerChartCode = trimmed;
    }

    const bindings = {
        csvRows,
        vesselDict,
        domOdDict,
        selectedDate,
        selectedPortCode,
        aggregatedByType,
        chartData,
        dataByOd,
        COLORS: [
            '#4E79A7', '#59A14F', '#F28E2B', '#E15759', '#76B7B2',
            '#EDC948', '#B07AA1', '#FF9DA7', '#9C755F', '#BAB0AC'
        ]
    };


    // innerChartJSX = generatedCode.trim();



    //   console.log('generatedCode:', generatedCode);
    // console.log('csvRows:', csvRows);
    // console.log('vesselData:', vesselData);
    // console.log('generatedCode:', generatedCode);
    // console.log('wrappedJSX:', wrappedJSX);
    // console.log('finalJSX:', finalJSX);
    // console.log('innerChartJSX:', innerChartJSX);
    // console.log('innerChartCode:', innerChartCode);

    let noFlag = true;
    if (aggregatedByType.length > 0 || chartData.length > 0) {
        noFlag = false;
    }


    return (
        <div style={{ width: '100%', height: '100%' }}>
            {!noFlag &&
                <div style={{ width: '100%', height: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={aggregatedByType} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="type" label={{ value: '선종', position: 'insideBottom', offset: -10 }} />
                            <YAxis>
                                <Label value="총 척수" angle={-90} position="insideLeft" offset={10} />
                            </YAxis>
                            <Tooltip formatter={value => `${value} 척`} />
                            <Bar dataKey="count" name="척수" fill='#FFB6C1'>
                                <LabelList dataKey="count" position="top" />
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>

                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                dataKey="ton"
                                nameKey="od"
                                cx="50%"
                                cy="50%"
                                outerRadius={120}
                                label={({ od, percent }) => `${od} (${(percent * 100).toFixed(1)}%)`}
                            >
                                {chartData.map((entry, idx) => (
                                    <Cell key={idx} fill={[
                                        '#4E79A7', '#59A14F', '#F28E2B', '#E15759', '#76B7B2',
                                        '#EDC948', '#B07AA1', '#FF9DA7', '#9C755F', '#BAB0AC'
                                    ][idx % 10]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={value => `${value.toLocaleString()} 톤`} />
                            <Legend verticalAlign="bottom" height={36} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            }
        </div>
    );

    // return (
    //     <div style={{ width: '100%', height: '100%' }}>
    //         {noData && <div>시각화할 데이터가 없습니다.</div>}

    //         {!noData && innerChartCode && (
    //             <ResponsiveContainer width="100%" height="100%">
    //                 <DynamicChart
    //                     code={innerChartCode}
    //                     bindings={bindings}
    //                 />
    //             </ResponsiveContainer>
    //         )}

    //         {!noData && !innerChartCode && (
    //             <div style={{ width: '100%', height: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
    //                 {/* 기존 하드코딩 차트 */}
    //                 <ResponsiveContainer width="100%" height="100%">
    //                     <BarChart data={aggregatedByType} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
    //                         <CartesianGrid strokeDasharray="3 3" />
    //                         <XAxis dataKey="type" label={{ value: '선종', position: 'insideBottom', offset: -10 }} />
    //                         <YAxis>
    //                             <Label value="총 척수" angle={-90} position="insideLeft" offset={10} />
    //                         </YAxis>
    //                         <Tooltip formatter={value => `${value} 척`} />
    //                         <Bar dataKey="count" name="척수" fill='#FFB6C1'>
    //                             <LabelList dataKey="count" position="top" />
    //                         </Bar>
    //                     </BarChart>
    //                 </ResponsiveContainer>

    //                 <ResponsiveContainer width="100%" height="100%">
    //                     <PieChart>
    //                         <Pie
    //                             data={chartData}
    //                             dataKey="ton"
    //                             nameKey="od"
    //                             cx="50%"
    //                             cy="50%"
    //                             outerRadius={120}
    //                             label={({ od, percent }) => `${od} (${(percent * 100).toFixed(1)}%)`}
    //                         >
    //                             {chartData.map((entry, idx) => (
    //                                 <Cell key={idx} fill={[
    //                                     '#4E79A7', '#59A14F', '#F28E2B', '#E15759', '#76B7B2',
    //                                     '#EDC948', '#B07AA1', '#FF9DA7', '#9C755F', '#BAB0AC'
    //                                 ][idx % 10]} />
    //                             ))}
    //                         </Pie>
    //                         <Tooltip formatter={value => `${value.toLocaleString()} 톤`} />
    //                         <Legend verticalAlign="bottom" height={36} />
    //                     </PieChart>
    //                 </ResponsiveContainer>
    //             </div>
    //         )}
    //     </div>
    // );
}
