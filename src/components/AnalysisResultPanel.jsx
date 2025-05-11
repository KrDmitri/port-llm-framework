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

const VESSEL_CSV_URL = '/vessel_code.csv';
const DOM_OD_CSV_URL = '/dom_od_code.csv';

function AnalysisResultPanel({ vesselData, selectedDate, selectedPortCode }) {
    const [csvRows, setCsvRows] = useState([]);
    const [vesselDict, setVesselDict] = useState({});
    const [domOdDict, setDomOdDict] = useState({});

    useEffect(() => {
        const cleanRows = rows =>
            rows.map(r => {
                const cleaned = {};
                Object.keys(r).forEach(key => {
                    const k = key.trim();
                    let v = r[key];
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

    useEffect(() => {
        // 1) vessel CSV 읽어서 { 선박종류코드: 선박종류명 } 형태로
        fetch(VESSEL_CSV_URL)
            .then(res => res.text())
            .then(txt => {
                const rows = parseAndClean(txt);
                const dict = {};
                rows.forEach(r => {
                    const code = r['선박종류코드'];
                    const name = r['선박종류명'];
                    if (code) dict[code] = name;
                });
                setVesselDict(dict);
            })
            .catch(err => console.error('vessel CSV fetch error:', err));

        // 2) dom_od CSV 읽어서 { DOM_OD: PORT_NM } 형태로
        fetch(DOM_OD_CSV_URL)
            .then(res => res.text())
            .then(txt => {
                const rows = parseAndClean(txt);
                const dict = {};
                rows.forEach(r => {
                    const od = r['DOM_OD'];
                    const port = r['PORT_NM'];
                    if (od) dict[od] = port;
                });
                setDomOdDict(dict);
            })
            .catch(err => console.error('dom_od CSV fetch error:', err));
    }, []);


    const aggregatedByType = useMemo(() => {
        const acc = {};
        csvRows.forEach(row => {
            const port = row['청코드'];
            // selectedPortCode가 있으면 해당 항만(청코드)만
            if (selectedPortCode && port !== selectedPortCode) return;

            const type = row['선종코드'];
            const cnt = Number(row['척수']) || 0;
            const rowYear = String(row['년']);
            const rowMonth = String(row['월']).padStart(2, '0');

            // selectedDate가 있으면 연·월 필터
            if (selectedDate?.year && selectedDate?.month) {
                const selYear = String(selectedDate.year);
                const selMonth = String(selectedDate.month).padStart(2, '0');
                if (rowYear !== selYear || rowMonth !== selMonth) return;
            }

            if (!type) return;
            acc[type] = (acc[type] || 0) + cnt;
        });

        // return Object.entries(acc)
        //     .map(([type, count]) => ({ type, count }));
        return Object.entries(acc)
            .map(([type, count]) => ({
                type: vesselDict[type] || type, // VESSEL_CODE가 없으면 원래 type 사용
                count,
            }));
            
    }, [csvRows, selectedDate, selectedPortCode]);

    const dataByOd = useMemo(() => {
        const acc = {};
        csvRows.forEach(row => {
            if (selectedPortCode && row['청코드'] !== selectedPortCode) return;
            if (selectedDate?.year && selectedDate?.month) {
                const ry = String(row['년']);
                const rm = String(row['월']).padStart(2, '0');
                const sy = String(selectedDate.year);
                const sm = String(selectedDate.month).padStart(2, '0');
                if (ry !== sy || rm !== sm) return;
            }
            const od = row['국내 OD'];
            const ton = Number(row['총톤수']) || 0;
            if (!od) return;
            acc[od] = (acc[od] || 0) + ton;
        });
        // return Object.entries(acc)
        //     .map(([od, ton]) => ({ od, ton }))
        //     .sort((a, b) => b.ton - a.ton);
        return Object.entries(acc)
            .map(([od, ton]) => ({
                od: domOdDict[od] || od, // DOM_OD가 없으면 원래 od 사용
                ton,
            }))
    }, [csvRows, selectedDate, selectedPortCode]);

    const chartData = useMemo(() => {
        const total = dataByOd.reduce((sum, { ton }) => sum + ton, 0);
        const threshold = 0.05; // 5% 미만은 기타로
        const main = [];
        let otherSum = 0;

        dataByOd.forEach(item => {
            if (item.ton / total >= threshold) {
                main.push(item);
            } else {
                otherSum += item.ton;
            }
        });

        if (otherSum > 0) {
            main.push({ od: '기타', ton: otherSum });
        }
        return main;
    }, [dataByOd]);

    if (aggregatedByType.length === 0 && chartData.length === 0) {
        return <div>시각화할 데이터가 없습니다.</div>;
    }

    const COLORS = [
        '#4E79A7', // 원본 블루
        '#59A14F', // 원본 그린
        '#F28E2B', // 원본 오렌지
        '#E15759', // 원본 레드
        '#76B7B2', // 원본 민트
        '#EDC948', // 노랑
        '#B07AA1', // 퍼플
        '#FF9DA7', // 라이트 코랄
        '#9C755F', // 브라운 톤
        '#BAB0AC'  // 그레이 톤
    ];

    

    return (
        <div style={{ width: '100%', height: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={aggregatedByType}
                    margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                        dataKey="type"
                        label={{ value: '선종', position: 'insideBottom', offset: -10 }}
                    />
                    <YAxis>
                        <Label value="총 척수" angle={-90} position="insideLeft" offset={10} />
                    </YAxis>
                    <Tooltip formatter={value => `${value} 척`} />
                    <Bar dataKey="count" name="척수" fill='#FFB6C1'>
                        <LabelList dataKey="count" position="top" />
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
            <ResponsiveContainer width="100%" height={400}>
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
                            <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip formatter={value => `${value.toLocaleString()} 톤`} />
                    <Legend verticalAlign="bottom" height={36} />
                </PieChart>
            </ResponsiveContainer>
        </div>


    );
}

export default AnalysisResultPanel;
