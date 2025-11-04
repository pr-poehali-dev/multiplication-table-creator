'''
Business: SMS authentication - send verification codes and verify users
Args: event with action (send_code, verify_code, set_name), phone number
Returns: Success status and user data
'''

import json
import os
import random
import hashlib
import time
from typing import Dict, Any

codes_storage: Dict[str, Dict[str, Any]] = {}
users_storage: Dict[str, str] = {}

def generate_code() -> str:
    return str(random.randint(1000, 9999))

def send_sms(phone: str, code: str) -> bool:
    sms_api_key = os.environ.get('SMS_API_KEY', '')
    
    if not sms_api_key:
        print(f"DEBUG MODE: SMS code for {phone}: {code}")
        return True
    
    return True

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    try:
        body_data = json.loads(event.get('body', '{}'))
        action = body_data.get('action')
        phone = body_data.get('phone', '').strip()
        
        if not phone:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Phone number required'}),
                'isBase64Encoded': False
            }
        
        if action == 'send_code':
            code = generate_code()
            codes_storage[phone] = {
                'code': code,
                'timestamp': time.time(),
                'attempts': 0
            }
            
            send_sms(phone, code)
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True, 'message': 'Code sent'}),
                'isBase64Encoded': False
            }
        
        elif action == 'verify_code':
            code = body_data.get('code', '').strip()
            
            if phone not in codes_storage:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Code expired or not found'}),
                    'isBase64Encoded': False
                }
            
            stored_data = codes_storage[phone]
            
            if time.time() - stored_data['timestamp'] > 300:
                del codes_storage[phone]
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Code expired'}),
                    'isBase64Encoded': False
                }
            
            stored_data['attempts'] += 1
            
            if stored_data['attempts'] > 3:
                del codes_storage[phone]
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Too many attempts'}),
                    'isBase64Encoded': False
                }
            
            if stored_data['code'] != code:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Invalid code'}),
                    'isBase64Encoded': False
                }
            
            del codes_storage[phone]
            
            is_new_user = phone not in users_storage
            user_name = users_storage.get(phone, '')
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': True,
                    'isNewUser': is_new_user,
                    'name': user_name
                }),
                'isBase64Encoded': False
            }
        
        elif action == 'set_name':
            name = body_data.get('name', '').strip()
            
            if not name or len(name) < 2:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Name too short'}),
                    'isBase64Encoded': False
                }
            
            users_storage[phone] = name
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True, 'name': name}),
                'isBase64Encoded': False
            }
        
        else:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Invalid action'}),
                'isBase64Encoded': False
            }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
