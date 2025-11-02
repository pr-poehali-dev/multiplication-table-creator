import json
import hashlib
import hmac
import os
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Verify Telegram Login Widget authentication data
    Args: event with httpMethod, body (auth_date, first_name, hash, id, etc.)
    Returns: HTTP response with verification result
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'isBase64Encoded': False,
            'body': ''
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    try:
        body_data = json.loads(event.get('body', '{}'))
        
        bot_token = os.environ.get('TELEGRAM_BOT_TOKEN', '')
        if not bot_token:
            return {
                'statusCode': 500,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'isBase64Encoded': False,
                'body': json.dumps({'error': 'Bot token not configured'})
            }
        
        data_check_string_parts = []
        auth_data = {}
        
        for key in sorted(body_data.keys()):
            if key != 'hash':
                auth_data[key] = body_data[key]
                data_check_string_parts.append(f'{key}={body_data[key]}')
        
        data_check_string = '\n'.join(data_check_string_parts)
        
        secret_key = hashlib.sha256(bot_token.encode()).digest()
        hash_value = hmac.new(
            secret_key,
            data_check_string.encode(),
            hashlib.sha256
        ).hexdigest()
        
        if hash_value != body_data.get('hash'):
            return {
                'statusCode': 401,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'isBase64Encoded': False,
                'body': json.dumps({'error': 'Invalid authentication data'})
            }
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'isBase64Encoded': False,
            'body': json.dumps({
                'verified': True,
                'user': {
                    'id': body_data.get('id'),
                    'first_name': body_data.get('first_name'),
                    'last_name': body_data.get('last_name'),
                    'username': body_data.get('username'),
                    'photo_url': body_data.get('photo_url')
                }
            })
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'isBase64Encoded': False,
            'body': json.dumps({'error': str(e)})
        }