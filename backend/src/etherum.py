import json
from web3 import Web3
from hexbytes import HexBytes
from web3.middleware import geth_poa_middleware
from eth_account import Account
import subprocess
import os
import sys
import psql

w3 = Web3(Web3.HTTPProvider('https://rinkeby.infura.io/v3/1e87c1070ba04d9a8921909bd0f76091'))

#### ONLY IN RINKEBY!!
w3.middleware_onion.inject(geth_poa_middleware, layer=0)
####

class HexJsonEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, HexBytes):
            return obj.hex()
        return super().default(obj)

# compile all contract files
def compile_contract():
    try:
        #contract location
        working_directory = os.path.split(os.path.split(os.getcwd())[0])[0]+'/eth/'
        #compile contract
        p = subprocess.Popen(['truffle', 'compile'], cwd=working_directory+'contracts/')
        p.wait()

        with open(working_directory+'build/contracts/MessageList.json', "r") as f:
            contract = json.load(f)
        return contract
    except:
        print(sys.exc_info()[0])
        return {'error':sys.exc_info()[0]}        

# Instantiate and deploy contract
def deploy_contract(contract_interface, acct):
    try:
        contract = w3.eth.contract(
            abi=contract_interface['abi'],
            bytecode=contract_interface['bytecode'])

        #build contract creation transaction
        construct_txn = contract.constructor().buildTransaction({
            'from': acct.address,
            'nonce': w3.eth.getTransactionCount(acct.address),
            'gas': 2000000,
            'gasPrice': w3.toWei('30', 'gwei')})
        #sign the transaction
        signed = acct.signTransaction(construct_txn)

        # Get transaction hash from deployed contract
        tx_hash = w3.eth.send_raw_transaction(signed.rawTransaction)                     
        
        # Get tx receipt to get contract address
        tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
        return tx_receipt['contractAddress']
    except:
        print(sys.exc_info()[0])
        return {'error': sys.exc_info()[0]}
    

def build_and_deploy(acc):
    if(w3.isConnected()):
        contract = compile_contract()
        print("Contract Compiled")
        data = {
            'abi': contract['abi'],
            'contract_address': deploy_contract(contract,acc)
        }        
        return data
    return False

def get_last_transaction():
    try:
        transaction = w3.eth.get_transaction_by_block(w3.eth.blockNumber, 0)
        tx_dict = dict(transaction)
        tx_json = json.dumps(tx_dict, cls=HexJsonEncoder)
        return tx_json
    except:
        return {'error':sys.exc_info()[0]}

def init_eth_with_PK(pk):
    acc = w3.eth.account.privateKeyToAccount(pk)
    res = acc.address
    new_contract = False
    w3.eth.default_account = res
    cur = psql.getContract()
    if(cur == None):
        re = build_and_deploy(acc)
        psql.setContract(re['contract_address'], json.dumps(re['abi']))
        cur = psql.getContract()
        new_contract = True   
    if (cur != None):
        return {'result': True, 'new_contract':new_contract}
    else:
        return {'result': False, 'new_contract':new_contract}


# Send some eth to client
def reqest_founds(address,acct):
    try:
        #build transaction
        signed_txn = w3.eth.account.sign_transaction(dict(
            nonce=w3.eth.get_transaction_count(acct.address),
            gasPrice=w3.eth.gas_price,
            gas=100000,
            to=address,
            value=1000,
            data=b'',
        ),
        acct.privateKey)

        tx_hash = w3.eth.send_raw_transaction(signed_txn.rawTransaction)
                            
        # Get tx receipt to get contract address
        tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
        return tx_receipt
    except:
        print(sys.exc_info()[0])
        return {'error': sys.exc_info()[0]}
    

#acct = w3.eth.account.privateKeyToAccount('0xb53f03cf0d04600a66409b758be1b0bb377ec1203e964853b330640440a21728')
#w3.eth.default_account = '0x723F129B803a34C501042333499e26b6888f35Cb'
#contr = build_and_deploy(acct)
#print(contr)
#newcont = w3.eth.contract(
    #address=contr['contract_address'],
    #abi=contr['abi']
    #)
#tx_hash = newcont.functions.createMessage("Hello there", '0xE1Dc4BeDE50a0957016bc5FdA19a61dc681B952d').transact()
#print(tx_hash)
#tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
#print(newcont.functions.getMessages('0xE1Dc4BeDE50a0957016bc5FdA19a61dc681B952d').call())
   