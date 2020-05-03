import React, { Component } from "react";
import {connect} from "react-redux";
import { Button, Icon, Form, Message, Modal, Segment, Grid, Label} from "semantic-ui-react";

function mapStateToProps(state) {
    return {
        CZ: state.CZ,//change to contract variable
        userAddress: state.userAddress,
		web3Instance: state.web3Instance
    };
}

class Greeting extends Component {
    state = {
        message: "",
        betType: null,
        betAmount: 0,
        betSpecifics: "",
        loading: false,
        donateAmount: 0
    };
    modalRules = (
        <Modal style={{textAlign:"center"}} trigger={<Button>Rules</Button>}>
            <Modal.Content>
                <Modal.Description>
                    <p>Straight up: betSpecifics = number</p>
                    <p>Street or row: betSpecifics = row user is referencing (0 = 123, 1 = 456, etc.)</p>
                    <p>Line or Column: betSpecifics = column user is referencing ( 0 = 1,4,7..., 1 = 2,5,8... etc.)</p>
                    <p>Color: betSpecifics = 0 for black, 1 for red</p>
                    <p>Odd/Even: betSpecifics = 0 for even, 1 for odd</p>
                </Modal.Description>
            </Modal.Content>
        </Modal>);

    modalDonate = (
        <Modal style={{textAlign:"center"}} trigger={<Button>Donate</Button>}>
            <Modal.Content>
                <Modal.Description>
                    <Form.Field>
                        <label>Please enter an amount you would like to donate to the house</label>
                        <input
                            placeholder="Greater than 0.01 ETH"
                            onChange={event =>
                                this.setState({
                                    donateAmount: event.target.value
                                })
                            }
                        />
                    </Form.Field>
							<Button primary type="submit" loading={this.state.loading} onClick={()=>{this.submitDonate()}}>
                        <Icon name="check" />
                        Donate
                    </Button>
                </Modal.Description>
            </Modal.Content>
        </Modal>);

    submitDonate = async () => {
        this.setState({
            loading: true,
            errorMessage: "",
            message: "waiting for blockchain transaction to complete..."
        });
        try {
			alert(this.props.web3Instance.utils.toWei(this.state.donateAmount, "ether"));
            let result = this.props.CZ.methods
                .donateToHouse() // contains the zombie ID and the new name
                .send({
					value: this.props.web3Instance.utils.toWei(this.state.donateAmount, "ether"),
                    from: this.props.userAddress
                });

            let msg =


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
				alert(err);
        }
    }

    onCashOut = async () => {
        this.setState({
            loading: true,
            errorMessage: "",
            message: "waiting for blockchain transaction to complete..."
        });
        try {
            let result = this.props.CZ.methods
                .cashOut() // contains the zombie ID and the new name
                .send({
                    from: this.props.userAddress
                });

            let msg =


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
				alert(err);
        }
    }

    //change to work with our contract submit method
    onSubmit = async event => {
       // event.preventDefault();
        this.setState({
            loading: true,
            errorMessage: "",
            message: "waiting for blockchain transaction to complete..."
        });
        try {
             let result = await this.props.CZ.methods
                .placeBet(this.state.betType, this.state.betSpecifics)
                .send({
					value: this.props.web3Instance.utils.toWei(this.state.betAmount, "ether"),
                    from: this.props.userAddress
                });

            let roll = await this.props.CZ.methods
                .roulleteRoll()
				.send({
					from: this.props.userAddress
				});
				
				this.props.CZ.events.allEvents()
				.on('data', (event) => {
					console.log(event);
					if(event.event.localeCompare("BettingResult") == 0){
						alert(event.returnValues['0']);
		            	this.setState({
		                	loading: false,
		                	message: event.returnValues['0']
		            	});
					}
				})
				.on('error', console.error);

            let msg =


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
          <br/>
          <div>
              <Segment>
                  <Grid>
                      <Grid.Column textAlign="center">
                          {this.modalRules}
                          {this.modalDonate}
                      </Grid.Column>
                  </Grid>
              </Segment>
          </div>
          <br/>

          <Form error={!!this.state.errorMessage}>
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
                      label='Line/Col (3:1)'
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
                  <label>Bet Amount</label>
                  <input
                      placeholder="Greater than 0.01 ETH"
                      onChange={event =>
                          this.setState({
                              betAmount: event.target.value
                          })
                      }
                  />
              </Form.Field>
              <Message error header="Oops!" content={this.state.errorMessage} />
              <Button primary type="submit" loading={this.state.loading} onClick={this.onSubmit}>
                  <Icon name="check" />
                  Bet!
              </Button>

              <Button primary type="submit" onClick={this.onCashOut}>
					  Cashout
              </Button>
              <hr />
              <h2>{this.props.message}</h2>
          </Form>

      </div>
    );
  }
}

export default connect(mapStateToProps)(Greeting);
