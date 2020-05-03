import React, { Component } from "react";
import { Link } from "react-router-dom";
import { connect } from "react-redux";

import { Button } from "semantic-ui-react";

//import CreateZombie from "./CreateZombie";

import { Menu, Header } from "semantic-ui-react";

function mapStateToProps(state) {
  return {
    userAddress: state.userAddress,
  };
}

// This renders the topbar on the webpage as well as the lines listing address and zombie count.

class TopBar extends Component {
  render() {
    return (
      <div>
        <Menu style={{ marginTop: "10px", backgroundColor: "Salmon" }}>
          <Menu.Item position="left">
            <Link to={{ pathname: "/" }}>
              <Header size="large">RinkebyRoullete!</Header>
            </Link>
          </Menu.Item>
        </Menu>
        Your account address: {this.props.userAddress}
        <hr />
      </div>
    );
  }
}

export default connect(mapStateToProps)(TopBar);
