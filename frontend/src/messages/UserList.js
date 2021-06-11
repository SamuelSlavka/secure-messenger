import React, { useEffect, useState } from 'react';
import ListGroup from 'react-bootstrap/ListGroup'
import Nav from 'react-bootstrap/Nav'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Modal from 'react-bootstrap/Modal'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import { getBalance, getPK } from './web3Func';
import { MessageList } from '../messages/MessageList';

const token = sessionStorage.getItem('token');

const serverAddr = 'http://192.168.1.11:5000';


export function UserList() {
  // Modals
  const [showPK, setShowPK] = useState(false);
  const [showCreate, setShowCreate] = useState(false);

  const handleClosePK = () => setShowPK(false);
  const handleShowPK = () => setShowPK(true);

  const handleCloseCreate = () => setShowCreate(false);
  const handleShowCreate = () => setShowCreate(true);

  // Info collection
  const [balance, setBalance] = useState(0);
  const [address, setAddress] = useState('');
  const [username, setUsername] = useState('');

  const [contact, setContact] = useState({ switch: false, contactName: "", contactAddress: "", myAddress: "", myName: "" });



  useEffect(() => {
    async function fetchAuth() {
      var res = await fetch(serverAddr + '/api/info', {
        method: 'post',
        headers: { Authorization: 'Bearer ' + token },
        body: JSON.stringify({})
      })
      var info = await res.json();

      setAddress(info.userAddr)
      setUsername(info.userName)

      if (info.userAddr !== null && info.userAddr !== '') {
        var nb = await getBalance(info.userAddr)
        setBalance(nb)
      }
    }
    fetchAuth();
  }, []);

  function alertClicked(val) {
    console.log(val)
    var json = JSON.parse(val)
    setContact({ ...contact, 'result': true, contactName: json.username, contactAddress: json.address, myAddress: address, myName: username });
  }

  return [
    contact.result
      ? <MessageList props={contact} />
      :
      <div>
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
                <Form.Control type="text" placeholder="Enter username" />
              </Form.Group>

              <Form.Group controlId="formBasicUsername">
                <Form.Label>Address</Form.Label>
                <Form.Control type="text" placeholder="Enter address" />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseCreate}>
              Close
            </Button>
            <Button variant="primary" onClick={handleCloseCreate}>
              Save Changes
            </Button>
          </Modal.Footer>
        </Modal>

        <Nav>
          <Nav.Item>
            <Nav.Link disabled><h3>Contacts</h3></Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link disabled>Your address: {address}</Nav.Link>
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
          <ListGroup.Item action onClick={() => alertClicked('{"username":"samo","address":"0x1cE2A975f9a4424337897351121074A028847CC1"}')}>
            <Row>
              <Col><p>samo</p></Col>
              <Col><p>0x1cE2A975f9a4424337897351121074A028847CC1</p></Col>
            </Row>
          </ListGroup.Item>
          <ListGroup.Item action onClick={() => alertClicked('{"username":"nthi","address":"0xF23638EF855ECB3D1716cA93593CA28A8491F7fa"}')}>
            <Row>
              <Col><p>nthi</p></Col>
              <Col><p>0xF23638EF855ECB3D1716cA93593CA28A8491F7fa</p></Col>
            </Row>
          </ListGroup.Item>
        </ListGroup>
      </div>


  ];
}
