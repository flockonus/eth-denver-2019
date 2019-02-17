import Config from '../config';
import React, {Component} from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import {getWeb3, getGameContractInstance} from '../utils/web3';

class JoinMatch extends Component {
  constructor(props) {
    super(props);
    this.state = {
      matchID: '',
    };
    this.sendTransaction = this.sendTransaction.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
  }

  async componentDidMount() {
    this.web3 = await getWeb3();
    this.contractInstance = getGameContractInstance();
  }

  handleInputChange(event) {
    this.setState({
      [event.target.name]: event.target.value,
    });
  }
  sendTransaction() {
    this.contractInstance.joinGame(
      1,
      {value: 0, gas: 200000},
      (err, result) => {
        this.props.handleClose();
      },
    );
  }
  render() {
    const {showModal, handleClose} = this.props;
    return (
      <>
        <Modal show={showModal} onHide={handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>Join Match</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <label> Match ID </label>
            <input
              name="matchID"
              type="number"
              value={this.state.matchID}
              onChange={this.handleInputChange}
              className="form-control"
            />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Close
            </Button>
            <Button
              type="submit"
              variant="primary"
              onClick={this.sendTransaction}>
              Submit
            </Button>
          </Modal.Footer>
        </Modal>
      </>
    );
  }
}
export default JoinMatch;
