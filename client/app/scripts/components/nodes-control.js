import React from 'react';
import { connect } from 'react-redux';

// import Logo from './logo';
// import HelpPanel from './help-panel';
import TroubleshootingMenu from './troubleshooting-menu';
// import ControlMenu from './control-menu';
// import NodesResourcesLayer from './nodes-resources/node-resources-layer';
import { layersTopologyIdsSelector } from '../selectors/resource-view/layout';

class NodesControl extends React.Component {
  render() {
    return (
      <div className="nodes-control">
        <TroubleshootingMenu />
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    layersTopologyIds: layersTopologyIdsSelector(state),
  };
}

export default connect(
  mapStateToProps
)(NodesControl);
