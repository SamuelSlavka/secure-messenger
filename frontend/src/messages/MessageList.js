import React, { useEffect, useState } from 'react';
import { UserList } from '../messages/UserList';
import Card from 'react-bootstrap/Card'
import Nav from 'react-bootstrap/Nav'
import Form from 'react-bootstrap/Form'
import FormControl from 'react-bootstrap/FormControl'
import Button from 'react-bootstrap/Button'
import { sendMessageToAddr, getMessagesFromAddr } from './web3Func';


export function MessageList(args) {
  //auto refresh state
  const [interv, setInterv] = useState(-1);

  const [switchState, setSwitchState] = useState(false);
  const [messageList, setMessageList] = useState({ messages: [] });
  const [messageVal, setMessageVal] = useState('');

  const handleMessageChange = (e) => { setMessageVal(e.target.value); };

  //stops timer and redirects to contacts
  function alertClicked() {
    if (interv !== -1) {
      clearInterval(interv);
      setInterv(-1);
    }
    setSwitchState(true)
  }

  //message component
  const Message = (data) => {
    return (
      <Card style={{ width: '100%' }}>
        <Card.Body>
          <Card.Title>{data.props.username}</Card.Title>
          <Card.Subtitle className="mb-2 text-muted">{data.props.address}</Card.Subtitle>
          <Card.Text>
            {data.props.message}
          </Card.Text>
        </Card.Body>
      </Card>
    )
  };

  //handles message creation, encryption and storage
  const handleMessageCreate = (event, username, address, message) => {
    //send to reciever
    sendMessageToAddr(args.props.info, message, args.props.address, args.props.contactAddress, username, args.props.contactName);
    
    event.preventDefault();
    event.stopPropagation();
    const data = { "username": username, "address": address, "message": message }
    setMessageList({ messages: [...messageList.messages, data] })
    setMessageVal("");
  }

  useEffect(() => {
    var timerID = -1;
    //priodiaclly fetches messages for given contact
    async function fetchAuth() {
      if (timerID !== -1)
        setInterv(timerID);
      var res = await getMessagesFromAddr(args.props.info, args.props.address, args.props.contactAddress)
      var data = []
      if (res) {
        if (res.length) {
          res.forEach(el => {
            if (el[0] !== '') {
              data.push({ "username": el[4], "address": el[2], "message": el[6] })
            }
          });
          if (data.length)
            setMessageList({ messages: [...messageList.messages, ...data] });
        }
      }
    }
    //sets timer for next refresh
    fetchAuth();
    if (!switchState) {
      timerID = setInterval(() => {
        if (!switchState)
          fetchAuth();
      }, 15000);
    }
    return () => {
      clearInterval(timerID)
    }
  }, [args.props.address]);


  return [
    switchState
      ? <UserList key="UserList" props={args.props} />
      :
      <div key='nav'>
        <Nav>
          <Nav.Item>
            <Nav.Link disabled><h3>{args.props.contactName}</h3></Nav.Link>
          </Nav.Item>
          <Nav.Item id="backAlign">
            <Nav.Link id="backLink" onClick={alertClicked} > <h6> {'Back to Contacts '} </h6></Nav.Link>
          </Nav.Item>

        </Nav>
        <div>
          {messageList.messages.map(function (d, index) {
            return (
              <Message key={index} props={d} />
            )
          })}
        </div>
        <Form className="mb-3" onSubmit={(e) => handleMessageCreate(e, args.props.username, args.props.address, messageVal)} >
          <Form.Group controlId="formBasicName" id="formBasicName">
            <FormControl type="text" value={messageVal} onChange={handleMessageChange} placeholder="Message" autoComplete="new-password" />
          </Form.Group>
          <Button variant="primary" type="submit">
            Send
          </Button>
        </Form>
      </div>

  ];
}
