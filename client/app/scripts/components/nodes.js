import React from 'react';
import { connect } from 'react-redux';
import { debounce } from 'lodash';

import NodesChart from '../charts/nodes-chart';
import NodesGrid from '../charts/nodes-grid';
import NodesResources from '../components/nodes-resources';
import NodesControl from '../components/nodes-control';
// import NodesError from '../charts/nodes-error';
import DelayedShow from '../utils/delayed-show';
import { Loading, getNodeType } from './loading';
import { isTopologyEmpty } from '../utils/topology-utils';
import { setViewportDimensions } from '../actions/app-actions';
import {
  isGraphViewModeSelector,
  isTableViewModeSelector,
  isResourceViewModeSelector,
  isControlViewModeSelector,
} from '../selectors/topology';

import { VIEWPORT_RESIZE_DEBOUNCE_INTERVAL } from '../constants/timer';

const navbarHeight = 194;
const marginTop = 0;

class Nodes extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.setDimensions = this.setDimensions.bind(this);
    this.handleResize = debounce(this.setDimensions, VIEWPORT_RESIZE_DEBOUNCE_INTERVAL);
    this.setDimensions();
  }

  componentDidMount() {
    window.addEventListener('resize', this.handleResize);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
  }

  render() {
    const { topologiesLoaded, nodesLoaded, topologies, currentTopology,
      isGraphViewMode, isTableViewMode, isResourceViewMode, isControlViewMode } = this.props;

    // TODO: Rename view mode components.
    return (
      <div className="nodes-wrapper">
        <DelayedShow delay={1000} show={!topologiesLoaded || (topologiesLoaded && !nodesLoaded)}>
          <Loading itemType="topologies" show={!topologiesLoaded} />
          <Loading
            itemType={getNodeType(currentTopology, topologies)}
            show={topologiesLoaded && !nodesLoaded} />
        </DelayedShow>
        {isGraphViewMode && <NodesChart />}
        {isTableViewMode && <NodesGrid />}
        {isResourceViewMode && <NodesResources />}
        {isControlViewMode && <NodesControl />}
      </div>
    );
  }

  setDimensions() {
    const width = window.innerWidth;
    const height = window.innerHeight - navbarHeight - marginTop;
    this.props.setViewportDimensions(width, height);
  }
}


function mapStateToProps(state) {
  return {
    isGraphViewMode: isGraphViewModeSelector(state),
    isTableViewMode: isTableViewModeSelector(state),
    isResourceViewMode: isResourceViewModeSelector(state),
    isControlViewMode: isControlViewModeSelector(state),
    currentTopology: state.get('currentTopology'),
    nodesLoaded: state.get('nodesLoaded'),
    topologies: state.get('topologies'),
    topologiesLoaded: state.get('topologiesLoaded'),
    topologyEmpty: isTopologyEmpty(state),
  };
}


export default connect(
  mapStateToProps,
  { setViewportDimensions }
)(Nodes);
