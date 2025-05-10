import React from 'react';
import AnalysisResultPanel from './AnalysisResultPanel';
import MapPanel from './MapPanel';
import TimeLinePanel from './TimeLinePanel';

function MainPanel({ vesselData, containerData, selectedDate, onDateSelect, onPortClick, selectedPortCode }) {
    
    return (
        <>
            <div className="map-panel">
                <MapPanel
                    vesselData={vesselData}
                    containerData={containerData}
                    selectedDate={selectedDate}
                    onPortClick={onPortClick}
                    selectedPortCode={selectedPortCode}
                />
            </div>

            <div className="timeline-panel">
                <TimeLinePanel
                    start={new Date(2022, 0, 1)}
                    end={new Date(2023, 11, 1)}
                    onDateSelect={onDateSelect}
                    selectedDate={selectedDate}
                />
            </div>

            <div className="analysis-result-panel">
                <AnalysisResultPanel 
                    vesselData={vesselData}
                    containerData={containerData}
                    selectedDate={selectedDate}
                    selectedPortCode={selectedPortCode}
                />
            </div>
        </>
    );
}

export default MainPanel;
