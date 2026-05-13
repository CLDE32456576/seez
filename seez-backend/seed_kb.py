"""
Parse the SEEZ KB markdown and seed all 100 concepts into Supabase.
Run from seez-backend/: python3 seed_kb.py
"""
import re
import uuid
import sys
import os

sys.path.insert(0, os.path.dirname(__file__))
from services.supabase_client import get_supabase

KB_FILE = os.path.join(os.path.dirname(__file__), '..', 'compass_artifact_wf-b7eeca84-5016-4fe3-aed1-c04b2cf7e935_text_markdown.md')

# Explicit concept-number ranges mapped to topic
# 100 concepts split across 7 categories (~14-15 each)
CONCEPT_TOPIC_RANGES = [
    (1,   14,  'opening'),
    (15,  28,  'rapport'),
    (29,  43,  'discovery'),
    (44,  57,  'objection'),
    (58,  71,  'closing'),
    (72,  85,  'negotiation'),
    (86,  100, 'psychology'),
]


def get_topic_for_concept(num: int) -> str:
    for start, end, topic in CONCEPT_TOPIC_RANGES:
        if start <= num <= end:
            return topic
    return 'opening'

CATEGORY_TOPIC_MAP = {}  # kept for import compatibility

STAGE_NORMALIZE = {
    'cold call': 'Cold Call',
    'cold outreach': 'Cold Call',
    'discovery': 'Discovery Call',
    'discovery call': 'Discovery Call',
    'demo': 'Demo / Pitch',
    'demo / pitch': 'Demo / Pitch',
    'objection': 'Objection Handling',
    'closing': 'Closing Call',
    'negotiation': 'Negotiation',
    'follow-up': 'Follow-up',
    'pre-close': 'Closing Call',
    'post-close': 'Closing Call',
    'cold email': 'Cold Call',
    'every stage': 'All',
    'all': 'All',
}


def get_skill_level(concept_num):
    if concept_num <= 28:
        return 'beginner'
    elif concept_num <= 65:
        return 'intermediate'
    else:
        return 'advanced'


def parse_field(text, field_name):
    """Extract content after **Field:** until next **Field:** or end."""
    pattern = rf'\*\*{re.escape(field_name)}:\*\*\s*(.*?)(?=\n\*\*[A-Z]|\n---|\Z)'
    match = re.search(pattern, text, re.DOTALL | re.IGNORECASE)
    if match:
        return match.group(1).strip().replace('\n', ' ').replace('  ', ' ')
    return ''


def parse_stages(stage_str):
    """Parse Stage field into normalized array."""
    if not stage_str:
        return ['All']
    stages = []
    for part in re.split(r'[/,]', stage_str):
        part = part.strip().lower()
        normalized = STAGE_NORMALIZE.get(part)
        if normalized and normalized not in stages:
            stages.append(normalized)
    return stages if stages else ['All']


def parse_kb_markdown(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    entries = []
    concept_pattern = re.compile(r'^### (\d+)\. (.+)', re.MULTILINE)
    concept_matches = list(concept_pattern.finditer(content))

    for i, match in enumerate(concept_matches):
        num = int(match.group(1))
        title = match.group(2).strip()
        topic = get_topic_for_concept(num)

        # Get text until next concept or end
        start = match.start()
        end = concept_matches[i + 1].start() if i + 1 < len(concept_matches) else len(content)
        block = content[start:end]

        source = parse_field(block, 'Source')
        core_idea = parse_field(block, 'Core idea')
        why_works = parse_field(block, 'Why it works')
        how_apply = parse_field(block, 'How to apply')
        script_raw = parse_field(block, 'Script')
        stage_raw = parse_field(block, 'Stage')
        mistakes = parse_field(block, 'Common mistakes')

        # Clean script (remove italics markers)
        script = re.sub(r'\*([^*]+)\*', r'\1', script_raw).strip()

        # Build full_content from all fields
        full_parts = []
        if core_idea:
            full_parts.append(f"Core Idea: {core_idea}")
        if why_works:
            full_parts.append(f"Why It Works: {why_works}")
        if how_apply:
            full_parts.append(f"How to Apply: {how_apply}")
        if mistakes:
            full_parts.append(f"Common Mistakes: {mistakes}")
        full_content = '\n\n'.join(full_parts)

        # Summary = first 2 sentences of core_idea
        summary_sentences = re.split(r'(?<=[.!?])\s+', core_idea)
        summary = ' '.join(summary_sentences[:2]) if summary_sentences else core_idea[:200]

        call_stages = parse_stages(stage_raw)
        skill_level = get_skill_level(num)

        entry = {
            'id': str(uuid.uuid4()),
            'title': title,
            'summary': summary[:500],
            'full_content': full_content[:3000],
            'example_script': script[:1000] if script else None,
            'source': source[:300] if source else None,
            'topic': topic,
            'skill_level': skill_level,
            'call_stages': call_stages,
        }
        entries.append(entry)
        print(f"  Parsed #{num}: {title[:60]} [{topic}]")

    return entries


def seed():
    print(f"Parsing KB from: {KB_FILE}")
    entries = parse_kb_markdown(KB_FILE)
    print(f"\nParsed {len(entries)} entries. Inserting into Supabase...")

    db = get_supabase()

    # Clear existing
    existing = db.table('kb_entries').select('id').execute()
    if existing.data:
        print(f"Clearing {len(existing.data)} existing entries...")
        for row in existing.data:
            db.table('kb_entries').delete().eq('id', row['id']).execute()

    # Insert in batches of 20
    batch_size = 20
    for i in range(0, len(entries), batch_size):
        batch = entries[i:i + batch_size]
        result = db.table('kb_entries').insert(batch).execute()
        print(f"  Inserted batch {i // batch_size + 1} ({len(batch)} entries)")

    print(f"\nDone. {len(entries)} concepts seeded.")


if __name__ == '__main__':
    seed()
