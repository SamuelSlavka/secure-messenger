pragma solidity >=0.4.22 <0.9.0;
pragma experimental ABIEncoderV2;

contract MessageList {
    struct Message {
        string content;
        address senderAddr;
        uint time;
    }

    struct Client {
        bool initialized;
        uint messageCount;
        mapping(uint => Message) messages;
    }

    event MessageCreated(
        uint count,
        uint timestamp
    );

    mapping(address => Client) private clients;

    function createMessage(string memory _content, address reciever) public{
        Client storage recv = clients[reciever];

        if (!recv.initialized) {
            recv.initialized = true;
            recv.messageCount = 0;
        }
        uint timestamp = block.timestamp;
        recv.messages[recv.messageCount] = Message({
            content: _content,
            senderAddr: msg.sender,
            time: timestamp
        });
        recv.messageCount++;

        emit MessageCreated(recv.messageCount, timestamp);
    }

    function geClientCount(address client) public view returns (uint) {        
        Client storage cli = clients[client];                
        return cli.messageCount;
    }

    function getLastMessages(address reciever, address sender, uint offset, uint count) public view returns (Message[] memory) 
    {        
        Client storage recv = clients[reciever];  
        Client storage sndr = clients[sender];

        Message[] memory res = new Message[](2*count);
                
        uint j = 0;
        
        offset++;
        if((offset-1) < recv.messageCount){
            for (uint i = recv.messageCount; i > 0; i--) 
            {
                if(j>=count) break;
                if(sender == recv.messages[i-offset].senderAddr){
                    res[j] = recv.messages[i-offset];
                    j++;
                }
            }
        }
    
        if((offset-1) < sndr.messageCount){
            for (uint i = sndr.messageCount; i > 0; i--) 
            {   
                if(j>=(2*count)) break;
                if(reciever == sndr.messages[i-offset].senderAddr){
                    res[j] = sndr.messages[i-offset];
                    j++;
                }
            }
        }

        return res;
    }
}
