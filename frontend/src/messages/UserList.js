import React, { useState, useEffect } from 'react';
import ListGroup from 'react-bootstrap/ListGroup'
import Nav from 'react-bootstrap/Nav'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Modal from 'react-bootstrap/Modal'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import Tooltip from 'react-bootstrap/Tooltip'
import OverlayTrigger from 'react-bootstrap/OverlayTrigger'
import { getBalance, getPK, getContacts, askForMoney } from './web3Func';
import { MessageList } from '../messages/MessageList';


export function UserList(args) {
  const address = args.props.address;
  //auto refresh state
  const [interv, setInterv] = useState(-1);
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
  const handlePoor = (e) => { askForMoney(address); }
  
  //ask for founds tooltip
  const renderTooltip = (props) => (
    <Tooltip id="button-tooltip" {...props}>
      You will recieve your founds shortly, please dont spam this button :D
    </Tooltip>
  );

  const [contactList, setContactList] = useState({ contacts: [] });
  const [contact, setContact] = useState({ result: false, contactName: "", contactAddress: "",address: "", username: "", info: "" });

  const [balance, setBalance] = useState(0);

  //stops timer and redircts to messages
  function alertClicked(val) {
    if(interv !== -1){
      clearInterval(interv);
      setInterv(-1);
    }
    setContact({ ...contact, result: true, contactName: val.username, contactAddress: val.address, address: args.props.address, username: args.props.username, info: args.props.info });
  }

  //Contract element
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
    var timerID = -1;
    //periodically fetches balance and contract list
    async function fetchAuth() {
      //store time ID
      if(timerID !== -1)
        setInterv(timerID);
      //fetches account balance
      if (args.props.address !== null && args.props.address !== '') {
        let nb = await getBalance(args.props.address);
        setBalance(nb);
      }
      //fetches contact list
      if (args.props.address !== null && args.props.address !== '') {
        let nb = await getContacts(args.props.address);
        let data = []
        if (typeof nb.result !== 'undefined' && nb.result.length) {
          nb.result.forEach(el => {
            data.push({ "username": el[1], "address": el[0] })
          });
          setContactList({ contacts: [...contactList.contacts, ...data] });
        }
      }
    }
    
    fetchAuth();
    //sets timer for next fetch
    if(!contact.result){
      timerID = setInterval(() => {
        if(!contact.result){        
          fetchAuth();
        }
      }, 20000);
    }
    return () => {
      clearInterval(timerID)
    }
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
            <Nav.Link disabled className="accountInfo">Your address: {address}</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link disabled className="accountInfo">Your balance: {balance}</Nav.Link>
          </Nav.Item>
        </Nav>
        <Nav>
          <Nav.Item>
            <Nav.Link eventKey="link-2" onClick={handleShowPK} >Show PK</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <OverlayTrigger
              placement="right"
              delay={{ show: 250, hide: 400 }}
              overlay={renderTooltip}>
              <Nav.Link eventKey="link-3" onClick={handlePoor} >Reqest founds</Nav.Link>
            </OverlayTrigger>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="link-4" onClick={handleShowCreate} >Create a new Contact</Nav.Link>
          </Nav.Item>
        </Nav>
        <ListGroup variant="flush" >
          {contactList.contacts.map(function (d, index) {
            return (
              <Contact key={index} props={d} />
            )
          })}
        </ListGroup>
      </div >


  ];
}
