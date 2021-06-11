import React, { useEffect, useState } from 'react';
import { UserList } from '../messages/UserList';
import Card from 'react-bootstrap/Card'
import Nav from 'react-bootstrap/Nav'
import InputGroup from 'react-bootstrap/InputGroup'
import FormControl from 'react-bootstrap/FormControl'
import Button from 'react-bootstrap/Button'




const token = sessionStorage.getItem('token');

export function MessageList(args) {
  const [switchState, setSwitchState] = useState(false);

  function alertClicked() {
    setSwitchState(true)
  }

  return [
    switchState
      ? <UserList />
      :
      <div>
        <Nav>
          <Nav.Item>
            <Nav.Link disabled><h3>{args.props.contactName}</h3></Nav.Link>
          </Nav.Item>
          <Nav.Item id="backAlign">
            <Nav.Link id="backLink" onClick={alertClicked} > <h6> {'Back to Contacts '} </h6></Nav.Link>
          </Nav.Item>

        </Nav>
        <Card style={{ width: '100%' }}>
          <Card.Body>
            <Card.Title>{args.props.contactName}</Card.Title>
            <Card.Subtitle className="mb-2 text-muted">{args.props.contactAddress}</Card.Subtitle>
            <Card.Text>
              Some quick example text to build on the card title and make up the bulk of
              the card's content.
            </Card.Text>
          </Card.Body>
        </Card>
        <Card style={{ width: '100%' }}>
          <Card.Body>
            <Card.Title>{args.props.myName}</Card.Title>
            <Card.Subtitle className="mb-2 text-muted">{args.props.myAddress}</Card.Subtitle>
            <Card.Text>
              Some quick example text to build on the card title and make up the bulk of
              the card's content.
            </Card.Text>
          </Card.Body>
        </Card>

        <InputGroup className="mb-3">
          <FormControl
            placeholder="Message"
          />
          <InputGroup.Append>
            <Button variant="outline-secondary">Send</Button>
          </InputGroup.Append>
        </InputGroup>
      </div>

  ];
}
