import { DialogueLine, LightItem } from '../types';

export const ALL_COLLECTIBLE_LIGHTS: Record<string, LightItem> = {
  orik_light: {
    id: 'orik_light',
    name: {
      en: 'Verdant Seed of Kindness',
      fr: 'Graine Verdoyante de Bonté',
    },
    description: {
      en: 'Given by Orik the sprite. A warm green spark that brings life back to frozen soil.',
      fr: 'Offerte par Orik le follet. Une étincelle verte qui redonne vie aux terres gelées.',
    },
    color: '#10b981',
    secondaryColor: '#34d399',
    icon: 'seed',
    giver: {
      en: 'Orik the Forest Sprite',
      fr: 'Orik le Follet des Bois',
    },
  },
  vivienne_light: {
    id: 'vivienne_light',
    name: {
      en: 'Amber Hearth Crystal',
      fr: 'Cristal d’Âtre Ambré',
    },
    description: {
      en: 'Given by Vivienne the glassmaker. A golden glow born from rekindled inspiration.',
      fr: 'Offert par Vivienne la verrière. Une lueur dorée née d’une inspiration ravivée.',
    },
    color: '#f59e0b',
    secondaryColor: '#fbbf24',
    icon: 'fire',
    giver: {
      en: 'Vivienne the Glassmaker',
      fr: 'Vivienne la Verrière',
    },
  },
  lezar_light: {
    id: 'lezar_light',
    name: {
      en: 'Sea-Mist Velvet Aura',
      fr: 'Aura de Velours Brume-de-Mer',
    },
    description: {
      en: 'A soothing azure glow reflecting Lezar’s quiet, loyal presence.',
      fr: 'Une douce lueur azurée reflétant la présence calme et loyale de Lezar.',
    },
    color: '#0284c7',
    secondaryColor: '#38bdf8',
    icon: 'sparkles',
    giver: {
      en: 'Lezar the Familiar',
      fr: 'Lezar le Familier',
    },
  },
  the_bottle: {
    id: 'the_bottle',
    name: {
      en: 'The Little Glowing Bottle',
      fr: 'La Petite Bouteille Scintillante',
    },
    description: {
      en: 'A strange crystal bottle containing a secret glowing message from afar.',
      fr: 'Une étrange fiole de cristal abritant un message secret et lumineux venu de loin.',
    },
    color: '#38bdf8',
    secondaryColor: '#818cf8',
    icon: 'sparkles',
    giver: {
      en: 'A Gentle Messenger',
      fr: 'Un Doux Messager',
    },
  },
  clown_spark: {
    id: 'clown_spark',
    name: {
      en: 'Starlight in the Dark',
      fr: 'Étoile dans l’Obscurité',
    },
    description: {
      en: 'A black-gold & deep violet spark kept safe by the whimsical Mélo Clown.',
      fr: 'Une étincelle or-noir et violet profond préservée par le doux et fantasque Clown Mélo.',
    },
    color: '#3b0764',
    secondaryColor: '#fbbf24',
    icon: 'sun',
    giver: {
      en: 'Mélo Clown',
      fr: 'Le Clown Mélo',
    },
  },
  sww_pin: {
    id: 'sww_pin',
    name: {
      en: 'Golden "SWW" Enamel Pin',
      fr: 'Épingle Dorée "SWW"',
    },
    description: {
      en: 'An ornate gold enamel brooch gifted by Mélo Clown celebrating Super Witch Wendy.',
      fr: 'Une épingle précieuse en émail doré offerte par le Clown Mélo en hommage à Super Sorcière Wendy.',
    },
    color: '#fbbf24',
    secondaryColor: '#f472b6',
    icon: 'heart',
    giver: {
      en: 'Mélo Clown & Friends',
      fr: 'Le Clown Mélo & Ses Amis',
    },
  },
};

export const STORY_DATA: Record<string, DialogueLine> = {
  // ==========================================
  // PROLOGUE: THE DAY WITHOUT SUN
  // ==========================================
  prologue_1: {
    id: 'prologue_1',
    speaker: 'narrator',
    location: 'cottage_twilight',
    music: 'cottage',
    chapterTitle: {
      en: 'PROLOGUE',
      fr: 'PROLOGUE',
    },
    chapterSubtitle: {
      en: 'The Day Without Sun',
      fr: 'Le Jour sans Soleil',
    },
    isChapterStart: true,
    text: {
      en: 'The morning arrived without a dawn.',
      fr: 'Le matin arriva sans aurore.',
    },
    nextSceneId: 'prologue_2',
  },
  prologue_2: {
    id: 'prologue_2',
    speaker: 'narrator',
    location: 'cottage_twilight',
    text: {
      en: 'A gentle, perpetual twilight rested over the valleys. The world had not ended, but the magical world was quietly losing its warmth and light.',
      fr: 'Un crépuscule doux et perpétuel s’étendait sur les vallées. Le monde n’avait pas pris fin, mais le monde magique perdait doucement sa chaleur et sa clarté.',
    },
    nextSceneId: 'prologue_3',
  },
  prologue_3: {
    id: 'prologue_3',
    speaker: 'witch',
    speakerName: { en: 'Super Witch', fr: 'Super Sorcière' },
    expression: 'thoughtful',
    location: 'cottage_twilight',
    sfx: 'ember_glow',
    text: {
      en: 'The young witch woke in her cottage by the hearth. Nestled gently between her palms was a steady, pulsating glow: the missing Sun.',
      fr: 'La jeune sorcière s’éveilla dans sa chaumière près de l’âtre. Niché délicatement entre ses paumes se trouvait un éclat vibrant et chaleureux : le Soleil disparu.',
    },
    nextSceneId: 'prologue_4',
  },
  prologue_4: {
    id: 'prologue_4',
    speaker: 'narrator',
    location: 'cottage_twilight',
    text: {
      en: 'She did not steal it out of malice or greed. She had borrowed its light because so many people and creatures had needed warmth along her travels.',
      fr: 'Elle ne l’avait point dérobé par malice ou orgueil. Elle avait emprunté sa lumière car tant d’êtres et de créatures avaient eu besoin de réconfort sur son chemin.',
    },
    nextSceneId: 'prologue_5',
  },
  prologue_5: {
    id: 'prologue_5',
    speaker: 'narrator',
    location: 'cottage_twilight',
    text: {
      en: 'Every time she encountered sorrow or cold, she carried a little more of the Sun’s weight. But now, the Sun was growing heavy… and it wanted to return home.',
      fr: 'Chaque fois qu’elle croisait la tristesse ou le froid, elle portait un peu plus du poids du Soleil. Mais désormais, le Soleil devenait lourd… et aspirait à rentrer chez lui.',
    },
    nextSceneId: 'prologue_6',
  },
  prologue_6: {
    id: 'prologue_6',
    speaker: 'lezar',
    speakerName: { en: 'Lezar', fr: 'Lezar' },
    expression: 'calm',
    location: 'cottage_twilight',
    sfx: 'purr',
    text: {
      en: 'Lezar, her Tonkinese familiar, padded softly across the wooden floorboards, his luminous blue eyes looking up at her with quiet loyalty.',
      fr: 'Lezar, son familier tonkinois, s’avança à pas feutrés sur le parquet, ses yeux d’azur levés vers elle avec une loyauté sereine.',
    },
    nextSceneId: 'prologue_7',
  },
  prologue_7: {
    id: 'prologue_7',
    speaker: 'witch',
    speakerName: { en: 'Super Witch', fr: 'Super Sorcière' },
    expression: 'determined',
    location: 'cottage_twilight',
    sfx: 'soft_bell',
    text: {
      en: '“We have to reach the sea, Lezar,” she murmured, placing the sun into her brass lantern. “It’s time to take the light where it belongs.”',
      fr: '« Nous devons atteindre la mer, Lezar », murmura-t-elle en plaçant le soleil dans sa lanterne de laiton. « Il est temps de ramener la lumière là où elle doit être. »',
    },
    nextSceneId: 'chapter1_1',
  },

  // ==========================================
  // CHAPTER I: THE WITCH WHO HELPS
  // ==========================================
  chapter1_1: {
    id: 'chapter1_1',
    isChapterStart: true,
    chapterTitle: {
      en: 'CHAPTER I',
      fr: 'CHAPITRE I',
    },
    chapterSubtitle: {
      en: 'The Witch Who Helps',
      fr: 'La Sorcière qui Aide',
    },
    speaker: 'narrator',
    location: 'whispering_forest',
    weather: 'dust_motes',
    music: 'forest',
    text: {
      en: 'They set out along the ancient trail beneath the canopy of the Whispering Forest.',
      fr: 'Ils s’élancèrent sur l’ancien sentier sous la canopée de la Forêt des Murmures.',
    },
    nextSceneId: 'chapter1_2',
  },
  chapter1_2: {
    id: 'chapter1_2',
    speaker: 'narrator',
    location: 'whispering_forest',
    weather: 'dust_motes',
    text: {
      en: 'Without the sun in the sky, a delicate blue frost had settled on the emerald moss, freezing the newly sprouted saplings in place.',
      fr: 'Sans le soleil dans le ciel, un givre bleu délicat s’était déposé sur la mousse émeraude, figeant sur place les jeunes pousses printanières.',
    },
    nextSceneId: 'chapter1_3',
  },
  chapter1_3: {
    id: 'chapter1_3',
    speaker: 'orik',
    speakerName: { en: 'Orik the Sprite', fr: 'Orik le Follet' },
    expression: 'shivering',
    location: 'whispering_forest',
    weather: 'dust_motes',
    zoom: 'close_up',
    text: {
      en: 'From inside a hollow silver birch came a faint, shivering voice. “Is anyone there? The spring roots… they’ve turned to ice. I can’t warm them on my own…”',
      fr: 'De l’intérieur d’un bouleau creux s’éleva une voix faible et tremblante. « Y a-t-il quelqu’un ? Les racines du printemps… elles sont devenues de glace. Je ne peux les réchauffer tout seul… »',
    },
    nextSceneId: 'chapter1_4',
  },
  chapter1_4: {
    id: 'chapter1_4',
    speaker: 'witch',
    speakerName: { en: 'Super Witch', fr: 'Super Sorcière' },
    expression: 'gentle',
    location: 'whispering_forest',
    text: {
      en: 'The witch knelt into the frozen moss. She unlatched the lantern, feeling the sun’s gentle warmth pulse against her fingers.',
      fr: 'La sorcière s’agenouilla dans la mousse givrée. Elle déverrouilla la lanterne, sentant la douce chaleur du soleil pulser contre ses doigts.',
    },
    nextSceneId: 'chapter1_choice',
  },
  chapter1_choice: {
    id: 'chapter1_choice',
    speaker: 'witch',
    speakerName: { en: 'Super Witch', fr: 'Super Sorcière' },
    expression: 'thoughtful',
    location: 'whispering_forest',
    text: {
      en: 'How will you share your light with Orik and the forest?',
      fr: 'Comment souhaitez-vous partager votre lumière avec Orik et la forêt ?',
    },
    choices: [
      {
        id: 'ch1_opt1',
        text: {
          en: 'Breathe golden light into the soil with your own hands, wrapping the roots in gentle heat.',
          fr: 'Insuffler une lumière dorée dans le sol de vos propres mains, enveloppant les racines de chaleur.',
        },
        nextSceneId: 'chapter1_res1',
        narrativeFlag: 'forest_direct_magic',
        lightReward: ALL_COLLECTIBLE_LIGHTS.orik_light,
      },
      {
        id: 'ch1_opt2',
        text: {
          en: 'Let Lezar step forward to rest his warm paws upon the moss, letting the ember flow together.',
          fr: 'Laisser Lezar s’avancer pour poser ses pattes tièdes sur la mousse, laissant la braise couler ensemble.',
        },
        nextSceneId: 'chapter1_res2',
        narrativeFlag: 'forest_cat_guide',
        lightReward: ALL_COLLECTIBLE_LIGHTS.orik_light,
      },
    ],
  },
  chapter1_res1: {
    id: 'chapter1_res1',
    speaker: 'narrator',
    location: 'whispering_forest',
    sfx: 'ember_glow',
    text: {
      en: 'Golden light trickles through her fingers into the earth. The frost melts into clear dew, and fresh emerald shoots uncurl with a contented rustle.',
      fr: 'Une lumière dorée ruisselle de ses doigts jusqu’à la terre. Le givre fond en rosée claire, et de fraîches pousses émeraudes se déploient avec un frémissement ravi.',
    },
    nextSceneId: 'chapter1_5',
  },
  chapter1_res2: {
    id: 'chapter1_res2',
    speaker: 'narrator',
    location: 'whispering_forest',
    sfx: 'purr',
    text: {
      en: 'Lezar purrs deeply as the sun’s ember nests between his paws before soaking into the earth, waking the sleeping blossoms.',
      fr: 'Lezar ronronne profondément tandis que la braise de soleil se niche entre ses coussinets avant d’abreuver la terre, réveillant les fleurs endormies.',
    },
    nextSceneId: 'chapter1_5',
  },
  chapter1_5: {
    id: 'chapter1_5',
    speaker: 'orik',
    speakerName: { en: 'Orik the Sprite', fr: 'Orik le Follet' },
    expression: 'grateful',
    location: 'whispering_forest',
    sfx: 'magic_surge',
    text: {
      en: 'Orik beams with joy. “Thank you, traveler! Take this verdant seed of kindness. Whenever your road turns cold, remember that life remembers you.”',
      fr: 'Orik rayonne de joie. « Merci, voyageuse ! Prends cette graine verdoyante de bonté. Quand ta route deviendra froide, souviens-toi que la vie ne t’oublie pas. »',
    },
    nextSceneId: 'chapter2_1',
  },

  // ==========================================
  // CHAPTER II: LITTLE LIGHTS
  // ==========================================
  chapter2_1: {
    id: 'chapter2_1',
    isChapterStart: true,
    chapterTitle: {
      en: 'CHAPTER II',
      fr: 'CHAPITRE II',
    },
    chapterSubtitle: {
      en: 'Little Lights',
      fr: 'Petites Lumières',
    },
    speaker: 'narrator',
    location: 'crossroads_kiln',
    music: 'crossroads',
    text: {
      en: 'As the journey continued across rocky canyon roads, the witch encountered others whose inner sparks had grown dim.',
      fr: 'Tandis que le voyage se poursuivait à travers les canyons rocheux, la sorcière croisa d’autres êtres dont les étincelles intérieures s’étaient assombries.',
    },
    nextSceneId: 'chapter2_2',
  },
  chapter2_2: {
    id: 'chapter2_2',
    speaker: 'artisan',
    speakerName: { en: 'Vivienne the Glassmaker', fr: 'Vivienne la Verrière' },
    expression: 'weary',
    location: 'crossroads_kiln',
    text: {
      en: 'Beside a dormant stone kiln sat Vivienne. “Without fire, the glass sits cloudy and unfinished. I’ve forgotten how to make beautiful things.”',
      fr: 'Près d’un four de pierre éteint était assise Vivienne. « Sans feu, le verre reste terne et inachevé. J’ai oublié comment créer de belles choses. »',
    },
    nextSceneId: 'chapter2_choice',
  },
  chapter2_choice: {
    id: 'chapter2_choice',
    speaker: 'witch',
    speakerName: { en: 'Super Witch', fr: 'Super Sorcière' },
    expression: 'gentle',
    location: 'crossroads_kiln',
    text: {
      en: 'What will you do to help the weary glassmaker?',
      fr: 'Que ferez-vous pour aider la verrière découragée ?',
    },
    choices: [
      {
        id: 'ch2_ember_give',
        text: {
          en: 'Reach into your lantern and gently place a warm golden ember into her stone kiln.',
          fr: 'Puisiez dans votre lanterne pour déposer une douce braise dorée au cœur de son four de pierre.',
        },
        nextSceneId: 'chapter2_3',
        narrativeFlag: 'kiln_rekindled',
        lightReward: ALL_COLLECTIBLE_LIGHTS.vivienne_light,
      },
    ],
  },
  chapter2_3: {
    id: 'chapter2_3',
    speaker: 'witch',
    speakerName: { en: 'Super Witch', fr: 'Super Sorcière' },
    expression: 'gentle',
    location: 'crossroads_kiln',
    sfx: 'ember_glow',
    text: {
      en: 'The witch shared a bright ember with the kiln. The flames roared to life in brilliant amber, casting dancing reflections across the colorful glass.',
      fr: 'La sorcière offrit une braise ardente au foyer. Les flammes reprirent vie en un ambre éclatant, projetant des reflets dansants sur les verres colorés.',
    },
    nextSceneId: 'chapter2_4',
  },
  chapter2_4: {
    id: 'chapter2_4',
    speaker: 'artisan',
    speakerName: { en: 'Vivienne the Glassmaker', fr: 'Vivienne la Verrière' },
    expression: 'inspired',
    location: 'crossroads_kiln',
    sfx: 'soft_bell',
    text: {
      en: 'Vivienne’s eyes welled with tears of gratitude. “You’ve reminded me of what I love. Take this amber crystal—it carries my sincere thanks.”',
      fr: 'Les yeux de Vivienne s’embuèrent de larmes de gratitude. « Tu m’as rappelé ce que j’aime. Prends ce cristal ambré—il porte mes sincères remerciements. »',
    },
    nextSceneId: 'chapter2_5',
  },
  chapter2_5: {
    id: 'chapter2_5',
    speaker: 'narrator',
    location: 'crossroads_kiln',
    text: {
      en: 'The witch smiled and kept walking. But inside the lantern, the Sun was slightly dimmer than before.',
      fr: 'La sorcière sourit et reprit sa marche. Mais dans sa lanterne, le Soleil brillait un peu moins fort qu’auparavant.',
    },
    nextSceneId: 'chapter2_6',
  },
  chapter2_6: {
    id: 'chapter2_6',
    speaker: 'lezar',
    speakerName: { en: 'Lezar', fr: 'Lezar' },
    expression: 'attentive',
    location: 'crossroads_kiln',
    text: {
      en: 'Lezar noticed. He walked close to her boots, brushing his flank against her leg with quiet concern.',
      fr: 'Lezar le remarqua. Il marchait tout près de ses bottes, frôlant son flanc contre sa jambe avec une inquiétude silencieuse.',
    },
    nextSceneId: 'chapter3_1',
  },

  // ==========================================
  // CHAPTER III: LEZAR
  // ==========================================
  chapter3_1: {
    id: 'chapter3_1',
    isChapterStart: true,
    chapterTitle: {
      en: 'CHAPTER III',
      fr: 'CHAPITRE III',
    },
    chapterSubtitle: {
      en: 'Lezar',
      fr: 'Lezar',
    },
    speaker: 'narrator',
    location: 'windy_road',
    music: 'road',
    text: {
      en: 'High upon the winding mountain ridge, the cold wind whipped around them. The witch finally sat down on a mossy boulder, her breath fogging in the dusk.',
      fr: 'Haut sur la crête montagneuse, le vent frais tourbillonnait. La sorcière s’assit enfin sur un rocher moussu, son souffle formant une buée dans le soir.',
    },
    nextSceneId: 'chapter3_2',
  },
  chapter3_2: {
    id: 'chapter3_2',
    speaker: 'witch',
    speakerName: { en: 'Super Witch', fr: 'Super Sorcière' },
    expression: 'overwhelmed',
    location: 'windy_road',
    text: {
      en: '“I’m so tired, Lezar,” she admitted softly. “I thought if I gave enough away, it would feel lighter. Why does it feel like I’m carrying everyone’s burdens alone?”',
      fr: '« Je suis si fatiguée, Lezar », avoua-t-elle doucement. « Je pensais qu’en donnant autant, ce serait plus léger. Pourquoi ai-je l’impression de porter les fardeaux de tous toute seule ? »',
    },
    nextSceneId: 'chapter3_3',
  },
  chapter3_3: {
    id: 'chapter3_3',
    speaker: 'lezar',
    speakerName: { en: 'Lezar', fr: 'Lezar' },
    expression: 'comforting',
    location: 'windy_road',
    sfx: 'purr',
    text: {
      en: 'Lezar did not magically speak or solve the problem. He simply stepped up onto her knee, tucked his warm chin against her wrist, and stayed.',
      fr: 'Lezar ne parla pas par magie et ne résolut pas le problème. Il monta simplement sur son genou, posa son menton tiède contre son poignet, et resta là.',
    },
    nextSceneId: 'chapter3_choice',
  },
  chapter3_choice: {
    id: 'chapter3_choice',
    speaker: 'witch',
    speakerName: { en: 'Super Witch', fr: 'Super Sorcière' },
    expression: 'thoughtful',
    location: 'windy_road',
    text: {
      en: 'What will you do in this quiet moment on the ridge?',
      fr: 'Que ferez-vous en cet instant de calme sur la crête ?',
    },
    choices: [
      {
        id: 'ch3_opt1',
        text: {
          en: 'Set the lantern down, stroke Lezar’s ears, and allow yourself to simply rest.',
          fr: 'Poser la lanterne, caresser les oreilles de Lezar et vous accorder le droit de simplement vous reposer.',
        },
        nextSceneId: 'chapter3_res1',
        narrativeFlag: 'road_rest',
        lightReward: ALL_COLLECTIBLE_LIGHTS.lezar_light,
      },
      {
        id: 'ch3_opt2',
        text: {
          en: 'Whisper your gratitude to Lezar for always being by your side.',
          fr: 'Chuchoter votre gratitude à Lezar pour être toujours à vos côtés.',
        },
        nextSceneId: 'chapter3_res2',
        narrativeFlag: 'road_gratitude',
        lightReward: ALL_COLLECTIBLE_LIGHTS.lezar_light,
      },
    ],
  },
  chapter3_res1: {
    id: 'chapter3_res1',
    speaker: 'narrator',
    location: 'windy_road',
    sfx: 'soft_bell',
    text: {
      en: 'For several peaceful minutes, she did not carry or fix anything. The world did not fall apart without her constant effort.',
      fr: 'Pendant de douces minutes, elle ne porta rien et ne résolut rien. Le monde ne s’écroula point sans son effort continu.',
    },
    nextSceneId: 'chapter4_1',
  },
  chapter3_res2: {
    id: 'chapter3_res2',
    speaker: 'narrator',
    location: 'windy_road',
    sfx: 'purr',
    text: {
      en: 'Lezar gave a contented chirp, his steady purr reminding her that companionship is the greatest warmth of all.',
      fr: 'Lezar poussa un petit roucoulement ravi, son ronronnement régulier lui rappelant que la compagnie est la plus belle des chaleurs.',
    },
    nextSceneId: 'chapter4_1',
  },

  // ==========================================
  // CHAPTER IV: THE BOTTLE (EASTER EGG!)
  // ==========================================
  chapter4_1: {
    id: 'chapter4_1',
    isChapterStart: true,
    chapterTitle: {
      en: 'CHAPTER IV',
      fr: 'CHAPITRE IV',
    },
    chapterSubtitle: {
      en: 'The Bottle',
      fr: 'La Bouteille',
    },
    speaker: 'narrator',
    location: 'bottle_path',
    music: 'bottle',
    sfx: 'bottle_tink',
    text: {
      en: 'Further down the road toward the sea, a curious light shimmered beside an old stone milestone.',
      fr: 'Plus loin sur la route vers la mer, une curieuse lueur scintillait près d’une vieille borne de pierre.',
    },
    nextSceneId: 'chapter4_2',
  },
  chapter4_2: {
    id: 'chapter4_2',
    speaker: 'witch',
    speakerName: { en: 'Super Witch', fr: 'Super Sorcière' },
    expression: 'thoughtful',
    location: 'bottle_path',
    text: {
      en: 'Resting on the velvet moss was a small, delicate glass bottle. Inside was a tiny glowing scroll, bobbing as if carried across invisible waters.',
      fr: 'Posée sur la mousse de velours se trouvait une petite fiole de verre délicate. À l’intérieur flottait un minuscule parchemin lumineux, ondulant comme porté par des eaux invisibles.',
    },
    nextSceneId: 'chapter4_3',
  },
  chapter4_3: {
    id: 'chapter4_3',
    speaker: 'narrator',
    location: 'bottle_path',
    text: {
      en: 'She did not know who had left it, or from what distant shore it had sailed. But holding it brought a strange, comforting warmth.',
      fr: 'Elle ne savait qui l’avait laissée, ni de quel rivage lointain elle avait vogué. Mais la tenir apportait une étrange et douce chaleur réconfortante.',
    },
    nextSceneId: 'chapter4_choice',
  },
  chapter4_choice: {
    id: 'chapter4_choice',
    speaker: 'witch',
    speakerName: { en: 'Super Witch', fr: 'Super Sorcière' },
    expression: 'gentle',
    location: 'bottle_path',
    text: {
      en: 'What will you do with the little magical bottle?',
      fr: 'Que ferez-vous de la petite bouteille magique ?',
    },
    choices: [
      {
        id: 'ch4_bottle_keep',
        text: {
          en: 'Tuck the bottle safely into your satchel beside Lezar, keeping its secret light close.',
          fr: 'Glisser la bouteille précieusement dans votre sacoche près de Lezar, gardant sa lumière secrète tout près.',
        },
        nextSceneId: 'chapter4_4',
        narrativeFlag: 'kept_bottle',
        lightReward: ALL_COLLECTIBLE_LIGHTS.the_bottle,
      },
    ],
  },
  chapter4_4: {
    id: 'chapter4_4',
    speaker: 'narrator',
    location: 'bottle_path',
    sfx: 'bottle_tink',
    text: {
      en: 'The little bottle seemed to hum softly in recognition. Ahead, the path curved sharply toward a mysterious, dreamlike chasm.',
      fr: 'La petite bouteille sembla bourdonner doucement en signe de reconnaissance. Devant eux, le sentier bifurquait vers un gouffre étrange et onirique.',
    },
    nextSceneId: 'chapter5_1',
  },

  // ==========================================
  // CHAPTER V: THE ABYSS & THE DARK LORD
  // ==========================================
  chapter5_1: {
    id: 'chapter5_1',
    isChapterStart: true,
    chapterTitle: {
      en: 'CHAPTER V',
      fr: 'CHAPITRE V',
    },
    chapterSubtitle: {
      en: 'The Abyss',
      fr: 'L’Abîme',
    },
    speaker: 'narrator',
    location: 'velvet_abyss',
    music: 'abyss',
    text: {
      en: 'The road descended into the Obsidian Chasm of the Velvet Abyss—an ancient, boundless void existing since before the first sunrise. Suddenly, the crystal bottle in her hands began to pulse with blinding celestial starlight! 🌟',
      fr: 'La route descendit vers le Gouffre d’Obsidienne de l’Abîme de Velours—un vide infini existant avant le tout premier lever de soleil. Soudain, la fiole de cristal entre ses mains se mit à pulser d’un éclat céleste éblouissant ! 🌟',
    },
    bottleGlow: true,
    sfx: 'bottle_tink',
    nextSceneId: 'chapter5_1b',
  },
  chapter5_1b: {
    id: 'chapter5_1b',
    speaker: 'narrator',
    location: 'velvet_abyss',
    sfx: 'magic_surge',
    text: {
      en: 'The bottle shone with dazzling radiance, illuminating the vast abyssal abyss… and then, with a sharp chime, the light vanished into pitch-black silence.',
      fr: 'La fiole brilla d’un éclat éclatant, illuminant l’immensité abyssale… puis, avec un tintement cristallin, la lumière s’éteignit dans un silence d’encre.',
    },
    nextSceneId: 'chapter5_2',
  },
  chapter5_2: {
    id: 'chapter5_2',
    speaker: 'narrator',
    location: 'velvet_abyss',
    sfx: 'clown_jingle',
    text: {
      en: 'From the total darkness, something emerged: first two hollow eye sockets with a piercing golden glint… then a thin, impossible smile carved into a cracked porcelain mask… an ancient crooked top hat… and finally a towering, unnatural silhouette whose body dissolved into swirling black mist and spindly shadow claws.',
      fr: 'De l’obscurité totale émergea quelque chose : d’abord deux orbites creuses percées d’un éclat doré… puis un sourire fin et impossible gravé sur un masque de porcelaine brisé… un haut-de-forme antique incliné… et enfin une silhouette gigantesque et surnaturelle dont le corps se dissolvait en brumes noires et griffes d’ombres allongées.',
    },
    nextSceneId: 'chapter5_2b',
  },
  chapter5_2b: {
    id: 'chapter5_2b',
    speaker: 'clown',
    speakerName: { en: '???', fr: '???' },
    expression: 'abyss_mad',
    location: 'velvet_abyss',
    sfx: 'thunder',
    shake: 'dramatic',
    text: {
      en: 'The towering shadow entity leans downward, abyssal shadow tendrils flaring violently with furious crimson energy! “WHERE ON EARTH DID YOU GET THAT CRYSTAL BOTTLE?!” His piercing golden eye burns with sudden rage!',
      fr: 'La gigantesque entité d’ombre se penche, ses volutes d’ombres tourbillonnant violemment dans un éclat cramoisi furieux ! « OÙ DIABLE AVEZ-VOUS TROUVÉ CETTE BOUTEILLE DE CRISTAL ?! » Son œil doré s’embrase d’une fureur soudaine !',
    },
    nextSceneId: 'chapter5_2c',
  },
  chapter5_2c: {
    id: 'chapter5_2c',
    speaker: 'witch',
    speakerName: { en: 'Super Witch', fr: 'Super Sorcière' },
    expression: 'gentle',
    location: 'velvet_abyss',
    text: {
      en: 'Super Witch does not recoil. She cradles the glowing bottle calmly and looks up into his raging gaze. “Above… resting on the velvet moss beside an ancient milestone.”',
      fr: 'Super Sorcière ne recule point. Elle tient la fiole lumineuse avec calme et lève les yeux vers son regard furieux. « Là-haut… posée sur la mousse près d’une vieille borne de pierre. »',
    },
    nextSceneId: 'chapter5_2c_heartbeat',
  },
  chapter5_2c_heartbeat: {
    id: 'chapter5_2c_heartbeat',
    speaker: 'clown',
    speakerName: { en: '???', fr: '???' },
    expression: 'abyss_soft',
    location: 'velvet_abyss',
    sfx: 'heartbeat',
    shake: 'gentle',
    text: {
      en: 'The entity stares down into her steady, gentle gaze. The violent raging flames freeze mid-air. For a hushed second, a deep heartbeat pulses through the silent void… his long-dormant heart stirs awake, and the fiery shadow claws slowly recede back into his cloak.',
      fr: 'L’entité plonge son regard dans ses yeux calmes et bienveillants. Les flammes violentes se figent en plein vol. Durant une seconde suspendue, un battement de cœur résonne dans le vide silencieux… son cœur longtemps endormi s’éveille, et ses griffes d’ombres incandescentes rentrent sous sa cape.',
    },
    nextSceneId: 'chapter5_2d',
  },
  chapter5_2d: {
    id: 'chapter5_2d',
    speaker: 'clown',
    speakerName: { en: '???', fr: '???' },
    expression: 'abyss_surprised',
    location: 'velvet_abyss',
    sfx: 'heartbeat',
    shake: 'gentle',
    text: {
      en: 'The entity shakes his head in utter, flustered disbelief, a quiet rhythmic heartbeat thumping in his chest as he mutters about impossible ocean drift currents, before clearing his throat to resume his grand villainous posture…',
      fr: 'L’entité secoue la tête dans une incrédulité totale et troublée, un battement de cœur régulier résonnant dans sa poitrine tandis qu’il marmonne sur des courants marins impossibles, avant de se racler la gorge pour reprendre sa posture imposante…',
    },
    nextSceneId: 'chapter5_3',
  },
  chapter5_3: {
    id: 'chapter5_3',
    speaker: 'clown',
    speakerName: { en: 'The Dark Lord', fr: 'Le Seigneur Sombre' },
    expression: 'abyss_horror',
    location: 'velvet_abyss',
    sfx: 'clown_jingle',
    text: {
      en: '“Ahem! Halt, mortals. You stand before an entity that watched the first light fade… THE DARK LORD OF THE OBSIDIAN CHASM.” His ancient, unearthly voice resonated as if stone itself were speaking.',
      fr: '« Hum ! Halte là, mortels. Vous vous tenez devant une entité qui a vu s’éteindre la première lumière… LE SEIGNEUR SOMBRE DU GOUFFRE D’OBSIDIENNE. » Sa voix ancestrale et surnaturelle résonna comme la pierre elle-même.',
    },
    nextSceneId: 'chapter5_4',
  },
  chapter5_4: {
    id: 'chapter5_4',
    speaker: 'clown',
    speakerName: { en: 'The Dark Clown', fr: 'Le Clown Sombre' },
    expression: 'abyss_theatrical',
    location: 'velvet_abyss',
    text: {
      en: '“…Or The Dark Clown, if you prefer the afternoon matinee rate,” the ancient entity muttered from within its swirling cloak of black mist, the single piercing star eye behind its cracked porcelain mask blinking in dry amusement.',
      fr: '« …Ou Le Clown Sombre, si vous préférez le tarif réduit de l’après-midi », murmura l’entité ancestrale depuis sa cape de brumes noires, l’unique œil stellaire derrière son masque de porcelaine fissuré clignant avec une ironie pince-sans-rire.',
    },
    nextSceneId: 'chapter5_4b',
  },
  chapter5_4b: {
    id: 'chapter5_4b',
    speaker: 'witch',
    speakerName: { en: 'Super Witch', fr: 'Super Sorcière' },
    expression: 'gentle',
    location: 'velvet_abyss',
    sfx: 'magic_sparkle',
    text: {
      en: 'Super Witch tilts her head with a warm, genuine smile. “I’m Super Witch,” she introduces herself softly, her starry wand resting peacefully by her side.',
      fr: 'Super Sorcière penche la tête avec un doux sourire bienveillant. « Je suis Super Sorcière », se présente-t-elle doucement, sa baguette étoilée reposant paisiblement à ses côtés.',
    },
    nextSceneId: 'chapter5_5',
  },
  chapter5_5: {
    id: 'chapter5_5',
    speaker: 'witch',
    speakerName: { en: 'Super Witch', fr: 'Super Sorcière' },
    expression: 'gentle',
    location: 'velvet_abyss',
    text: {
      en: 'Super Witch did not try to defeat or ‘fix’ the terrifying creature. She merely walked over and sat down calmly upon the obsidian precipice beside its swirling shadow tendrils.',
      fr: 'Super Sorcière ne chercha ni à vaincre ni à « réparer » la terrifiante créature. Elle s’avança simplement et s’assit avec calme sur le précipice d’obsidienne, près de ses volutes d’ombres tourbillonnantes.',
    },
    nextSceneId: 'chapter5_choice',
  },
  chapter5_choice: {
    id: 'chapter5_choice',
    speaker: 'witch',
    speakerName: { en: 'Super Witch', fr: 'Super Sorcière' },
    expression: 'gentle',
    location: 'velvet_abyss',
    text: {
      en: 'How will you speak with the Dark Lord?',
      fr: 'Comment souhaitez-vous parler avec le Seigneur Sombre ?',
    },
    choices: [
      {
        id: 'ch5_opt1',
        text: {
          en: 'Play along with a light bow: “An honor, Your Grand Shadow. Would you care to walk with us to the sea?”',
          fr: 'Entrer dans son jeu avec une révérence : « C’est un honneur, Votre Sombre Majesté. Voudriez-vous marcher vers la mer avec nous ? »',
        },
        nextSceneId: 'chapter5_res1',
        narrativeFlag: 'clown_theatrical',
        lightReward: ALL_COLLECTIBLE_LIGHTS.clown_spark,
      },
      {
        id: 'ch5_opt2',
        text: {
          en: 'Smile softly: “It must get lonely holding court down here. We would love your company.”',
          fr: 'Sourire doucement : « Cela doit être bien solitaire de tenir audience ici. Nous serions ravis de votre compagnie. »',
        },
        nextSceneId: 'chapter5_res2',
        narrativeFlag: 'clown_honest',
        lightReward: ALL_COLLECTIBLE_LIGHTS.clown_spark,
      },
    ],
  },
  chapter5_res1: {
    id: 'chapter5_res1',
    speaker: 'clown',
    speakerName: { en: 'The Dark Clown', fr: 'Le Clown Sombre' },
    expression: 'abyss_surprised',
    location: 'velvet_abyss',
    sfx: 'clown_jingle',
    text: {
      en: 'The towering shadow entity tilted its corrupted hat, genuinely startled. Then a rich, theatrical laugh echoed from the void. “Well! If the royal procession insists on my distinguished company!”',
      fr: 'La gigantesque silhouette d’ombre inclina son haut-de-forme ténébreux, surprise. Puis un rire riche et théâtral résonna depuis le néant. « Eh bien ! Si le cortège royal exige ma distinguée compagnie ! »',
    },
    nextSceneId: 'chapter5_6',
  },
  chapter5_res2: {
    id: 'chapter5_res2',
    speaker: 'clown',
    speakerName: { en: 'The Dark Clown', fr: 'Le Clown Sombre' },
    expression: 'abyss_soft',
    location: 'velvet_abyss',
    text: {
      en: 'Deep within the dark violet-black sphere between his spindly shadow claws, the tiny golden ember pulsed with gentle warmth. “I suppose… a brief stroll wouldn’t ruin my terrible reputation.”',
      fr: 'Au cœur de la sphère d’un violet-noir tenue entre ses griffes d’ombre, la petite braise dorée pulsa d’une douce chaleur. « Je suppose… qu’une petite promenade ne ruinera pas ma terrible réputation. »',
    },
    nextSceneId: 'chapter5_6',
  },
  chapter5_6: {
    id: 'chapter5_6',
    speaker: 'narrator',
    location: 'velvet_abyss',
    text: {
      en: 'The monstrous shadow entity glided silently beside them, clutching the dark violet-black sphere. At its very center, a tiny fragment of golden starlight burned steady and pure.',
      fr: 'La monstrueuse entité d’ombre glissa silencieusement à leurs côtés, tenant la sphère violette et noire. En son centre même brûlait un éclat d’étoile pure et constante.',
    },
    nextSceneId: 'chapter5_7',
  },
  chapter5_7: {
    id: 'chapter5_7',
    speaker: 'clown',
    speakerName: { en: 'The Dark Clown', fr: 'Le Clown Sombre' },
    expression: 'abyss_soft',
    location: 'velvet_abyss',
    sfx: 'magic_surge',
    text: {
      en: '“You see, little witch,” his deep, supernatural voice murmured softly, “even an ancient void pockets a bit of starlight.”',
      fr: '« Tu vois, petite sorcière », murmura doucement sa voix surnaturelle, « même le vide ancestral finit par empocher un peu d’étoiles. »',
    },
    nextSceneId: 'chapter6_1',
  },

  // ==========================================
  // CHAPTER VI: THE SEA
  // ==========================================
  chapter6_1: {
    id: 'chapter6_1',
    isChapterStart: true,
    chapterTitle: {
      en: 'CHAPTER VI',
      fr: 'CHAPITRE VI',
    },
    chapterSubtitle: {
      en: 'The Sea',
      fr: 'La Mer',
    },
    speaker: 'narrator',
    location: 'sea_shore_dusk',
    weather: 'rain_ripples',
    music: 'sea',
    text: {
      en: 'Together, the three of them—Witch, Lezar, and the Dark Lord—emerged onto the great pebble beach of the Endless Sea.',
      fr: 'Ensemble, tous les trois—la Sorcière, Lezar et le Seigneur Sombre—débouchèrent sur la grande grève de galets de la Mer Infinie.',
    },
    nextSceneId: 'chapter6_2',
  },
  chapter6_2: {
    id: 'chapter6_2',
    speaker: 'narrator',
    location: 'sea_shore_dusk',
    weather: 'rain_ripples',
    text: {
      en: 'The vast horizon was completely dark. The waves lapped the stones in cold, quiet rhythm.',
      fr: 'Le vaste horizon était totalement obscur. Les vagues léchaient les pierres en un rythme froid et silencieux.',
    },
    nextSceneId: 'chapter6_3',
  },
  chapter6_3: {
    id: 'chapter6_3',
    speaker: 'witch',
    speakerName: { en: 'Super Witch', fr: 'Super Sorcière' },
    expression: 'burdened',
    location: 'sea_shore_dusk',
    weather: 'rain_ripples',
    zoom: 'close_up',
    text: {
      en: 'She looked down at her glowing lantern. If she held onto the Sun, the world would never see dawn again. But releasing it meant letting go of her own magical power.',
      fr: 'Elle regarda sa lanterne brillante. Si elle gardait le Soleil, le monde ne reverrait jamais l’aube. Mais le libérer signifiait renoncer à son propre pouvoir magique.',
    },
    nextSceneId: 'chapter6_4',
  },
  chapter6_4: {
    id: 'chapter6_4',
    speaker: 'lezar',
    speakerName: { en: 'Lezar', fr: 'Lezar' },
    expression: 'calm',
    location: 'sea_shore_dusk',
    weather: 'rain_ripples',
    text: {
      en: 'Lezar rested his flank against her ankle. His quiet warmth reminded her: helping others does not mean sacrificing yourself forever.',
      fr: 'Lezar appuya son flanc contre sa cheville. Sa douce chaleur lui rappelait : aider les autres ne signifie pas devoir se sacrifier pour toujours.',
    },
    nextSceneId: 'chapter7_1',
  },

  // ==========================================
  // CHAPTER VII: THE SUN RETURNS
  // ==========================================
  chapter7_1: {
    id: 'chapter7_1',
    isChapterStart: true,
    chapterTitle: {
      en: 'CHAPTER VII',
      fr: 'CHAPITRE VII',
    },
    chapterSubtitle: {
      en: 'The Sun Returns',
      fr: 'Le Retour du Soleil',
    },
    speaker: 'witch',
    speakerName: { en: 'Super Witch', fr: 'Super Sorcière' },
    expression: 'peaceful',
    location: 'sea_shore_dusk',
    weather: 'rain_ripples',
    zoom: 'close_up',
    sfx: 'magic_surge',
    text: {
      en: 'The witch opened the brass lantern and held out both hands. “Go home,” she whispered with a grateful smile.',
      fr: 'La sorcière ouvrit la lanterne de laiton et tendit les deux mains. « Rentre chez toi », chuchota-t-elle avec un sourire reconnaissant.',
    },
    nextSceneId: 'chapter7_2',
  },
  chapter7_2: {
    id: 'chapter7_2',
    speaker: 'narrator',
    location: 'sea_shore_sunrise',
    weather: 'sunlight_glints',
    music: 'sunrise',
    sfx: 'sunrise_chime',
    text: {
      en: 'The Sun rose into the sky! 🌅 Radiant golden light surged across the ocean waters, breaking the twilight and banishing the chill across the entire land.',
      fr: 'Le Soleil s’éleva dans le ciel ! 🌅 Une lumière dorée éclatante jaillit à la surface de l’océan, dissipant le crépuscule et chassant la fraîcheur sur toute la terre.',
    },
    nextSceneId: 'chapter7_3',
  },
  chapter7_3: {
    id: 'chapter7_3',
    speaker: 'narrator',
    location: 'sea_shore_sunrise',
    weather: 'sunlight_glints',
    sfx: 'magic_sparkle',
    text: {
      en: 'As the golden dawn restored the sky, a cascade of sparkling starlight and pastel petals swirled gracefully around her. Her pointy hat and heavy mantle dissolved in radiant morning glow, revealing Wendy in an enchanting wildflower-embroidered dress with a glowing princess-like poise.',
      fr: 'Alors que l’aube dorée restaurait le ciel, une cascade d’étincelles stellaires et de doux pétales tourbillonna avec grâce autour d’elle. Son chapeau pointu et son lourd manteau se dissipèrent dans la lueur matinale, révélant Wendy vêtue d’une ravissante robe brodée de fleurs sauvages avec une grâce féerique digne d’une princesse.',
    },
    nextSceneId: 'chapter7_4',
  },
  chapter7_4: {
    id: 'chapter7_4',
    speaker: 'human_witch',
    speakerName: { en: 'Wendy', fr: 'Wendy' },
    expression: 'peaceful',
    location: 'sea_shore_sunrise',
    weather: 'sunlight_glints',
    zoom: 'close_up',
    text: {
      en: 'She stood on the shore in the warm morning breeze, radiant and smiling softly. No heavy solitary burden. Just herself, light and free.',
      fr: 'Elle se tenait sur le rivage dans la douce brise du matin, rayonnante et souriant doucement. Plus de lourd fardeau solitaire. Rien qu’elle-même, légère et libre.',
    },
    nextSceneId: 'chapter8_1',
  },

  // ==========================================
  // CHAPTER VIII: THE LIGHT THEY RETURN
  // ==========================================
  chapter8_1: {
    id: 'chapter8_1',
    isChapterStart: true,
    chapterTitle: {
      en: 'CHAPTER VIII',
      fr: 'CHAPITRE VIII',
    },
    chapterSubtitle: {
      en: 'The Light They Return',
      fr: 'La Lumière Réciproque',
    },
    speaker: 'narrator',
    location: 'sea_shore_sunrise',
    weather: 'sunlight_glints',
    sfx: 'footstep',
    text: {
      en: 'Then… footsteps crunched upon the pebbles.',
      fr: 'Puis… des bruits de pas crépitèrent sur les galets.',
    },
    nextSceneId: 'chapter8_2',
  },
  chapter8_2: {
    id: 'chapter8_2',
    speaker: 'narrator',
    location: 'sea_shore_sunrise',
    weather: 'sunlight_glints',
    text: {
      en: 'One by one, the people and creatures she had helped along her journey appeared along the shore: Orik, Vivienne, forest sprites, and travelers.',
      fr: 'Un à un, les êtres et créatures qu’elle avait aidés apparurent sur le rivage : Orik, Vivienne, les esprits des bois et les voyageurs.',
    },
    nextSceneId: 'chapter8_3',
  },
  chapter8_3: {
    id: 'chapter8_3',
    speaker: 'narrator',
    location: 'sea_shore_sunrise',
    weather: 'sunlight_glints',
    text: {
      en: 'Each brought forward a small piece of light they had nurtured: verdant green, warm amber gold, azure mist, and pure crystalline white.',
      fr: 'Chacun apportait un éclat de lumière qu’il avait chéri : vert verdoyant, or ambré, brume azurée et blanc cristallin.',
    },
    nextSceneId: 'chapter8_3b',
  },
  chapter8_3b: {
    id: 'chapter8_3b',
    speaker: 'narrator',
    location: 'sea_shore_sunrise',
    weather: 'sunlight_glints',
    zoom: 'close_up',
    sfx: 'sunrise_chime',
    text: {
      en: 'As the warm golden sunrise washed over the shore, centuries of clinging abyssal shadows and black mist gently dissolved in a surge of celestial white light. His cracked porcelain mask and distorted void silhouette softened, revealing his true form: Mélo Clown, an eccentric, musical gentleman in a tailored midnight coat with deep violet velvet lapels, a tall top hat adorned with a golden music note, and a polished golden monocle.',
      fr: 'Alors que le lever de soleil doré baignait le rivage, les siècles d’ombres abyssales et de brumes noires se dissipèrent doucement dans un éclat de lumière blanche céleste. Son masque de porcelaine brisé et sa silhouette de néant s’adoucirent, révélant sa véritable forme : Mélo Clown, un gentleman mélomane et excentrique dans une redingote noire au col de velours violet, coiffé de son haut-de-forme orné d’une note de musique dorée et paré d’un monocle étincelant.',
    },
    nextSceneId: 'chapter8_4',
  },
  chapter8_4: {
    id: 'chapter8_4',
    speaker: 'clown',
    speakerName: { en: 'Mélo Clown', fr: 'Le Clown Mélo' },
    expression: 'gentleman_theatrical',
    location: 'sea_shore_sunrise',
    weather: 'sunlight_glints',
    zoom: 'close_up',
    text: {
      en: 'Mélo Clown stepped forward with an elegant theatrical flourish, presenting his black-gold violet spark. “You seem to be missing something.”',
      fr: 'Le Clown Mélo s’avança avec une élégante révérence théâtrale, lui tendant son étincelle or-noir et violette. « Il semblerait qu’il vous manque quelque chose. »',
    },
    nextSceneId: 'chapter8_5',
  },
  chapter8_5: {
    id: 'chapter8_5',
    speaker: 'human_witch',
    speakerName: { en: 'Wendy', fr: 'Wendy' },
    expression: 'surprised',
    location: 'sea_shore_sunrise',
    weather: 'sunlight_glints',
    zoom: 'close_up',
    text: {
      en: '“What?” she asked.',
      fr: '« Quoi donc ? » demanda-t-elle.',
    },
    nextSceneId: 'chapter8_6',
  },
  chapter8_6: {
    id: 'chapter8_6',
    speaker: 'clown',
    speakerName: { en: 'Mélo Clown', fr: 'Le Clown Mélo' },
    expression: 'gentleman_soft',
    location: 'sea_shore_sunrise',
    weather: 'sunlight_glints',
    zoom: 'extreme_close',
    sfx: 'magic_surge',
    text: {
      en: 'He placed the spark gently into her hands. “Your share.”',
      fr: 'Il déposa doucement l’étincelle dans ses mains. « Votre part. »',
    },
    nextSceneId: 'chapter8_7',
  },
  chapter8_7: {
    id: 'chapter8_7',
    speaker: 'narrator',
    location: 'sea_shore_sunrise',
    text: {
      en: 'She did not regain her old witchcraft. Instead, she understood the truth: she never needed to carry the sun alone. Light is something we keep alive together.',
      fr: 'Elle ne retrouva point son ancienne sorcellerie. Au lieu de cela, elle comprit la vérité : elle n’avait jamais eu besoin de porter le soleil toute seule. La lumière est ce que nous maintenons vivant ensemble.',
    },
    nextSceneId: 'chapter9_1',
  },

  // ==========================================
  // CHAPTER IX: THE MIRROR
  // ==========================================
  chapter9_1: {
    id: 'chapter9_1',
    isChapterStart: true,
    chapterTitle: {
      en: 'CHAPTER IX',
      fr: 'CHAPITRE IX',
    },
    chapterSubtitle: {
      en: 'The Mirror',
      fr: 'Le Miroir',
    },
    speaker: 'narrator',
    location: 'magic_mirror',
    music: 'cottage',
    sfx: 'glass_shimmer',
    text: {
      en: 'Beside the road back home stood the ancient enchanted mirror.',
      fr: 'Près du chemin du retour se dressait l’ancien miroir enchanté.',
    },
    nextSceneId: 'chapter9_2',
  },
  chapter9_2: {
    id: 'chapter9_2',
    speaker: 'narrator',
    location: 'magic_mirror',
    text: {
      en: 'At the start of her journey, the mirror had reflected a burdened witch carrying the weight of the sky.',
      fr: 'Au début de son voyage, le miroir reflétait une sorcière accablée portant le poids du ciel.',
    },
    nextSceneId: 'chapter9_3',
  },
  chapter9_3: {
    id: 'chapter9_3',
    speaker: 'human_witch',
    speakerName: { en: 'Wendy', fr: 'Wendy' },
    expression: 'gentle',
    location: 'magic_mirror',
    sfx: 'mirror_transform',
    text: {
      en: 'Now, she looked into the glass again. No pointy hat. No heavy lantern. Just herself, radiant, lighthearted, and at peace.',
      fr: 'Désormais, elle regarda à nouveau dans le verre. Plus de chapeau pointu. Plus de lourde lanterne. Rien qu’elle-même, rayonnante, légère et en paix.',
    },
    nextSceneId: 'chapter9_4',
  },
  chapter9_4: {
    id: 'chapter9_4',
    speaker: 'human_witch',
    speakerName: { en: 'Wendy', fr: 'Wendy' },
    expression: 'happy',
    location: 'magic_mirror',
    text: {
      en: 'She smiled at her reflection. “Let’s head inside, Lezar.”',
      fr: 'Elle sourit à son reflet. « Rentrons à la maison, Lezar. »',
    },
    nextSceneId: 'epilogue_1',
  },

  // ==========================================
  // EPILOGUE: THE BIRTHDAY SURPRISE!
  // ==========================================
  epilogue_1: {
    id: 'epilogue_1',
    isChapterStart: true,
    chapterTitle: {
      en: 'EPILOGUE',
      fr: 'ÉPILOGUE',
    },
    chapterSubtitle: {
      en: 'The Celebration',
      fr: 'La Fête',
    },
    speaker: 'narrator',
    location: 'birthday_feast',
    music: 'birthday',
    sfx: 'door_creak',
    text: {
      en: 'Thinking she was returning to an ordinary quiet evening, she pushed open the cottage door…',
      fr: 'Pensant retrouver une soirée ordinaire et tranquille, elle poussa la porte de la chaumière…',
    },
    nextSceneId: 'epilogue_2',
  },
  epilogue_2: {
    id: 'epilogue_2',
    speaker: 'everyone',
    speakerName: { en: 'Everyone', fr: 'Tout le Monde' },
    location: 'birthday_feast',
    sfx: 'party_horn',
    text: {
      en: '“SURPRISE! HAPPY BIRTHDAY!” 🎉',
      fr: '« SURPRISE ! JOYEUX ANNIVERSAIRE ! » 🎉',
    },
    nextSceneId: 'epilogue_3',
  },
  epilogue_3: {
    id: 'epilogue_3',
    speaker: 'human_witch',
    speakerName: { en: 'Wendy', fr: 'Wendy' },
    expression: 'surprised',
    location: 'birthday_feast',
    text: {
      en: '“…What’s this?!” she gasped, her eyes widening in pure delight.',
      fr: '« …Qu’est-ce que c’est que tout ça ?! » s’exclama-t-elle, les yeux écarquillés de joie.',
    },
    nextSceneId: 'epilogue_4',
  },
  epilogue_4: {
    id: 'epilogue_4',
    speaker: 'narrator',
    location: 'birthday_feast',
    sfx: 'cheer',
    text: {
      en: 'A grand feast filled the wooden table: golden croissants 🥐, fresh baguettes 🥖, artisan cheeses 🧀, fresh strawberries 🍓, warm crêpes 🥞, rainbow macarons 🍫, and steaming hot chocolate ☕🍫—with tiny festive French flags fluttering on the bunting!',
      fr: 'Un somptueux festin garnissait la table de bois : croissants dorés 🥐, baguettes fraîches 🥖, fromages affinés 🧀, fraises sucrées 🍓, crêpes chaudes 🥞, macarons multicolores 🍫 et chocolat chaud fumant ☕🍫—avec de petits drapeaux festifs flottant sur les guirlandes !',
    },
    nextSceneId: 'epilogue_5',
  },
  epilogue_5: {
    id: 'epilogue_5',
    speaker: 'clown',
    speakerName: { en: 'Mélo Clown', fr: 'Le Clown Mélo' },
    expression: 'holding_cake',
    location: 'birthday_feast',
    sfx: 'candle_flicker',
    text: {
      en: 'Mélo Clown stood proudly in the center, holding a strawberry-chocolate birthday cake with glowing candles as if entrusted with the most important mission of his cosmic life. “We have prepared a completely normal celebration.”',
      fr: 'Le Clown Mélo se tenait fièrement au centre, portant un gâteau d’anniversaire fraise-chocolat aux bougies allumées comme s’il accomplissait la mission la plus cruciale de sa vie cosmique. « Nous avons préparé une célébration parfaitement ordinaire. »',
    },
    nextSceneId: 'epilogue_6',
  },
  epilogue_6: {
    id: 'epilogue_6',
    speaker: 'lezar',
    speakerName: { en: 'Lezar', fr: 'Lezar' },
    expression: 'proud',
    location: 'birthday_feast',
    sfx: 'purr',
    text: {
      en: 'Lezar purred with immense satisfaction, flicking the tip of his tail.',
      fr: 'Lezar ronronna avec une immense satisfaction en remuant le bout de sa queue.',
    },
    nextSceneId: 'epilogue_7',
  },
  epilogue_7: {
    id: 'epilogue_7',
    speaker: 'human_witch',
    speakerName: { en: 'Wendy', fr: 'Wendy' },
    expression: 'happy',
    location: 'birthday_feast',
    text: {
      en: '“You made all of this?” Wendy laughed warmly.',
      fr: '« Vous avez préparé tout ça ? » rit chaleureusement Wendy.',
    },
    nextSceneId: 'epilogue_8',
  },
  epilogue_8: {
    id: 'epilogue_8',
    speaker: 'clown',
    speakerName: { en: 'Mélo Clown', fr: 'Le Clown Mélo' },
    expression: 'holding_cake',
    location: 'birthday_feast',
    text: {
      en: '“And before you ask… yes. The cat arranged most of it.”',
      fr: '« Et avant que vous ne demandiez… oui. Le chat a tout organisé. »',
    },
    nextSceneId: 'epilogue_9',
  },
  epilogue_9: {
    id: 'epilogue_9',
    speaker: 'lezar',
    speakerName: { en: 'Lezar', fr: 'Lezar' },
    expression: 'purring',
    location: 'birthday_feast',
    sfx: 'purr',
    text: {
      en: 'Lezar meowed gently and gave a knowing wink. ✨🐈',
      fr: 'Lezar miaula doucement avec un clin d’œil complice. ✨🐈',
    },
    nextSceneId: 'epilogue_10',
  },
  epilogue_10: {
    id: 'epilogue_10',
    speaker: 'human_witch',
    speakerName: { en: 'Wendy', fr: 'Wendy' },
    expression: 'thoughtful',
    secondaryCharacter: { id: 'lezar', expression: 'proud' },
    location: 'birthday_feast',
    text: {
      en: 'Wendy narrowed her eyes with affectionate suspicion. “Lezar? How did you secretly coordinate a whole banquet across the entire realm while pretending to nap in my satchel?”',
      fr: 'Wendy plissa les yeux avec une suspicion amusée et tendre. « Lezar ? Comment as-tu fait pour organiser secrètement un banquet à travers tout le royaume pendant que tu faisais semblant de dormir dans ma sacoche ? »',
    },
    nextSceneId: 'epilogue_11',
  },
  epilogue_11: {
    id: 'epilogue_11',
    speaker: 'lezar',
    speakerName: { en: 'Lezar', fr: 'Lezar' },
    expression: 'proud',
    secondaryCharacter: { id: 'human_witch', expression: 'happy' },
    location: 'birthday_feast',
    sfx: 'purr',
    text: {
      en: 'Lezar padded gracefully toward the banquet table, hopped onto a velvet stool, and sat with total feline innocence, as if merely an innocent fluffy observer.',
      fr: 'Lezar trottina gracieusement vers la table du banquet, sauta sur un tabouret de velours et s’assit avec une innocence féline totale, comme s’il n’était qu’un spectateur pelucheux.',
    },
    nextSceneId: 'epilogue_12',
  },
  epilogue_12: {
    id: 'epilogue_12',
    speaker: 'orik',
    speakerName: { en: 'Orik the Sprite', fr: 'Orik le Follet' },
    expression: 'happy',
    secondaryCharacter: { id: 'human_witch', expression: 'surprised' },
    location: 'birthday_feast',
    sfx: 'magic_surge',
    text: {
      en: 'Orik the Sprite hopped excitedly onto the table beside a bowl of sweet strawberries! “Wendy! We wanted to give back to you! You brought warmth to our frozen roots when we had nothing left. Look! I brought wild forest berries and blossom garlands!”',
      fr: 'Orik le Follet sautille d’excitation sur la table près d’un bol de fraises sucrées ! « Wendy ! Nous voulions te rendre la pareille ! Tu as réchauffé nos racines gelées quand nous n’avions plus rien. Regarde ! J’ai apporté des baies sauvages et des guirlandes de fleurs ! »',
    },
    nextSceneId: 'epilogue_13',
  },
  epilogue_13: {
    id: 'epilogue_13',
    speaker: 'artisan',
    speakerName: { en: 'Vivienne the Glassmaker', fr: 'Vivienne la Verrière' },
    expression: 'happy',
    secondaryCharacter: { id: 'human_witch', expression: 'gentle' },
    location: 'birthday_feast',
    sfx: 'ember_glow',
    text: {
      en: 'Vivienne stepped forward, adjusting her amber goggles with a beaming smile. “The kiln fire you rekindled has kept our canyon warm ever since. I baked fresh artisan baguettes and brought sweet honeyed crêpes. We all wanted to celebrate your special day!”',
      fr: 'Vivienne s’avança en ajustant ses lunettes d’ambre avec un sourire radieux. « Le feu du four que tu as ravivé a gardé tout notre canyon au chaud depuis lors. J’ai préparé des baguettes artisanales et des crêpes au miel. Nous voulions tous fêter ce grand jour avec toi ! »',
    },
    nextSceneId: 'epilogue_13b',
  },
  epilogue_13b: {
    id: 'epilogue_13b',
    speaker: 'hypo',
    speakerName: { en: 'Hypo the Hippo Plushie', fr: 'Hypo la Peluche Hippopotame' },
    expression: 'happy',
    secondaryCharacter: { id: 'human_witch', expression: 'happy' },
    location: 'birthday_feast',
    sfx: 'soft_bell',
    text: {
      en: 'Then, sweet Hypo the hippo plushie waddles forward, holding a super cozy neck pillow in his fluffy arms! “Squeak! Happy Birthday, Wendy! You carried the sun across cold ridges and dark seas, and you always took care of everyone around you… but you don’t have to carry anything alone ever again. Put on this soft pillow, take cozy naps, and remember: you can rest too!” 🦛💤💖',
      fr: 'Puis, la douce peluche hippopotame Hypo s’avance en se dandinant, serrant un oreiller de cou ultra-moelleux dans ses petits bras tout doux ! « Pouêt ! Joyeux Anniversaire Wendy ! Tu as porté le soleil par-delà les crêtes glacées et les mers sombres, et tu as toujours pris soin de tout le monde… mais tu n’as plus jamais à porter quoi que ce soit toute seule. Enfile ce coussin tout doux, fais de bonnes siestes douillettes, et souviens-toi : tu as le droit de te reposer toi aussi ! » 🦛💤💖',
    },
    nextSceneId: 'epilogue_13c',
  },
  epilogue_13c: {
    id: 'epilogue_13c',
    speaker: 'human_witch',
    speakerName: { en: 'Wendy', fr: 'Wendy' },
    expression: 'happy',
    secondaryCharacter: { id: 'hypo', expression: 'happy' },
    location: 'birthday_feast',
    text: {
      en: 'Wendy hugs Hypo gently against her cheek with a radiant smile. “Thank you, Hypo… it’s the coziest pillow in the world. I promise I will rest and take care of myself.”',
      fr: 'Wendy serre doucement Hypo contre sa joue avec un sourire radieux. « Merci, Hypo… c’est le coussin le plus douillet du monde. Je te promets que je vais me reposer et prendre soin de moi. »',
    },
    nextSceneId: 'epilogue_14',
  },
  epilogue_14: {
    id: 'epilogue_14',
    speaker: 'human_witch',
    speakerName: { en: 'Wendy', fr: 'Wendy' },
    expression: 'happy',
    secondaryCharacter: { id: 'everyone', expression: 'happy' },
    location: 'birthday_feast',
    text: {
      en: 'Wendy looked around the bright, sunlit room, her heart swelling with emotion. “You all came… from the deepest forest to the high canyon kiln…”',
      fr: 'Wendy regarda autour de la pièce lumineuse et ensoleillée, le cœur débordant d’émotion. « Vous êtes tous venus… de la forêt la plus profonde jusqu’aux hauts fourneaux du canyon… »',
    },
    nextSceneId: 'epilogue_15',
  },
  epilogue_15: {
    id: 'epilogue_15',
    speaker: 'clown',
    speakerName: { en: 'Mélo Clown', fr: 'Le Clown Mélo' },
    expression: 'holding_cake',
    secondaryCharacter: { id: 'human_witch', expression: 'happy' },
    location: 'birthday_feast',
    sfx: 'clown_jingle',
    text: {
      en: '“Naturally,” Mélo Clown declared with grand posture. “It is a strictly enforced cosmic decree that no sovereign witch should celebrate a birthday without fresh croissants, unhinged companionship, and an adequately dramatic feast. Furthermore, allow me to present this special gift.”',
      fr: '« Naturellement », déclara Le Clown Mélo avec une posture royale. « C’est un décret cosmique strict : aucune sorcière souveraine ne doit fêter son anniversaire sans croissants chauds, une compagnie dévouée et un festin convenablement dramatique. De plus, permettez-moi de vous offrir ce présent spécial. »',
    },
    nextSceneId: 'epilogue_15_pin',
  },
  epilogue_15_pin: {
    id: 'epilogue_15_pin',
    speaker: 'clown',
    speakerName: { en: 'Mélo Clown', fr: 'Le Clown Mélo' },
    expression: 'gentleman_theatrical',
    secondaryCharacter: { id: 'human_witch', expression: 'surprised' },
    location: 'birthday_feast',
    sfx: 'soft_bell',
    text: {
      en: 'From his midnight velvet coat, Mélo Clown retrieved a radiant golden enamel pin engraved with fine celestial runes: “SWW” — Super Witch Wendy.',
      fr: 'De son manteau de velours de minuit, le Clown Mélo sortit une broche étincelante en émail doré ornée de fines runes célestes : « SWW » — Super Sorcière Wendy.',
    },
    choices: [
      {
        id: 'epilogue_accept_pin',
        text: {
          en: 'Accept the golden "SWW" pin with a bright smile and pin it proudly to your dress.',
          fr: 'Accepter l’épingle dorée « SWW » avec un sourire radieux et l’accrocher fièrement à votre robe.',
        },
        nextSceneId: 'epilogue_16',
        narrativeFlag: 'sww_pin_equipped',
        lightReward: ALL_COLLECTIBLE_LIGHTS.sww_pin,
      },
    ],
  },
  epilogue_16: {
    id: 'epilogue_16',
    speaker: 'narrator',
    location: 'birthday_feast',
    sfx: 'starlight',
    text: {
      en: 'Mélo Clown raised his gloved hand. His strange black-gold and violet starlight hovered into the air, settling above the table to illuminate the pastries, flowers, and cheeses in a soft, enchanting celestial radiance.',
      fr: 'Le Clown Mélo leva sa main gantée. Son étrange étincelle d’or noir et violet s’éleva dans les airs, planant au-dessus de la table pour illuminer les pâtisseries, les fleurs et les fromages d’un éclat céleste doux et enchanteur.',
    },
    nextSceneId: 'epilogue_17',
  },
  epilogue_17: {
    id: 'epilogue_17',
    speaker: 'narrator',
    location: 'birthday_feast',
    sfx: 'ember_glow',
    text: {
      en: 'Wendy had spent her entire journey giving pieces of the sun away to everyone she met. And now, under the restored daylight, all of that warmth had returned to her—not as a heavy burden to carry alone, but as friendship, love, and shared light.',
      fr: 'Wendy avait passé tout son voyage à offrir des parcelles de soleil à chaque être croisé en chemin. Et maintenant, sous la clarté retrouvée du ciel, toute cette chaleur lui revenait—non comme un fardeau à porter seule, mais comme une constellation d’amitié, d’amour et de lumière partagée.',
    },
    nextSceneId: 'epilogue_18',
  },
  epilogue_18: {
    id: 'epilogue_18',
    speaker: 'everyone',
    speakerName: { en: 'Everyone', fr: 'Tout le Monde' },
    location: 'birthday_feast',
    sfx: 'party_horn',
    text: {
      en: '“Make a wish, Wendy!” everyone cheered together, raising cups of steaming hot chocolate! ☕🍫🎉',
      fr: '« Fais un vœu, Wendy ! » s’écrièrent-ils tous en chœur, levant leurs tasses de chocolat chaud fumant ! ☕🍫🎉',
    },
    nextSceneId: 'epilogue_19',
  },
  epilogue_19: {
    id: 'epilogue_19',
    speaker: 'human_witch',
    speakerName: { en: 'Wendy', fr: 'Wendy' },
    expression: 'happy',
    secondaryCharacter: { id: 'lezar', expression: 'purring' },
    location: 'birthday_feast',
    text: {
      en: 'Wendy looked at Lezar purring beside her, Mélo Clown holding the glowing cake, Orik waving his leafy arms, Vivienne smiling warmly, and sweet Hypo hugging her soft neck pillow. She smiled softly. “I don’t need to wish for anything… my wish is already standing right here with me.”',
      fr: 'Wendy regarda Lezar ronronner près d’elle, le Clown Mélo portant le gâteau illuminé, Orik agitant ses bras feuillus, Vivienne souriant chaleureusement et la douce Hypo serrant son coussin de cou. Elle sourit doucement. « Je n’ai besoin de rien souhaiter… mon vœu le plus cher est déjà réuni ici avec moi. »',
    },
    nextSceneId: 'epilogue_20',
  },
  epilogue_20: {
    id: 'epilogue_20',
    speaker: 'everyone',
    speakerName: { en: 'HAPPY BIRTHDAY, WENDY! ☀️🎂', fr: 'JOYEUX ANNIVERSAIRE, WENDY ! ☀️🎂' },
    location: 'birthday_feast',
    sfx: 'cheer',
    text: {
      en: 'Wendy blew out the glowing candles. A shower of golden birthday stardust, flower petals, and sweet laughter filled the warm cottage! ☀️🎂✨',
      fr: 'Wendy souffla sur les bougies étincelantes. Une pluie de poussière d’étoiles dorée, de pétales de fleurs et d’éclats de rire joyeux remplit la chaumière chaleureuse ! ☀️🎂✨',
    },
    nextSceneId: 'epilogue_21',
  },
  epilogue_21: {
    id: 'epilogue_21',
    speaker: 'narrator',
    location: 'birthday_feast',
    sfx: 'starlight',
    text: {
      en: 'The Sun shone brightly in the morning sky. And Wendy, peaceful and surrounded by those who cherished her, knew that she would never have to walk alone again.',
      fr: 'Le Soleil brillait de mille feux dans le ciel du matin. Et Wendy, sereine et entourée de ceux qui lui sont chers, savait qu’elle n’aurait plus jamais à marcher seule.',
    },
    nextSceneId: 'epilogue_22_melo',
  },
  epilogue_22_melo: {
    id: 'epilogue_22_melo',
    speaker: 'clown',
    speakerName: { en: 'Mélo Clown', fr: 'Le Clown Mélo' },
    expression: 'gentleman_theatrical',
    location: 'birthday_feast',
    sfx: 'clown_jingle',
    text: {
      en: 'Mélo Clown steps close to the front of the stage, adjusting his golden monocle with a sincere, heartfelt smile directly to you… “Happy Birthday lodi, Wendy! I hope you’ll have a wonderful day today! Take care always, partenaire.” 🎂✨',
      fr: 'Le Clown Mélo s’approche au tout premier plan, ajustant son monocle doré avec un sourire sincère et chaleureux qui s’adresse directement à vous… « Joyeux Anniversaire lodi, Wendy ! J’espère que tu passeras une merveilleuse journée aujourd’hui ! Prends bien soin de toi, partenaire. » 🎂✨',
    },
    nextSceneId: 'epilogue_23_melo_wave',
  },
  epilogue_23_melo_wave: {
    id: 'epilogue_23_melo_wave',
    speaker: 'clown',
    speakerName: { en: 'Mélo Clown', fr: 'Le Clown Mélo' },
    expression: 'waving',
    location: 'birthday_feast',
    sfx: 'magic_surge',
    text: {
      en: 'Mélo Clown tips his tall top hat and waves warmly as swirling violet-gold starlight and sweet sparkling confetti gently dance through the room, taking us to our final storybook pages… ✨🪄👋',
      fr: 'Le Clown Mélo incline son haut-de-forme et vous salue tendrement de la main tandis qu’un tourbillon d’étoiles violettes et dorées emplit la pièce, nous guidant vers les dernières pages du grimoire… ✨🪄👋',
    },
    nextSceneId: 'epilogue_screen',
  },
  epilogue_screen: {
    id: 'epilogue_screen',
    speaker: 'narrator',
    speakerName: { en: 'The Chronicle', fr: 'La Chronique' },
    location: 'birthday_feast',
    chapterTitle: { en: 'EPILOGUE', fr: 'ÉPILOGUE' },
    chapterSubtitle: { en: 'The Eternal Feast of Light', fr: 'Le Festin Éternel de Lumière' },
    isChapterStart: false,
    text: {
      en: 'Happy Birthday, Wendy! May your journey forward shine bright with love, companionship, and shared warmth.',
      fr: 'Joyeux Anniversaire, Wendy ! Que ta route soit toujours illuminée d’amour, de tendre compagnie et de chaleur partagée.',
    },
  },
};
