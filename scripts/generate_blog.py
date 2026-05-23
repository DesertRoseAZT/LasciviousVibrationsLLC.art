#!/usr/bin/env python3
"""
LSV Auto Blog Generator
=======================
One-time setup script that runs on GitHub Actions (free tier).
Generates new blog posts for:
  - Be The Change (BTC) transmissions
  - The Dark Canvas (horror art) signals

Runs weekly or on-demand. Zero cost — uses GitHub Actions free minutes.
No API keys needed — uses template-based generation with rotating topics.

To add new topics: edit BTC_TOPICS or HORROR_TOPICS lists below.
"""

import os
import re
import json
import random
from datetime import datetime
from pathlib import Path

# ═══ CONFIGURATION ═══

BTC_TOPICS = [
    {
        "title": "The Cost of Comfort",
        "id": "TRANSMISSION",
        "body": [
            "Comfort is the most dangerous addiction nobody talks about.",
            "Not drugs. Not alcohol. Not screens. Comfort.",
            "Because comfort doesn't look like a problem. It looks like success. It looks like safety. It looks like you've made it.",
            "But comfort is where growth dies. It's where courage atrophies. It's where people stop pushing, stop questioning, stop evolving — and start defending the life they've built even when that life is slowly suffocating them.",
            "People will choose a miserable comfort over an uncertain freedom every single time. They'll stay in relationships that drain them. Jobs that hollow them out. Cities that bore them. Friendships built on nothing but routine.",
            "Why? Because the unknown is terrifying. And the known — even when it's killing you — at least feels predictable.",
            "Being the change means being willing to be uncomfortable. Deliberately. Repeatedly. Not because discomfort is virtuous, but because every meaningful thing you've ever done in your life required you to step outside of what felt safe.",
            "The world doesn't change from inside comfort zones. It changes when someone decides the cost of staying the same is higher than the cost of becoming something new.",
            "So ask yourself: what are you protecting? And is it protecting you back? Or is it just keeping you still?",
        ],
    },
    {
        "title": "The Algorithm of Apathy",
        "id": "TRANSMISSION",
        "body": [
            "We've been algorithmically trained to not care.",
            "Every feed, every platform, every notification is designed to overwhelm your nervous system with so much information that eventually your brain does the only thing it can to survive: it shuts down empathy.",
            "You scroll past suffering like it's wallpaper now. A war here. A crisis there. Someone's world ending in 280 characters. And you keep scrolling. Not because you're a bad person — but because the machine trained you to treat human pain as content.",
            "That's the algorithm of apathy. And it's working exactly as designed.",
            "Because apathetic people don't revolt. They don't demand change. They don't organize. They consume. They react. They forget. They move on.",
            "Being the change means manually overriding that programming. It means choosing to feel when the system is designed to numb you. It means stopping the scroll — not because you can fix everything, but because acknowledging pain is the first step to not becoming part of the machine.",
            "You don't have to save the world today. But you do have to stay human. And staying human in a system designed to automate your emotions? That's an act of rebellion.",
        ],
    },
    {
        "title": "The Inheritance of Silence",
        "id": "TRANSMISSION",
        "body": [
            "Silence is inherited.",
            "Most people learned it from their parents, who learned it from theirs. Don't talk about that. Don't bring that up. Don't make people uncomfortable. Don't rock the boat.",
            "And so generation after generation inherits the same unspoken agreement: we will suffer quietly, and we will call it strength.",
            "But silence isn't strength. Silence is the architecture of every system that has ever oppressed anyone. It's the mortar between the bricks. It holds the structure together precisely because no one is willing to pull it out.",
            "People confuse keeping the peace with keeping quiet. They're not the same thing. One is a conscious choice to de-escalate conflict with wisdom. The other is a surrender disguised as composure.",
            "Every time you swallow truth to avoid discomfort, you're not being kind. You're being complicit.",
            "Being the change means speaking when silence is safer. Not recklessly. Not cruelly. But honestly. Because the things we refuse to say out loud don't go away — they just metastasize in the dark.",
            "What silence did you inherit? And are you going to pass it on, or are you going to be the one who finally breaks the chain?",
        ],
    },
    {
        "title": "The Economy of Kindness",
        "id": "TRANSMISSION",
        "body": [
            "Kindness has been devalued so severely that people treat it with suspicion now.",
            "Someone opens a door for you — what's the catch? Someone compliments you — what do they want? Someone offers help — they must be running a scam.",
            "We've been burned so many times by false generosity that we've started treating genuine warmth like a threat. And that's one of the saddest things about modern society.",
            "Kindness doesn't have an ROI. It doesn't need a strategy. It doesn't need to perform for an audience. It just needs to exist. Quietly. Consistently. Without expectation.",
            "The people who changed your life the most were probably not the loudest people in the room. They were the ones who noticed you. Who asked if you were okay and actually waited for the answer. Who showed up when everyone else left.",
            "Being the change means rebuilding the economy of kindness from the ground up. Not the performative kind. Not the Instagram kind. The kind that costs you something — your time, your comfort, your convenience — and gives you nothing in return except the knowledge that you made something slightly better.",
            "That's the investment. That's the return. And it compounds in ways algorithms will never measure.",
        ],
    },
    {
        "title": "The Weight of Watching",
        "id": "TRANSMISSION",
        "body": [
            "There's a particular kind of exhaustion that comes from watching.",
            "Not participating. Not fighting. Not fleeing. Just watching. Watching people hurt each other and calling it entertainment. Watching systems fail and calling it politics. Watching kindness die and calling it reality.",
            "The watchers carry weight nobody talks about. Because they see everything and feel powerless to change any of it. They're the ones lying awake at 3 AM wondering why the world is like this. The ones who feel too much in a world that rewards feeling nothing.",
            "But here's the thing about watchers: they see patterns nobody else sees. They understand systems that others sleepwalk through. They carry the awareness that is the prerequisite for every revolution that has ever happened.",
            "The problem isn't watching. The problem is watching without acting. The problem is letting observation become a substitute for participation.",
            "Being the change doesn't require grand gestures. It requires the watcher to step into the frame. To stop observing from the margins and start disrupting from within.",
            "You were given those eyes for a reason. Not just to witness — but to see what needs to change and then become the first movement toward it.",
        ],
    },
]

HORROR_TOPICS = [
    {
        "title": "The Uncanny Shelf — Why Abandoned Objects Haunt Us",
        "id": "SIGNAL",
        "category": "HORROR ART",
        "body": [
            "There's a shelf in every horror image that matters.",
            "Not a dramatic set piece. Not a gore-splattered altar. A shelf. Dusty. Crooked. Holding things that used to be loved and now sit in silence, watching.",
            "The reason abandoned objects are terrifying isn't because they're dead. It's because they remember. A porcelain doll with cracked eyes doesn't scare you because of the damage — it scares you because you can feel the child who once held it. The absence of love is louder than any scream.",
            "In horror art, the most powerful weapon isn't blood or shadow. It's context. A teddy bear in a child's room is comforting. The same teddy bear in a flooded basement, one eye missing, sitting perfectly upright? That's dread. That's the moment your brain registers that something placed it there. Something with intention.",
            "Every object in the Lascivious Vibrations universe was designed with abandonment physics. How would this toy decay? How would dust settle on this music box? What would happen to a love letter left in a room where the walls are breathing?",
            "The uncanny shelf isn't a horror trope. It's a psychological truth: we project ourselves onto objects, and when those objects outlive the emotions that created them, they become monuments to loss.",
            "That's not decoration. That's emotional architecture.",
        ],
    },
    {
        "title": "Color Theory of Dread — How Palette Creates Fear",
        "id": "SIGNAL",
        "category": "HORROR ART",
        "body": [
            "Fear has a color palette, and most horror artists get it wrong.",
            "They default to black. Desaturation. Gray scale. Like darkness alone is enough to create dread. It isn't. Darkness without purpose is just a dim photograph.",
            "Real dread lives in the wrong color appearing where it shouldn't. A warm golden glow in a room that should be cold. A single red thread in a monochrome world. Flesh tones that are slightly too saturated, making skin look alive in a way that triggers your fight-or-flight before your conscious mind catches up.",
            "The crimson palette of The Dark Canvas exists because red is the oldest human alarm. Blood. Fire. Warning. When you flood a scene with deep, arterial reds and offset them with bone-white and void-black, you're not choosing aesthetics. You're triggering evolutionary memory.",
            "But the real trick? It's the secondary colors. The hints of amber in the shadows that make you think of fever. The barely-visible green in the highlights that whispers infection. The purple that lives between bruise and beauty.",
            "In every DROP, the palette was designed before a single image was generated. Color sets the emotional temperature of a world before you even see what's in it.",
            "If the palette doesn't make you feel something before you understand the image, the art hasn't done its job.",
        ],
    },
    {
        "title": "The Architecture of Unease — Building Spaces That Breathe Wrong",
        "id": "SIGNAL",
        "category": "HORROR ART",
        "body": [
            "The scariest thing about a room is when it's almost right.",
            "Not obviously wrong. Not melting walls or impossible geometry. Almost right. The door is two inches too narrow. The ceiling is slightly too high. The hallway curves so gradually you don't realize you've been walking in a circle.",
            "Horror architecture works because humans have an unconscious spatial memory. We know how rooms are supposed to feel. We know how corridors should flow. We know the distance between a window and a wall. When those proportions shift even slightly, our nervous system sounds an alarm we can't explain.",
            "That's what 'unease' actually is. It's your body detecting a spatial anomaly before your mind can name it.",
            "Every environment in the LSV universe was built with broken architecture rules. Not surrealism — that's too obvious. Subtle wrongness. A staircase that has one step too many. A mirror placed where no one could use it. A fireplace in a room with no chimney. A nursery with the crib facing the wall.",
            "The goal is never to shock. The goal is to make your subconscious whisper: something happened here. Something is still here. And the room knows you've noticed.",
            "Spaces have memory. Horror art just makes that memory visible.",
        ],
    },
    {
        "title": "Lighting as Storyteller — Shadows That Know Your Name",
        "id": "SIGNAL",
        "category": "HORROR ART",
        "body": [
            "Before a single figure appears in frame, the light has already told you the entire story.",
            "A cold blue wash through a broken window says: this place was abandoned in winter, and nobody came back. A warm amber glow from a source you can't see says: something in this room is alive and generating heat. A single overhead beam cutting through dust says: something wants to be seen.",
            "Lighting in horror art isn't illumination. It's narration. Every shadow is a sentence. Every highlight is a revelation. Every gradient between light and dark is the story deciding how much truth to give you.",
            "The most effective technique in the LSV universe is motivated darkness — shadows that have a reason. A figure standing just outside the light's reach isn't hiding. It's choosing. A hallway that gets darker as it goes deeper isn't poorly lit. It's warning you.",
            "Chiaroscuro in classical painting was about drama. In horror art, it's about control. You see exactly what the image wants you to see. Everything else is left to the part of your brain that's better at creating fear than any artist could.",
            "The best horror image is 70% darkness. Not because less is more. Because what you imagine in the remaining 70% will always be worse than anything I could render.",
        ],
    },
    {
        "title": "The Grammar of Gore — Why Less Violence Creates More Horror",
        "id": "SIGNAL",
        "category": "HORROR ART",
        "body": [
            "Gore is punctuation, not vocabulary.",
            "Most horror artists treat blood and violence like the main language. Splash it everywhere. Make it loud. Make it obvious. But that's not horror — that's noise. And noise stops being scary after the first three seconds.",
            "Real horror uses restraint. A single drop of blood on a pristine white dress says more than a massacre. A crack in a porcelain face reveals more about suffering than a wound ever could. The suggestion of violence — a stain, an absence, an object out of place — activates the viewer's imagination in ways explicit content never will.",
            "The LSV universe has a rule: if the horror requires graphic content to work, the concept isn't strong enough. Strip the gore away. If the image is still unsettling, you've built something real. If it's not, you were using violence as a crutch.",
            "The grammar of horror follows the same rules as any good writing. The most powerful sentence is often the shortest one. The most devastating image is often the quietest one. The most terrifying moment is the one just before something happens.",
            "Restraint isn't weakness. In horror art, restraint is the difference between something you forget in five minutes and something that follows you to bed.",
        ],
    },
]


def get_next_signal_number(html_content: str) -> int:
    """Find the highest signal number in the HTML and return the next one."""
    numbers = re.findall(r'SIGNAL_(\d+)', html_content)
    btc_numbers = re.findall(r'SIGNAL_BTC_(\d+)', html_content)
    transmission_numbers = re.findall(r'TRANSMISSION_(\d+)', html_content)
    
    all_nums = [int(n) for n in numbers + btc_numbers + transmission_numbers]
    return max(all_nums, default=7) + 1


def get_next_transmission_number(html_content: str) -> int:
    """Find the highest transmission number."""
    numbers = re.findall(r'TRANSMISSION_(\d+)', html_content)
    return max([int(n) for n in numbers], default=4) + 1


def get_used_titles(html_content: str) -> set:
    """Get set of blog titles already in the HTML."""
    titles = re.findall(r'class="(?:btc-post-title|signal-title)">(.*?)</h3>', html_content)
    return set(titles)


def build_btc_post(topic: dict, trans_num: int) -> str:
    """Build a BTC transmission HTML block."""
    paragraphs = "\n".join(
        f'          <p class="btc-emphasis">{p}</p>' if i == len(topic["body"]) // 2 
        else f'          <p>{p}</p>'
        for i, p in enumerate(topic["body"])
    )
    return f"""
  <!-- TRANSMISSION {trans_num:03d} -->
  <div class="section btc-post" id="btc-post-{trans_num:03d}">
    <div class="btc-post-inner reveal-up">
      <div class="btc-post-content" style="max-width:100%">
        <span class="btc-post-id">TRANSMISSION_{trans_num:03d}</span>
        <h3 class="btc-post-title">{topic['title']}</h3>
        <div class="btc-post-body">
{paragraphs}
        </div>
      </div>
    </div>
  </div>
"""


def build_horror_signal(topic: dict, sig_num: int) -> str:
    """Build a horror art signal HTML block."""
    paragraphs = "\n".join(
        f'        <p class="dc-emphasis">{p}</p>' if i == len(topic["body"]) // 2
        else f'        <p>{p}</p>'
        for i, p in enumerate(topic["body"])
    )
    return f"""
  <!-- Signal {sig_num:03d} — {topic['title']} -->
  <div class="section dc-section dc-section-alt" id="dc-signal-{sig_num:03d}">
    <div class="section-inner">
      <span class="dc-layer-num" style="text-align:center;display:block">SIGNAL_{sig_num:03d} · {topic['category']}</span>
      <h2 class="section-heading reveal-text dc-heading">{topic['title'].upper()}</h2>
      <div class="dc-essay reveal-text">
{paragraphs}
      </div>
    </div>
  </div>
"""


def build_signal_card(topic: dict, sig_num: int) -> str:
    """Build a signals realm card for the horror post."""
    excerpt = topic["body"][0][:200] + "..." if len(topic["body"][0]) > 200 else topic["body"][0]
    return f"""
  <div class="signal-featured-card reveal-up" id="signal-{sig_num:03d}">
    <div class="signal-featured-content" style="flex:1">
      <span class="signal-id">SIGNAL_{sig_num:03d}</span>
      <span class="signal-category">{topic['category']}</span>
      <h3 class="signal-title">{topic['title']}</h3>
      <p class="signal-excerpt">{excerpt}</p>
      <a class="signal-cta" data-navigate="darkcanvas">READ IN THE DARK CANVAS →</a>
    </div>
  </div>
"""


def main():
    index_path = Path("index.html")
    if not index_path.exists():
        print("index.html not found — running from wrong directory?")
        return

    html = index_path.read_text(encoding="utf-8")
    used_titles = get_used_titles(html)
    blog_type = os.environ.get("BLOG_TYPE", "both")
    
    changes_made = False

    # ── BTC Posts ──
    if blog_type in ("btc", "both"):
        available_btc = [t for t in BTC_TOPICS if t["title"] not in used_titles]
        if available_btc:
            topic = random.choice(available_btc)
            trans_num = get_next_transmission_number(html)
            post_html = build_btc_post(topic, trans_num)
            
            # Insert before "THE WALL" section
            marker = '  <!-- Community Wall (Future) -->'
            if marker in html:
                html = html.replace(marker, post_html + "\n" + marker)
                changes_made = True
                print(f"✅ Added BTC post: {topic['title']} (TRANSMISSION_{trans_num:03d})")
            else:
                print("⚠️ Could not find BTC insertion point")
        else:
            print("ℹ️ All BTC topics already used")

    # ── Horror Art Signals ──
    if blog_type in ("horror", "both"):
        available_horror = [t for t in HORROR_TOPICS if t["title"] not in used_titles]
        if available_horror:
            topic = random.choice(available_horror)
            sig_num = get_next_signal_number(html)
            
            # Add to Dark Canvas realm
            dc_html = build_horror_signal(topic, sig_num)
            dc_marker = '  <!-- DECLARATION -->'
            if '<!-- DECLARATION -->' in html:
                # Find the declaration section in the darkcanvas realm
                dc_marker_full = '  <div class="section dc-section dc-declaration">'
                html = html.replace(dc_marker_full, dc_html + "\n" + dc_marker_full)
                changes_made = True
                print(f"✅ Added horror signal: {topic['title']} (SIGNAL_{sig_num:03d})")
            
            # Also add a card in the Signals realm
            sig_card = build_signal_card(topic, sig_num)
            signals_marker = '  <!-- ═══ INCOMING ═══ -->'
            if signals_marker in html:
                html = html.replace(signals_marker, sig_card + "\n" + signals_marker)
                print(f"   ↳ Added signal card in Signals realm")
        else:
            print("ℹ️ All horror topics already used")

    if changes_made:
        index_path.write_text(html, encoding="utf-8")
        print(f"\n🖤 Blog generation complete — {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    else:
        print("\nNo changes needed")


if __name__ == "__main__":
    main()
