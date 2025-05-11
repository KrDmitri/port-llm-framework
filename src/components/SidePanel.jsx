import React from 'react';
import VesselFilePanel from './VesselFilePanel';
import ContainerFilePanel from './ContainerFilePanel';

function SidePanel({ onVesselDataParsed, onContainerDataParsed }) {
    return (
        <>
            <VesselFilePanel onFileUpload={onVesselDataParsed}/>
            <ContainerFilePanel onFileUpload={onContainerDataParsed}/>
            {/* <div className='vessel-file-panel'>
                <VesselFilePanel onFileUpload={onVesselDataParsed}/>
            </div>

            <div className='container-file-panel'>
                <ContainerFilePanel onFileUpload={onContainerDataParsed}/>
            </div> */}
        </>
    );
}

export default SidePanel;
