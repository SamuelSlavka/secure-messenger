import React, { useEffect, useState } from 'react';
import Card from 'react-bootstrap/Card';
import Nav from 'react-bootstrap/Nav';
import Form from 'react-bootstrap/Form';
import FormControl from 'react-bootstrap/FormControl';
import Button from 'react-bootstrap/Button';
import PropTypes from 'prop-types';
import { sendMessageToAddr, getMessagesFromAddr } from './web3Func';

export default function MessageList({ args }) {
  // auto refresh state
  const [interv, setInterv] = useState(-1);

  const [switchState, setSwitchState] = useState(false);
  const [messageList, setMessageList] = useState({ messages: [] });
  const [messageVal, setMessageVal] = useState('');

  const handleMessageChange = (e) => { setMessageVal(e.target.value); };

  // stops timer and redirects to contacts
  function alertClicked() {
    if (interv !== -1) {
      clearInterval(interv);
      setInterv(-1);
    }
    setSwitchState(true);
    args.parent({ state: 'userlist', message: args.data });
  }

  // handles message creation, encryption and storage
  const handleMessageCreate = (event, username, address, message) => {
    // send to reciever
    sendMessageToAddr(args.data.info,
      message,
      args.data.address,
      args.data.contactAddress,
      username,
      args.data.contactName);

    event.preventDefault();
    event.stopPropagation();
    const data = { username, address, message };
    setMessageList({ messages: [...messageList.messages, data] });
    setMessageVal('');
  };

  useEffect(() => {
    let timerID = -1;
    // priodiaclly fetches messages for given contact
    async function fetchAuth() {
      if (timerID !== -1) setInterv(timerID);

      const res = await getMessagesFromAddr(
        args.data.info,
        args.data.address,
        args.data.contactAddress,
      );

      const data = [];
      if (res) {
        if (res.length) {
          res.forEach((el) => {
            if (el[0] !== '') {
              data.push({ username: el[4], address: el[2], message: el[6] });
            }
          });
          if (data.length) setMessageList({ messages: [...messageList.messages, ...data] });
        }
      }
    }
    // sets timer for next refresh
    fetchAuth();
    if (!switchState) {
      timerID = setInterval(() => {
        if (!switchState) fetchAuth();
      }, 4000);
    }
    return () => {
      clearInterval(timerID);
    };
    // eslint-disable-next-line
  }, [args.data.address]);

  return (
    <div key="nav" className="resultDiv">
      <Nav>
        <Nav.Item>
          <Nav.Link disabled><h3>{args.data.contactName}</h3></Nav.Link>
        </Nav.Item>
        <Nav.Item id="backAlign">
          <Nav.Link id="backLink" onClick={alertClicked}>
            {' '}
            <h6>
              {' '}
              {'Back to Contacts '}
              {' '}
            </h6>
          </Nav.Link>
        </Nav.Item>

      </Nav>
      <div>
        {messageList.messages.map((data, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <Card key={index} style={{ width: '100%' }}>
            <Card.Body>
              <Card.Title>{data.username}</Card.Title>
              <Card.Subtitle className="mb-2 text-muted">{data.address}</Card.Subtitle>
              <Card.Text>
                {data.message}
              </Card.Text>
            </Card.Body>
          </Card>
        ))}
      </div>
      <Form className="mb-3" onSubmit={(e) => handleMessageCreate(e, args.data.username, args.data.address, messageVal)}>
        <Form.Group controlId="formBasicName" id="formBasicName">
          <FormControl type="text" value={messageVal} onChange={handleMessageChange} placeholder="Message" autoComplete="new-password" />
        </Form.Group>
        <Button variant="primary" type="submit">
          Send
        </Button>
      </Form>
    </div>
  );
}

MessageList.propTypes = {
  args: PropTypes.shape({
    parent: PropTypes.func,
    data: PropTypes.shape({
      address: PropTypes.string,
      username: PropTypes.string,
      contactName: PropTypes.string,
      contactAddress: PropTypes.string,
      info: PropTypes.shape({
        address: PropTypes.string,
        abi: PropTypes.string,
        userAddr: PropTypes.string,
        username: PropTypes.string,
      }),
    }),
  }),
};

MessageList.defaultProps = {
  args: {},
};
