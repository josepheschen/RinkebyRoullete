import React, { Component } from "react";
import {connect} from "react-redux";
import { Button, Header, Icon, Form, Message } from "semantic-ui-react";
import {Link} from "react-router-dom";

function mapStateToProps(state) {
    return {
        CZ: state.CZ,//change to contract variable
        userAddress: state.userAddress
    };
}

class Greeting extends Component {
    state = {
        message: "",
        betType: null,
        betAmount: 0,
        betSpecifics: "",
        loading: false
    };
    //change to work with our contract submit method
    onSubmit = async event => {
        event.preventDefault();
        this.setState({
            loading: true,
            errorMessage: "",
            message: "waiting for blockchain transaction to complete..."
        });
        try {
            console.log(this.props);
            let result = this.props.CZ.methods
                .transferFrom(this.props.userAddress, this.state.value, this.state.zombieId) // contains the zombie ID and the new name
                .send({
                    from: this.props.userAddress
                });

            this.setState({
                loading: false,
                message: result
            });
        } catch (err) {
            this.setState({
                loading: false,
                errorMessage: err.message,
                message: "User rejected transaction"
            });
        }
    };

  render() {
    const imgStyle = {
      display: "block",
      marginLeft: "auto",
      marginRight: "auto",
      width: "50%"
    };

    return (
      <div>
        <br />
        <h2 style={{ color: "DarkRed", textAlign: "center" }}>
          {" "}
          Welcome to the <b> RinkebyRoullete</b> game!
        </h2>
        <br />
        <img src="static/images/wheel.jpg" style={imgStyle} width="400px" alt="roullete wheel" />
        <br /> <br />
        <p style={{ textAlign: "center" }}>
          To begin, select a bet type, amount and specifics below.
          <br /> Then once you are ready to bet, press the bet button!
        </p>

          <Form onSubmit={this.onSubmit} error={!!this.state.errorMessage}>
              <Form.Group inline>
                  <label>Bet Type</label>
                  <Form.Radio
                      label='Straight Up (35:1)'
                      checked={this.state.betType===0}
                      onChange={event => this.setState({
                          betType: 0
                      })}
                  />
                  <Form.Radio
                      label='Street/Row (11:1)'
                      checked={this.state.betType === 1}
                      onChange={event => this.setState({
                          betType: 1
                      })}
                  />
                  <Form.Radio
                      label='Line/Col (5:1)'
                      checked={this.state.betType === 2}
                      onChange={event => this.setState({
                          betType: 2
                      })}
                  />
                  <Form.Radio
                      label='Color (1:1)'
                      checked={this.state.betType === 3}
                      onChange={event => this.setState({
                          betType: 3
                      })}
                  />
                  <Form.Radio
                      label='Odd/Even'
                      checked={this.state.betType === 4}
                      onChange={event => this.setState({
                          betType: 4
                      })}
                  />
              </Form.Group>
              <Form.Field>
                  <label>Bet Specifics</label>
                  <input
                      onChange={event =>
                          this.setState({
                              betSpecifics: event.target.value
                          })
                      }
                  />
              </Form.Field>
              <Form.Field>
                  <label>Bet Amount(Greater than 0.01 ETH)</label>
                  <input
                      onChange={event =>
                          this.setState({
                              betAmount: event.target.value
                          })
                      }
                  />
              </Form.Field>
              <Message error header="Oops!" content={this.state.errorMessage} />
              <Button primary type="submit" loading={this.state.loading}>
                  <Icon name="check" />
                  Bet!
              </Button>
              <hr />
              <h2>{this.state.message}</h2>
          </Form>

      </div>
    );
  }
}

export default connect(mapStateToProps)(Greeting);
