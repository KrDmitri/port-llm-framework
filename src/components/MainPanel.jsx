import React from 'react';
import AnalysisResultPanel from './AnalysisResultPanel';
import MapPanel from './MapPanel';
import TimeLinePanel from './TimeLinePanel';

function MainPanel() {
    return (
        <>
            <div className="map-panel">
                <MapPanel />
            </div>

            <div className="timeline-panel">
                <TimeLinePanel />
            </div>
            
            <div className="analysis-result-panel">
                <AnalysisResultPanel />
            </div>
        </>
    );
}

export default MainPanel;
