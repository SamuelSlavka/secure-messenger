import React, { useEffect, useState } from 'react';
import ListGroup from 'react-bootstrap/ListGroup'
import Nav from 'react-bootstrap/Nav'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Modal from 'react-bootstrap/Modal'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import { getBalance, getPK, getContacts } from './web3Func';
import { MessageList } from '../messages/MessageList';

export function UserList(args) {
  // Modals
  const [showPK, setShowPK] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [contactUsername, setContactUsername] = useState('');
  const [contactAddress, setContactAddress] = useState('');

  const handleClosePK = () => setShowPK(false);
  const handleShowPK = () => setShowPK(true);
  const handleCloseCreate = () => setShowCreate(false);
  const handleShowCreate = () => setShowCreate(true);
  const handleAddressChange = (e) => { setContactAddress(e.target.value); };
  const handleUsernameChange = (e) => { setContactUsername(e.target.value); };

  const [contactList, setContactList] = useState({ contacts: [] });
  const [contact, setContact] = useState({ result: false, contactName: "", contactAddress: "", address: "", username: "", info: "" });

  const [balance, setBalance] = useState(0);

  //saved data and redirects
  function alertClicked(val) {
    setContact({ ...contact, result: true, contactName: val.username, contactAddress: val.address, address: args.props.address, username: args.props.username, info: args.props.info });
  }

  const Contact = (data) => {
    return (
      <ListGroup.Item action onClick={() => alertClicked(data.props)}>
        <Row>
          <Col><p>{data.props.username}</p></Col>
          <Col><p>{data.props.address}</p></Col>
        </Row>
      </ListGroup.Item>
    )
  };

  //creates a new contact 
  const handleSaveCloseCreate = (username, address) => {
    const data = { "username": username, "address": address }
    setShowCreate(false);
    setContactList({ contacts: [...contactList.contacts, data] })
  }

  useEffect(() => {
    //fetches account balance
    async function fetchAuth() {
      if (args.props.address !== null && args.props.address !== '') {
        var nb = await getBalance(args.props.address);
        setBalance(nb);
      }
      //fetches contact list
      if (args.props.address !== null && args.props.address !== '') {
        var nb = await getContacts(args.props.address);
        var data = []
        nb.result.forEach(el => {
          data.push({ "username": el[1], "address": el[0] })
        });
        setContactList({ contacts: [...contactList.contacts, ...data] });
      }
    }
    fetchAuth();
  }, [args.props.address]);



  return [
    contact.result
      ? <MessageList key='MessageList' props={contact} />
      :
      <div key='top'>
        <Modal dialogClassName="modal-90w" show={showPK} onHide={handleClosePK} animation={false}>
          <Modal.Header closeButton>
            <Modal.Title> <p> Write this down! </p> </Modal.Title>
          </Modal.Header>
          <Modal.Body> {getPK()} </Modal.Body>
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
            <Button variant="primary" onClick={() => handleSaveCloseCreate(contactUsername, contactAddress)} >
              Save Changes
            </Button>
          </Modal.Footer>
        </Modal>

        <Nav>
          <Nav.Item>
            <Nav.Link disabled><h3>Contacts</h3></Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link disabled>Your address: {args.props.address}</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link disabled>Your balance: {balance}</Nav.Link>
          </Nav.Item>
        </Nav>
        <Nav>
          <Nav.Item>
            <Nav.Link eventKey="link-2" onClick={handleShowPK} >Show PK</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="link-3" onClick={handleShowCreate} >Create a new Contact</Nav.Link>
          </Nav.Item>
        </Nav>

        <ListGroup variant="flush" >
          {contactList.contacts.map(function (d, index) {
            return (
              <Contact key={index} props={d} />
            )
          })}
        </ListGroup>
      </div>


  ];
}
