"""
Business: API для совершения реальных телефонных звонков через Twilio
Args: event с httpMethod, body (phoneNumber, message), queryStringParameters
      context с атрибутами request_id, function_name
Returns: HTTP response с данными о звонке или ошибкой
"""

import json
import os
from typing import Dict, Any
from twilio.rest import Client

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    account_sid = os.environ.get('TWILIO_ACCOUNT_SID')
    auth_token = os.environ.get('TWILIO_AUTH_TOKEN')
    twilio_phone = os.environ.get('TWILIO_PHONE_NUMBER')
    
    if not all([account_sid, auth_token, twilio_phone]):
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'Twilio credentials not configured'})
        }
    
    if method == 'POST':
        body_data = json.loads(event.get('body', '{}'))
        to_number = body_data.get('phoneNumber')
        message = body_data.get('message', 'Привет! Это звонок из вашего приложения.')
        
        if not to_number:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'isBase64Encoded': False,
                'body': json.dumps({'error': 'Phone number is required'})
            }
        
        client = Client(account_sid, auth_token)
        
        call = client.calls.create(
            to=to_number,
            from_=twilio_phone,
            twiml=f'<Response><Say language="ru-RU">{message}</Say></Response>'
        )
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'isBase64Encoded': False,
            'body': json.dumps({
                'success': True,
                'callSid': call.sid,
                'status': call.status,
                'to': to_number,
                'from': twilio_phone
            })
        }
    
    if method == 'GET':
        params = event.get('queryStringParameters', {})
        call_sid = params.get('callSid')
        
        if call_sid:
            client = Client(account_sid, auth_token)
            call = client.calls(call_sid).fetch()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'isBase64Encoded': False,
                'body': json.dumps({
                    'callSid': call.sid,
                    'status': call.status,
                    'duration': call.duration,
                    'to': call.to,
                    'from': call.from_
                })
            }
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'isBase64Encoded': False,
            'body': json.dumps({
                'service': 'Twilio Calls API',
                'twilioNumber': twilio_phone
            })
        }
    
    return {
        'statusCode': 405,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'isBase64Encoded': False,
        'body': json.dumps({'error': 'Method not allowed'})
    }
