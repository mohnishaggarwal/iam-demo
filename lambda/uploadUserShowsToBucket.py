import json
import boto3
import os

s3 = boto3.client('s3')

def getUserFavoriteShow(_):
    return 'Seinfeld'

def getUserFavoriteCharacter(_):
    return 'George Costanza'

def handler(event, _):
    userId = event.get('userId')
    bucketName = os.environ['BUCKET_NAME']
    data = {
        'favoriteShow': getUserFavoriteShow(userId),
        'favoriteCharacter': getUserFavoriteCharacter(userId)
    }
    s3.put_object(Bucket=bucketName, Key=f'{userId}/show-preference.json', Body=json.dumps(data))
