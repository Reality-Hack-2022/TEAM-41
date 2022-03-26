from flask import Flask,request, session, Response
import uuid
import boto3
from config import S3_BUCKET, S3_KEY, S3_SECRET, host, user, passwd, database, secret_key 
from flask_cors import CORS
import json
from upload_to_ipfs import *

app = Flask(__name__)

CORS(app)
aws =  boto3.resource(
            's3',
            aws_access_key_id=S3_KEY,
            aws_secret_access_key=S3_SECRET
        )

bucket = aws.Bucket(S3_BUCKET)
bucket.Acl().put(ACL='public-read')

@app.route("/ping")
def ping():
    return "pong"

@app.route("/upload_file", methods=["POST"])
def upload():
    file = request.files['file']
    file_image_id = str(uuid.uuid1())[:10]
    filename = str(uuid.uuid1()) + ".jpg"
    # response = bucket.Object(filename).put(Body=file, ACL='public-read')
    file.save(file.filename)
    ipfs_link = upload_to_pinata(file.filename, file_image_id)
    return {
        'metadata_link': f'https://gateway.pinata.cloud/ipfs/{ipfs_link["IpfsHash"]}'
    }

@app.route("/upload_depth_file", methods=["POST"])
def upload_depth_file():
    file = request.files['file']
    file_image_id = str(uuid.uuid1())[:10]
    filename = str(uuid.uuid1()) + "_depth" + ".jpg"
    response = bucket.Object(filename).put(Body=file, ACL='public-read')
    return {
        'result': 'good'
    }

@app.route("/create_nft_metadata", methods=["POST"])
def create_nft_metadata():

    data = request.get_json()
    metadata_template = {
        "name": "",
        "description": "",
        "image": "",
        "attributes": []
    }
    ipfs_image = data['imageUrl']
    nft_name = data['name']
    metadata_template['name'] = data['name']
    metadata_template['description'] = data['description']
    metadata_template['image'] = ipfs_image

    with open('metadata.json', 'w', encoding='utf-8') as f:
        json.dump(metadata_template, f, ensure_ascii=False, indent=4)

    ipfs_link = upload_to_pinata('metadata.json', nft_name)

    return {
        'metadata_link': f'https://gateway.pinata.cloud/ipfs/{ipfs_link["IpfsHash"]}'
    }

# /create_nft
# /list_user_nft

if __name__ == '__main__':
    app.run(debug=True)