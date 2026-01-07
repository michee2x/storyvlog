-- Seed Chapters for all existing stories
-- This script iterates through every story and adds 3 sample chapters if they don't exist
-- It uses a simplified content placeholder that simulates a "long" chapter for testing scrolling

DO $$
DECLARE
    s_id UUID;
    dummy_text TEXT := 'The morning sun filtered through the dusty curtains, casting long shadows across the room. It was a day like any other, or so it seemed. 
    
She stood by the window, watching the world wake up. The city below was a sprawling beat of steel and glass, alive with the rhythm of millions of souls. But up here, in the quiet of the apartment, time seemed to stand still.

"Are you ready?" a voice called from the hallway.

She turned, a faint smile playing on her lips. "As ready as I will ever be."

The journey ahead was uncertain. They had packed only the essentials: a map, a compass, and a locket that had been passed down through generations. Legend said it held the key to the lost city, but legends were often just stories told to frighten children.

They stepped out into the cool air, the door clicking shut behind them. There was no turning back now. The path was winding and steep, leading them away from everything they knew.

Hours turned into days. The landscape shifted from urban gray to verdant green, and then to the stark white of the mountains. They spoke little, their breath forming clouds in the freezing air.

Suddenly, the ground beneath them rumbled. An avalanche? No, something rhythmic. Looking down into the valley, they saw it—a massive structure rising from the mist. The destination.

It was exactly as the old books had described, yet infinitely more terrifying in person. The stone gates alone were fifty feet tall, carved with symbols that seemed to writhe when looked at directly.

"We made it," he whispered, awe striking his voice.

"This is just the beginning," she replied, clutching the locket. It was warm against her skin, pulsing with a faint light. She approached the gate, the locket in hand.

As she inserted it into the depression in the stone, a deep groan echoed from within the earth. The gates began to open...';

BEGIN
    FOR s_id IN SELECT id FROM stories LOOP
        -- Check if chapters already exist for this story to avoid duplicates
        IF NOT EXISTS (SELECT 1 FROM chapters WHERE story_id = s_id) THEN
            
            -- Chapter 1
            INSERT INTO chapters (story_id, title, content, order_index)
            VALUES (s_id, 'Chapter 1: The Call', dummy_text, 1);
            
            -- Chapter 2
            INSERT INTO chapters (story_id, title, content, order_index)
            VALUES (s_id, 'Chapter 2: The Journey', 'The gates opened to reveal a darkness so complete it felt like a physical weight. ' || dummy_text, 2);

             -- Chapter 3
            INSERT INTO chapters (story_id, title, content, order_index)
            VALUES (s_id, 'Chapter 3: The Discovery', 'Inside, the air was stale and dry. Torches flared to life automatically as they passed. ' || dummy_text, 3);
            
        END IF;
    END LOOP;
END $$;
