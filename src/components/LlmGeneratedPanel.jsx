import React from 'react';
import HistoryPanel from './HistoryPanel';
import LlmResultPanel from './LlmResultPanel';

function LlmGeneratedPanel({ generatedCode, vesselData, selectedDate, selectedPortCode }) {
    return (
        <>
            <div className="history-panel">
                <HistoryPanel/>
            </div>
            <div className="llm-result-panel">
                <LlmResultPanel
                    generatedCode={generatedCode}
                    vesselData={vesselData}
                    selectedDate={selectedDate}
                    selectedPortCode={selectedPortCode}
                />
            </div>
        </>
    );
}

export default LlmGeneratedPanel;
