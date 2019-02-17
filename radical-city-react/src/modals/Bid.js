import Config from '../config';
import React, {Component} from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Dropdown from 'react-bootstrap/Dropdown';
import {getWeb3} from '../utils/web3';

class Bid extends Component {
  constructor(props) {
    super(props);
    this.state = {
      propertyType: '',
      bid: '',
    };
    this.sendTransaction = this.sendTransaction.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
  }

  async componentDidMount() {
    this.web3 = await getWeb3();
  }

  handleInputChange(event) {
    this.setState({
      [event.target.name]: event.target.value,
    });
  }
  sendTransaction() {
    this.web3.eth.sendTransaction(
      {
        from: this.web3.eth.accounts[0],
        to: Config.gameContractAddr,
        value: this.state.bid * 1000000000000000000,
      },
      (err, tx) => {
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
            <Modal.Title>Your bid</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <label> Bid (ETH) </label>
            <input
              name="bid"
              type="number"
              value={this.state.bid}
              onChange={this.handleInputChange}
              className="form-control"
            />
            <label> Type </label>
            <select
              name="propertyType"
              value={this.state.type}
              onChange={this.handleInputChange}
              className="form-control">
              <option value="residential">Residential</option>
              <option value="industrial">Industrial</option>
              <option value="commmerical">Commerical</option>
            </select>
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
export default Bid;
