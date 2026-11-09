import re

with open('web-client/lib/fallback-catalog.ts', 'r', encoding='utf-8') as f:
    content = f.read()

urls = re.findall(r'"imageUrl":\s*"([^"]+)"', content)
print(f'Total products in fallback-catalog: {len(urls)}')
valid_urls = [u for u in urls if u.startswith('http')]
print(f'Valid http urls: {len(valid_urls)}')
emojis = [u for u in urls if not u.startswith('http')]
print(f'Emojis / non-urls: {len(emojis)}')
if emojis:
    print('Sample emojis:', emojis[:10])
