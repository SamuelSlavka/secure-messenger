# Web app with authentication
using SSL and nginx revese proxy

#### Dependencies:
  docker-compose <br>
  docker

#### Setup:
  in file **docker-compose.yml** replace **--staging** with **--force-renew** <br>
    
    ./ssl_renew.sh

  run geth local node
    geth --ropsten --syncmode="light" -keystore ~/.ethereum/keystore --cache=4096 --http --http.api eth,net,web3,personal
 
  
#### Starting server:
    docker-compose up
  
 #### Execution:
   https://slavka.one
