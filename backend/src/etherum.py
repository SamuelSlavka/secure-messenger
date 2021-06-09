import json
from web3 import Web3
from hexbytes import HexBytes
from solc import compile_files, link_code, compile_source
import subprocess
import os


w3 = Web3(Web3.HTTPProvider('http://192.168.1.21:7545'))

class HexJsonEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, HexBytes):
            return obj.hex()
        return super().default(obj)

# compile all contract files
def compile_contract():
    #contract location
    working_directory = os.path.split(os.path.split(os.getcwd())[0])[0]+'/eth/'
    #compile contract
    p = subprocess.Popen(['truffle', 'compile'], cwd=working_directory+'contracts/')
    p.wait()

    with open(working_directory+'build/contracts/MessageList.json') as f:
        contract = json.load(f)
    return contract

# Instantiate and deploy contract
def deploy_contract(contract_interface):

    contract = w3.eth.contract(
        abi=contract_interface['abi'],
        bytecode=contract_interface['bytecode'])

    # deploying account
    w3.eth.default_account = w3.eth.accounts[0]

    # Get transaction hash from deployed contract
    tx_hash = contract.constructor().transact()

    # Get tx receipt to get contract address
    tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
    return tx_receipt['contractAddress']
    

def build_and_deploy():
    if(w3.isConnected()):
        contract = compile_contract()
        data = {
            'abi': contract['abi'],
            'contract_address': deploy_contract(contract)
        }
        return data
    return "Error Connecting"


#contr = build_and_deploy()
#newcont = w3.eth.contract(
#address=contr['contract_address'],
#abi=contr['abi']
#)
#tx_hash = newcont.functions.createMessage("Hello there", '0x62B9519896F3A0557D4B4A649B69567E3F1BD04c').transact()
#tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
#print(newcont.functions.getMessages('0x62B9519896F3A0557D4B4A649B69567E3F1BD04c').call())


def get_last_transaction():
    print(w3.isConnected())
    try:
        transaction = w3.eth.get_transaction_by_block(w3.eth.blockNumber, 0)
        tx_dict = dict(transaction)
        tx_json = json.dumps(tx_dict, cls=HexJsonEncoder)
        return tx_json
    except:
        return {'error':'Error while fetching transaction'}