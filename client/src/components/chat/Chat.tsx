import React, { useEffect, useState, useRef } from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import './Chat.css';
import { Chatbox } from './chatbox/Chatbox';
import { Userslist } from './userslist/Userslist';
import axios from 'axios';

import io from 'socket.io-client';

const PORT = process.env.PORT || 8000;
const URL = 'http://localhost:';
const ENDPOINT = 'http://localhost:8000/';

interface Props {}

export function Chat(props: Props) {
  const [Username, setUsername] = useState('');
  const [EnteredUsername, setEnteredUsername] = useState(0);

  const [YourID, setYourID] = useState('');
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [users, setUsers] = useState([]);
  const [usersData, setUsersData] = useState({});

  const socketRef = useRef();

  useEffect(() => {
    // Make socket connection
    // @ts-ignore
    socketRef.current = io.connect(ENDPOINT, { transports: ['websocket'] });

    // Get id from server
    // @ts-ignore
    socketRef.current.on('your_id', id => {
      // Get current socket connection id
      setYourID(id);
    });

    // Get messages from server
    // @ts-ignore
    socketRef.current.on('message', message => {
      recievedMessage(message);
      // getMessageCountByUser();
    });

    // Get online users from server
    // @ts-ignore
    socketRef.current.on('get_users', users => {
      console.log(users);
      setUsers(users);
    });
  }, []);

  function getMessageCountByUser() {
    users.forEach(user => {
      axios
        .get(`api/analytics?per=username&value${user}`)
        .then((res: any) => {
          setUsersData(usersData => {
            const userObj = {};
            userObj[user] = res.count;
            return { ...usersData, ...userObj };
          });
        })
        .catch(e => {
          console.error(e);
        });
    });
  }

  useEffect(() => {
    // Once user enters the room
    if (EnteredUsername) {
      // Tell server about me
      // @ts-ignore
      socketRef.current.emit('new user', { Username: Username });
    }
  }, [EnteredUsername, Username]);

  function recievedMessage(message) {
    setMessages(oldMessages => [...oldMessages, message]);
  }

  function sendMessage(event) {
    event.preventDefault();
    const messageObject = {
      body: message,
      id: YourID,
      username: Username
    };
    setMessage('');

    // Send new chat message to server
    // @ts-ignore
    socketRef.current.emit('send message', messageObject);
  }

  return (
    <div className="main-section">
      {EnteredUsername ? (
        <Container>
          <h3>Welcome, {Username}!</h3>
          <Row style={{ height: '65%' }}>
            <Col xl="3">
              <Userslist users={users} />
            </Col>
            <Col>
              <Chatbox
                YourID={YourID}
                messages={messages}
                message={message}
                setMessage={setMessage}
                sendMessage={sendMessage}
              />
            </Col>
          </Row>
          <Row style={{ height: '30%' }}>
            <div>
              <h1>Analytics: </h1>
              <button onClick={() => getMessageCountByUser()}> refresh</button>
              {users &&
                users.map((user, index) => {
                  return (
                    <div key={index}>
                      <h2>Message sent by {user} - 50 </h2>
                    </div>
                  );
                })}
            </div>
          </Row>
        </Container>
      ) : (
        <Container>
          <form>
            <Row>
              <Col>Enter Username:</Col>
            </Row>
            <Row>
              <Col>
                <input
                  className="username-input"
                  type="text"
                  name="name"
                  onChange={e => setUsername(e.target.value)}
                />
              </Col>
            </Row>
            <Row>
              <Col>
                <button
                  className="submit-button"
                  onClick={e => setEnteredUsername(1)}
                >
                  Submit
                </button>
              </Col>
            </Row>
          </form>
        </Container>
      )}
    </div>
  );
}
