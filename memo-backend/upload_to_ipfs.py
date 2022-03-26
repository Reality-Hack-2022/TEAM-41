import requests
import os
from config import API_KEY, SECRET_KEY

PINATA_BASE_URL = 'https://api.pinata.cloud/'
endpoint = 'pinning/pinFileToIPFS'

headers = {'pinata_api_key': API_KEY,
           'pinata_secret_api_key': SECRET_KEY}

def upload_to_pinata(filepath, filename):
    with open(filepath, 'rb') as fp:
        image_binary = fp.read()
        response = requests.post(PINATA_BASE_URL + endpoint,
                                files={"file": (filename, image_binary)},
                                headers=headers)
    return response.json()

"""
{'IpfsHash': 'Qmb3KQEm3sUxR3nkSVhAgcvuVahBudG8zFm55zvuTYttW9', 'PinSize': 200, 'Timestamp': '2022-03-24T20:18:22.787Z'}
"""
# https://gateway.pinata.cloud/ipfs/Qmb3KQEm3sUxR3nkSVhAgcvuVahBudG8zFm55zvuTYttW9

if __name__ == '__main__':
    filepath = 'sample_metadata.json'
    resp = upload_to_pinata(filepath, 'test')
    print(resp)