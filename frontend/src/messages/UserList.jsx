import React, { useState, useEffect } from 'react';
import ListGroup from 'react-bootstrap/ListGroup';
import Nav from 'react-bootstrap/Nav';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Tooltip from 'react-bootstrap/Tooltip';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import PropTypes from 'prop-types';
import {
  getPK, getContacts, askForMoney, getAddressFromName, isUserRegistred,
} from './generalFunc';

import { getBalance } from './web3Func';

export default function UserList({ args }) {
  const { address } = args.data;
  // Auto refresh state
  const [interv, setInterv] = useState(-1);
  // Modals
  const [showPK, setShowPK] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [contactUsername, setContactUsername] = useState('');
  const [contactAddress, setContactAddress] = useState('');
  const [switchState, setSwitchState] = useState(false);
  // Dynamic page elements
  const handleClosePK = () => setShowPK(false);
  const handleShowPK = () => setShowPK(true);
  const handleCloseCreate = () => setShowCreate(false);
  const handleShowCreate = () => setShowCreate(true);
  const handleAddressChange = (e) => { setContactAddress(e.target.value); };
  const handleUsernameChange = (e) => { setContactUsername(e.target.value); };
  const handlePoor = () => { askForMoney(address); };
  // Dynamic information elements
  const [contactList, setContactList] = useState({ contacts: [] });
  const [contact, setContact] = useState({ contactName: '', contactAddress: '' });
  const [balance, setBalance] = useState(0);

  // ask for founds tooltip
  const renderTooltip = () => (
    <Tooltip id="tooltip-top">
      You will recieve your founds shortly, please dont spam this button :D
    </Tooltip>
  );

  // stops timer and redircts to messages
  function contactClicked(val) {
    if (interv !== -1) {
      clearInterval(interv);
      setInterv(-1);
    }
    setContact({
      ...contact,
      contactName: val.username,
      contactAddress: val.address,
    });

    setSwitchState(true);

    const cont = {
      address: args.data.address,
      username: args.data.username,
      contactName: val.username,
      contactAddress: val.address,
      info: args.data.info,
    };

    // input.state input.message
    args.parent({ state: 'messagelist', message: cont });
  }

  // creates a new contact
  const handleSaveCloseCreate = async (username, inAddress) => {
    let addr = inAddress;
    if (inAddress === '') {
      addr = await getAddressFromName(username);
    }

    if (await isUserRegistred(username, addr)) {
      const data = { username, address: addr };
      setShowCreate(false);
      setContactList({ contacts: [...contactList.contacts, data] });
    }
  };

  useEffect(() => {
    let timerID = -1;
    // periodically fetches balance and contract list
    async function fetchAuth() {
      // store time ID
      if (timerID !== -1) setInterv(timerID);
      // fetches account balance and contact list
      if (args.data.address !== null && args.data.address !== '') {
        const [nb, contacts] = await Promise.all([
          getBalance(args.data.address),
          getContacts(args.data.address, contactList.contacts.length),
        ]);

        setBalance(nb);

        const data = [];
        if (typeof contacts.result !== 'undefined' && contacts.result.length) {
          contacts.result.forEach((el) => {
            data.push({ username: el[1], address: el[0] });
          });
          setContactList({ contacts: [...contactList.contacts, ...data] });
        }
      }
    }

    fetchAuth();
    // sets timer for next fetch
    if (!switchState) {
      timerID = setInterval(() => {
        if (!switchState) {
          fetchAuth();
        }
      }, 4000);
    }
    return () => {
      clearInterval(timerID);
    };
    // eslint-disable-next-line
  }, [args.data.address, args.data.info]);

  return (
    <div key="top" className="contacts">
      <Modal dialogClassName="modal-90w" show={showPK} onHide={handleClosePK} animation={false}>
        <Modal.Header closeButton>
          <Modal.Title>
            {' '}
            <p> Write this down! </p>
            {' '}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {' '}
          {getPK()}
          {' '}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClosePK}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showCreate} onHide={handleCloseCreate} animation={false}>
        <Modal.Header closeButton>
          <Modal.Title>Create a new contact</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Label>Insert only username or both</Form.Label>
          <Form>
            <Form.Group controlId="formBasicUsername">
              <Form.Label>Username</Form.Label>
              <Form.Control type="text" value={contactUsername} onChange={handleUsernameChange} placeholder="Enter username" autoComplete="new-password" />
            </Form.Group>

            <Form.Group controlId="formBasicUsername">
              <Form.Label>Address</Form.Label>
              <Form.Control type="text" value={contactAddress} onChange={handleAddressChange} placeholder="Enter address" autoComplete="new-password" />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseCreate}>
            Close
          </Button>
          <Button variant="primary" onClick={() => handleSaveCloseCreate(contactUsername, contactAddress)}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
      <Nav>
        <Nav.Item>
          <Nav.Link disabled><h3>Contacts</h3></Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link disabled className="accountInfo">
            Your address:
            {address}
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link disabled className="accountInfo">
            Your balance:
            {balance}
          </Nav.Link>
        </Nav.Item>
      </Nav>
      <Nav>
        <Nav.Item>
          <Nav.Link eventKey="link-2" onClick={handleShowPK}>Show PK</Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <OverlayTrigger
            placement="top"
            delay={{ show: 250, hide: 400 }}
            overlay={renderTooltip}
          >
            <Nav.Link eventKey="link-3" onClick={handlePoor}>Reqest founds</Nav.Link>
          </OverlayTrigger>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="link-4" onClick={handleShowCreate}>Create a new Contact</Nav.Link>
        </Nav.Item>
      </Nav>
      <ListGroup variant="flush">
        {contactList.contacts.map((data, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <ListGroup.Item key={index} action onClick={() => contactClicked(data)}>
            <Row>
              <Col><p>{data.username}</p></Col>
              <Col><p>{data.address}</p></Col>
            </Row>
          </ListGroup.Item>
        ))}
      </ListGroup>
    </div>
  );
}

UserList.propTypes = {
  args: PropTypes.shape({
    parent: PropTypes.func,
    data: PropTypes.shape({
      address: PropTypes.string,
      username: PropTypes.string,
      info: PropTypes.shape({
        abi: PropTypes.string,
        address: PropTypes.string,
        userAddr: PropTypes.string,
        username: PropTypes.string,
      }),
    }),
  }),
};

UserList.defaultProps = {
  args: {},
};
