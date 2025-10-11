import json
import os
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Генерирует тексты (рефераты, сочинения, стихи) с помощью OpenAI GPT
    Args: event - dict с httpMethod, body (topic, type, length)
          context - object с атрибутами request_id, function_name
    Returns: HTTP response с сгенерированным текстом
    '''
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
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    body_data = json.loads(event.get('body', '{}'))
    topic: str = body_data.get('topic', '')
    text_type: str = body_data.get('type', 'essay')
    length: str = body_data.get('length', 'medium')
    
    if not topic:
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Topic is required'}),
            'isBase64Encoded': False
        }
    
    api_key = os.environ.get('OPENAI_API_KEY')
    if not api_key:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'API key not configured'}),
            'isBase64Encoded': False
        }
    
    try:
        from openai import OpenAI
        
        client = OpenAI(api_key=api_key)
        
        type_prompts = {
            'essay': 'Напиши школьное сочинение',
            'report': 'Напиши реферат',
            'story': 'Напиши интересный рассказ',
            'poem': 'Напиши стихотворение'
        }
        
        length_prompts = {
            'short': 'на 1-2 абзаца',
            'medium': 'на 3-5 абзацев',
            'long': 'на 6-8 абзацев'
        }
        
        prompt = f"{type_prompts.get(text_type, 'Напиши текст')} {length_prompts.get(length, '')} на тему: {topic}. "
        
        if text_type == 'essay':
            prompt += "Используй красивый литературный язык, добавь эпитеты и метафоры."
        elif text_type == 'report':
            prompt += "Пиши научным стилем, структурируй информацию, добавь факты."
        elif text_type == 'story':
            prompt += "Сделай текст увлекательным, с интересным сюжетом и персонажами."
        elif text_type == 'poem':
            prompt += "Используй рифму и ритм, создай образный и эмоциональный текст."
        
        response = client.chat.completions.create(
            model='gpt-4o-mini',
            messages=[
                {
                    'role': 'system',
                    'content': 'Ты помощник для школьников. Создаёшь качественные тексты на русском языке для учебных целей.'
                },
                {
                    'role': 'user',
                    'content': prompt
                }
            ],
            temperature=0.8,
            max_tokens=2000
        )
        
        generated_text = response.choices[0].message.content
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'text': generated_text}),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': f'Generation failed: {str(e)}'}),
            'isBase64Encoded': False
        }