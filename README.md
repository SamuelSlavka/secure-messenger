# End to end encrypted messaging web app

using Ethereum blockchain for authentication and integrity checking. 

## How it works
After user registration, private key, public keys, and account address are generated. When a client sends a message, smart contract method is invoked to store checksum of the unencrypted message. Afterward the message is encrypted one copy with the sender's public key and the second with receivers. Both encryptions are stored in server db.

After the client receives a message, it is decrypted and checked against the checksum. Only then it is shown to the client.

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
