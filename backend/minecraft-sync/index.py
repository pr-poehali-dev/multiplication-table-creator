import json
from typing import Dict, Any, List
from datetime import datetime, timedelta

rooms: Dict[str, Dict[str, Any]] = {}

ROOM_EXPIRY = timedelta(hours=2)

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Minecraft multiplayer room management and player synchronization
    Args: event - dict with httpMethod, body containing action, roomCode, playerId, position data
          context - object with request_id attribute
    Returns: HTTP response with player list or room status
    '''
    method: str = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    body_data = json.loads(event.get('body', '{}'))
    action = body_data.get('action')
    
    if action == 'create':
        room_code = body_data.get('roomCode')
        player_id = body_data.get('playerId')
        player_name = body_data.get('playerName')
        
        rooms[room_code] = {
            'created': datetime.now().isoformat(),
            'players': {
                player_id: {
                    'id': player_id,
                    'name': player_name,
                    'x': body_data.get('x', 0),
                    'y': body_data.get('y', 1.7),
                    'z': body_data.get('z', 5),
                    'yaw': body_data.get('yaw', 0),
                    'pitch': body_data.get('pitch', 0),
                    'lastUpdate': datetime.now().isoformat()
                }
            },
            'blocks': []
        }
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'isBase64Encoded': False,
            'body': json.dumps({'success': True, 'roomCode': room_code})
        }
    
    elif action == 'join':
        room_code = body_data.get('roomCode')
        player_id = body_data.get('playerId')
        player_name = body_data.get('playerName')
        
        if room_code not in rooms:
            return {
                'statusCode': 404,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'isBase64Encoded': False,
                'body': json.dumps({'error': 'Room not found'})
            }
        
        rooms[room_code]['players'][player_id] = {
            'id': player_id,
            'name': player_name,
            'x': body_data.get('x', 0),
            'y': body_data.get('y', 1.7),
            'z': body_data.get('z', 5),
            'yaw': body_data.get('yaw', 0),
            'pitch': body_data.get('pitch', 0),
            'lastUpdate': datetime.now().isoformat()
        }
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'isBase64Encoded': False,
            'body': json.dumps({'success': True})
        }
    
    elif action == 'update':
        room_code = body_data.get('roomCode')
        player_id = body_data.get('playerId')
        
        if room_code not in rooms:
            return {
                'statusCode': 404,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'isBase64Encoded': False,
                'body': json.dumps({'error': 'Room not found'})
            }
        
        if player_id in rooms[room_code]['players']:
            rooms[room_code]['players'][player_id].update({
                'x': body_data.get('x'),
                'y': body_data.get('y'),
                'z': body_data.get('z'),
                'yaw': body_data.get('yaw'),
                'pitch': body_data.get('pitch'),
                'lastUpdate': datetime.now().isoformat()
            })
        
        players_list = list(rooms[room_code]['players'].values())
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'isBase64Encoded': False,
            'body': json.dumps({'players': players_list})
        }
    
    elif action == 'block':
        room_code = body_data.get('roomCode')
        block_action = body_data.get('blockAction')
        block = body_data.get('block')
        
        if room_code not in rooms:
            return {
                'statusCode': 404,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'isBase64Encoded': False,
                'body': json.dumps({'error': 'Room not found'})
            }
        
        if block_action == 'add':
            rooms[room_code]['blocks'].append(block)
        elif block_action == 'remove':
            rooms[room_code]['blocks'] = [
                b for b in rooms[room_code]['blocks']
                if not (b['x'] == block['x'] and b['y'] == block['y'] and b['z'] == block['z'])
            ]
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'isBase64Encoded': False,
            'body': json.dumps({'success': True})
        }
    
    return {
        'statusCode': 400,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'isBase64Encoded': False,
        'body': json.dumps({'error': 'Invalid action'})
    }

def cleanup_old_rooms():
    now = datetime.now()
    expired_rooms = [
        room_code for room_code, room_data in rooms.items()
        if datetime.fromisoformat(room_data['created']) + ROOM_EXPIRY < now
    ]
    for room_code in expired_rooms:
        del rooms[room_code]