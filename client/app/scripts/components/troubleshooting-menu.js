import React from 'react';
import { connect } from 'react-redux';

// -d 'dpdk|192.168.122.224:50051|
//  10.0.5.4/0,10.0.207.0/8,0/0,0/0,0/0;sum,volume,1000;32,32,8,16,16;100'
class DebugMenu extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = { data: 'dpdk|192.168.122.224:50051|10.0.5.4/0,10.0.207.0/8,0/0,0/0,0/0;sum,volume,1000;32,32,8,16,16;100', monitor: 'http://10.104.211.137/'};
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  reset() {
    // ev.preventDefault();
    // this.props.resetLocalViewState();
    this.setState({
      data: 'dpdk'
    });
  }

  handleChange(e) {
    this.setState({[e.target.name]: e.target.value});
  }

/*
 const result = `${this.state.data} : ${this.state.monitor}`;
*/
  handleSubmit(ev) {
    const blob = new Blob(this.state.data, {type: 'text/plain'});
    fetch(this.state.monitor, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: blob
    });
    ev.preventDefault();
    // this.props.resetLocalViewState();
  }

  render() {
    return (
      <div className="troubleshooting-menu-wrapper">
        <div className="troubleshooting-menu-content">
          <h3>Network Control & Monitor</h3>
          <h4>{new Date().toLocaleTimeString()}</h4>
          <h4>{this.props.name}</h4>
          <div className="troubleshooting-menu-item" style={{height: 600, width: 800}}>
            <h4>Post Request to Monitor Server:</h4>
            <form onSubmit={this.handleSubmit}>
              <label htmlFor="post-request">
                Parameter:
              </label>
              <br />
              <textarea
                style={{width: 640, height: 360, borderColor: 'gray', borderWidth: 2}}
                value={this.state.data} name="data" onChange={this.handleChange} />
              <br />
              <br />
              <label htmlFor="monitor-server">
                Monitor Server:
              </label>
              <br />
              <input
                type="text"
                style={{width: 540, borderColor: 'gray', borderWidth: 2}}
                value={this.state.monitor} name="monitor" onChange={this.handleChange} />
              <br />
              <br />
              <input type="submit" value="Submit" />
            </form>
          </div>
        </div>
      </div>
    );
  }
}

export default connect(null)(DebugMenu);
