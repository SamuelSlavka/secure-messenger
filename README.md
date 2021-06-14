# End to end encrypted messaaging web app

using Ethereum blockchain for authentication and integrity checking. 

## How it works
After user registration, private key, public keyes and account address are generated. When client sends a message, smart contract method is invoked to store checksum of the unencrypted message. Afterwards the message is encrypted one copy with senders public key and second with recievers. Both encryptions are stored in server db.

After client recieves message, it is decrypted and checked against the checksum. Only then it is shown to client.

#### Dependencies:
  docker-compose <br>
  docker <br>
  truffle <br>
  python <br>

#### Setup:
  in file **docker-compose.yml** replace **--staging** with **--force-renew** <br>
    
    ./ssl_renew.sh

  
#### Starting server:
    docker-compose up
  
 #### Execution:
   https://slavka.one
