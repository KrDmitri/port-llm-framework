import React from 'react';
import VesselFilePanel from './VesselFilePanel';
import ContainerFilePanel from './ContainerFilePanel';

function SidePanel() {
    return (
        <div>
            <div className='vessel-file-panel'>
                <VesselFilePanel />
            </div>

            <div className='container-file-panel'>
                <ContainerFilePanel />
            </div>
        </div>
    );
}

export default SidePanel;
