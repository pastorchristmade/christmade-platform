// src/data/sermonTemplates.ts
// ═══════════════════════════════════════════════════════════
// SERMON TEMPLATES LIBRARY
// 8 pre-built sermon structures to inspire pastors
// ═══════════════════════════════════════════════════════════

export interface SermonTemplate {
  id: string
  name: string
  description: string
  icon: string
  color: string
  estimatedTime: string
  theme: string
  introduction: string
  mainPoints: { title: string; content: string }[]
  conclusion: string
  tags: string[]
}

export const SERMON_TEMPLATES: SermonTemplate[] = [
  // ─────────────────────────────────────────────────────────
  // 1. 3-POINT EXPOSITORY
  // ─────────────────────────────────────────────────────────
  {
    id: 'three_point_expository',
    name: '3-Point Expository',
    description: 'Classic verse-by-verse teaching with three clear points',
    icon: '📜',
    color: 'from-blue-500 to-indigo-700',
    estimatedTime: '30-40 min',
    theme: '',
    introduction:
      'Begin with a powerful hook — a question, a story, or a striking statement that grabs attention. State your main scripture clearly. Provide the historical and biblical context. Then declare the BIG IDEA that the congregation will walk away with today.',
    mainPoints: [
      {
        title: 'Point 1: [State your first point clearly]',
        content:
          '↳ Scripture Support: [Add the verses that prove this point]\n↳ Explanation: [Unpack the meaning — what is God saying here?]\n↳ Illustration: [Share a story, example, or analogy]\n↳ Application: [How does this apply to our lives this week?]',
      },
      {
        title: 'Point 2: [State your second point clearly]',
        content:
          '↳ Scripture Support: [Add the verses that prove this point]\n↳ Explanation: [Unpack the meaning — what is God saying here?]\n↳ Illustration: [Share a story, example, or analogy]\n↳ Application: [How does this apply to our lives this week?]',
      },
      {
        title: 'Point 3: [State your third point clearly]',
        content:
          '↳ Scripture Support: [Add the verses that prove this point]\n↳ Explanation: [Unpack the meaning — what is God saying here?]\n↳ Illustration: [Share a story, example, or analogy]\n↳ Application: [How does this apply to our lives this week?]',
      },
    ],
    conclusion:
      'Summarize the three main points briefly. Bring it back to the BIG IDEA. End with a clear CALL TO ACTION: What should the listener DO this week as a result of God\'s word today? Close with a prayer that activates the message in their hearts.',
    tags: ['expository', 'teaching'],
  },

  // ─────────────────────────────────────────────────────────
  // 2. TOPICAL SERMON
  // ─────────────────────────────────────────────────────────
  {
    id: 'topical',
    name: 'Topical Sermon',
    description: 'Focused message on a specific theme or life topic',
    icon: '🎯',
    color: 'from-purple-500 to-pink-600',
    estimatedTime: '25-35 min',
    theme: '[State the topic — e.g., Forgiveness, Marriage, Faith]',
    introduction:
      'Open with why this topic MATTERS today. Use a current event, statistic, or personal story that shows the relevance. Ask: "Why should we care about [topic]?" Let them feel the weight before you bring the Word.',
    mainPoints: [
      {
        title: 'What does God\'s Word say about this?',
        content:
          'Anchor scripture: [Add main verse]\n↳ Define the topic biblically\n↳ Reference 2-3 supporting passages\n↳ What is God\'s heart on this matter?',
      },
      {
        title: 'Why is this important for us?',
        content:
          '↳ Share real-life examples (your own or others)\n↳ Explain the consequences of ignoring this truth\n↳ Show the blessing of obeying this truth\n↳ Connect to common struggles people face',
      },
      {
        title: 'How do we apply this?',
        content:
          '↳ Practical step 1: [Specific action]\n↳ Practical step 2: [Specific action]\n↳ Practical step 3: [Specific action]\n↳ What changes start this week?',
      },
    ],
    conclusion:
      'Re-state the topic. Remind them of God\'s heart. Call them to a decision — not just to feel inspired but to take ACTION. Close with prayer of empowerment and commitment.',
    tags: ['topical', 'practical'],
  },

  // ─────────────────────────────────────────────────────────
  // 3. EASTER SUNDAY
  // ─────────────────────────────────────────────────────────
  {
    id: 'easter',
    name: 'Easter Sunday',
    description: 'Celebrating the resurrection of Jesus Christ',
    icon: '✝️',
    color: 'from-yellow-400 to-orange-500',
    estimatedTime: '30-40 min',
    theme: 'The Resurrection Power of Jesus Christ',
    introduction:
      'Welcome everyone — especially visitors and family members who only come on Easter. Set the atmosphere: this is the most important day in human history. Without the resurrection, our faith is in vain (1 Cor 15:14). But Christ IS risen! Hallelujah! Today we will see what the resurrection means for YOUR life.',
    mainPoints: [
      {
        title: 'The Resurrection is REAL (Historical Truth)',
        content:
          'Scripture: Matthew 28, Luke 24, John 20, 1 Corinthians 15\n↳ Eyewitness accounts: over 500 people saw the risen Christ\n↳ The empty tomb evidence\n↳ The transformation of the disciples — cowards became martyrs\n↳ The birth of the church proves it really happened',
      },
      {
        title: 'The Resurrection brings VICTORY (Spiritual Power)',
        content:
          'Scripture: Romans 6:4-5, Ephesians 1:19-20\n↳ Victory over sin — the chains are broken\n↳ Victory over death — death has lost its sting\n↳ Victory over the enemy — Satan is defeated\n↳ The same power that raised Christ is at work in YOU',
      },
      {
        title: 'The Resurrection demands a RESPONSE (Personal Decision)',
        content:
          'Scripture: Romans 10:9-10\n↳ Will you receive this risen Christ today?\n↳ Will you live in resurrection power?\n↳ Will you tell others He is alive?\n↳ Call to salvation for those who do not know Him',
      },
    ],
    conclusion:
      'The tomb is empty. Jesus is alive. Death could not hold Him. And because He lives, YOU can face tomorrow! Extend a strong altar call — invite those who want to receive Christ, recommit, or experience His resurrection power. Close with celebration and worship.',
    tags: ['easter', 'resurrection', 'salvation'],
  },

  // ─────────────────────────────────────────────────────────
  // 4. CHRISTMAS SERMON
  // ─────────────────────────────────────────────────────────
  {
    id: 'christmas',
    name: 'Christmas Sermon',
    description: 'Celebrating the birth of our Savior',
    icon: '🎄',
    color: 'from-red-500 to-green-600',
    estimatedTime: '25-35 min',
    theme: 'The Gift of God — Emmanuel, God With Us',
    introduction:
      'Christmas. The world celebrates with lights, trees, and gifts. But what is the real gift? 2000 years ago, God broke into human history through a baby in a manger. Tonight/Today, let us look past the wrapping paper and see the REAL gift — Jesus Christ.',
    mainPoints: [
      {
        title: 'The PROMISE of His Coming',
        content:
          'Scripture: Isaiah 7:14, Isaiah 9:6, Micah 5:2\n↳ God promised a Savior 700+ years before Jesus was born\n↳ God always keeps His promises\n↳ The prophecies fulfilled exactly\n↳ What God promised YOU, He will also fulfill',
      },
      {
        title: 'The PERSON of Christ',
        content:
          'Scripture: Luke 2:1-20, John 1:14\n↳ Fully God, fully man — Emmanuel (God with us)\n↳ Born in humble circumstances — a stable, a manger\n↳ Announced first to shepherds — God values the lowly\n↳ He came for ALL people — Jew and Gentile, rich and poor',
      },
      {
        title: 'The PURPOSE of His Birth',
        content:
          'Scripture: Matthew 1:21, Luke 19:10\n↳ He came to SAVE us from our sins\n↳ He came to REVEAL the Father to us\n↳ He came to DESTROY the works of the devil (1 John 3:8)\n↳ He came so we could have eternal life',
      },
    ],
    conclusion:
      'This Christmas, do not just receive gifts — receive the Gift. Jesus came FOR you. The greatest response to Christmas is to open your heart and receive Him. Call to commitment, family prayer, or carol of celebration.',
    tags: ['christmas', 'incarnation', 'salvation'],
  },

  // ─────────────────────────────────────────────────────────
  // 5. WEDDING CEREMONY
  // ─────────────────────────────────────────────────────────
  {
    id: 'wedding',
    name: 'Wedding Ceremony',
    description: 'Joining two hearts in holy matrimony before God',
    icon: '👰',
    color: 'from-pink-400 to-rose-600',
    estimatedTime: '15-20 min',
    theme: 'A Three-Strand Cord — God, Husband, and Wife',
    introduction:
      'Dearly beloved, we are gathered here today in the presence of God and these witnesses to join [Bride] and [Groom] in holy matrimony. Marriage is honourable in all (Hebrews 13:4). It was God\'s first institution — established in the Garden of Eden. Today, two become one before His face.',
    mainPoints: [
      {
        title: 'Marriage is a COVENANT, not a Contract',
        content:
          'Scripture: Malachi 2:14, Genesis 2:24\n↳ A contract is based on conditions; a covenant is based on commitment\n↳ "For better or worse" — this is the heart of covenant\n↳ God Himself is a witness to this covenant\n↳ What God joins, let no man separate',
      },
      {
        title: 'Marriage requires GOD at the center',
        content:
          'Scripture: Ecclesiastes 4:12\n↳ A cord of three strands is not easily broken\n↳ When God is at the center, the marriage stands\n↳ Pray together, worship together, grow together\n↳ Make God your first love so you can rightly love each other',
      },
      {
        title: 'Marriage reflects CHRIST and the Church',
        content:
          'Scripture: Ephesians 5:22-33\n↳ Husband — love your wife as Christ loved the church (sacrificially)\n↳ Wife — respect and honor your husband\n↳ Mutual submission, mutual love, mutual honor\n↳ Your marriage tells the world about God\'s love',
      },
    ],
    conclusion:
      'And now, [Bride] and [Groom], you will exchange your vows before God and these witnesses... [Proceed with vows, exchange of rings, declaration, and pronouncement]. By the authority given to me as a minister of the Gospel, I now pronounce you husband and wife. What God has joined, let no man separate. You may now kiss your bride.',
    tags: ['wedding', 'marriage', 'covenant'],
  },

  // ─────────────────────────────────────────────────────────
  // 6. FUNERAL SERVICE
  // ─────────────────────────────────────────────────────────
  {
    id: 'funeral',
    name: 'Funeral Service',
    description: 'Honoring a life and comforting the bereaved with hope',
    icon: '⚰️',
    color: 'from-gray-500 to-slate-700',
    estimatedTime: '20-30 min',
    theme: 'Hope in the Midst of Sorrow',
    introduction:
      'We gather today to remember and celebrate the life of [Name]. We come with hearts heavy with grief, but not without hope. Today is a day to honor a life lived, to mourn a loss deeply felt, and to find comfort in the eternal promises of God.',
    mainPoints: [
      {
        title: 'We Honor the LIFE They Lived',
        content:
          '↳ Share brief biography and meaningful memories\n↳ Highlight their faith journey (if applicable)\n↳ Recognize their impact on family, friends, and community\n↳ Read tributes from loved ones if available',
      },
      {
        title: 'We Acknowledge Our GRIEF',
        content:
          'Scripture: John 11:35, Psalm 34:18\n↳ Jesus wept — it is okay to grieve\n↳ God is near to the brokenhearted\n↳ Grief is the price we pay for love\n↳ It is right to mourn, but not as those without hope (1 Thess 4:13)',
      },
      {
        title: 'We Stand on the HOPE of Eternal Life',
        content:
          'Scripture: John 14:1-3, 1 Corinthians 15:55-57, Revelation 21:4\n↳ Death is not the end for those in Christ\n↳ Jesus has prepared a place for us\n↳ One day, God will wipe every tear away\n↳ For those who believe — to be absent from the body is to be present with the Lord',
      },
    ],
    conclusion:
      'To the family — you are not alone. The Lord walks with you through this valley. To everyone here — life is a vapor (James 4:14). Be ready. Make peace with God today. [Close with prayer for the family, prayer for salvation of any present, and committal/benediction].',
    tags: ['funeral', 'memorial', 'comfort'],
  },

  // ─────────────────────────────────────────────────────────
  // 7. REVIVAL / ALTAR CALL
  // ─────────────────────────────────────────────────────────
  {
    id: 'revival',
    name: 'Revival / Altar Call',
    description: 'Powerful evangelistic message calling people to salvation',
    icon: '🔥',
    color: 'from-orange-500 to-red-600',
    estimatedTime: '35-45 min',
    theme: 'It Is Time to Come Home',
    introduction:
      'Tonight is a divine appointment. God has brought you here for a reason. Some of you have been running from God — tonight is your night to come home. Some of you are cold in your faith — tonight is your night to be set on fire. The Spirit of God is moving. Will you respond?',
    mainPoints: [
      {
        title: 'The CONDITION — All Have Sinned',
        content:
          'Scripture: Romans 3:23, Isaiah 59:2\n↳ Every person has missed God\'s mark\n↳ Sin has separated us from a holy God\n↳ No good works can earn our way back\n↳ We are all in the same boat — we need a Savior',
      },
      {
        title: 'The CROSS — Jesus Paid It All',
        content:
          'Scripture: Romans 5:8, John 3:16, 1 Peter 2:24\n↳ God so loved you that He gave His Son\n↳ Jesus took your punishment on the cross\n↳ His blood washes away every sin\n↳ He rose again — death could not hold Him',
      },
      {
        title: 'The CALL — Will You Respond?',
        content:
          'Scripture: Romans 10:9-10, Revelation 3:20\n↳ Salvation is a free gift — receive it\n↳ Confess Jesus as Lord with your mouth\n↳ Believe in your heart that God raised Him from the dead\n↳ Today is the day of salvation — do not delay',
      },
    ],
    conclusion:
      'The altar is open. The Spirit is calling. If you want to give your life to Christ tonight, come forward. If you want to rededicate your life, come. If you need healing, deliverance, or breakthrough, come. Do not leave this place the same way you came. [Extend the altar call, pray for those who respond, give them next steps].',
    tags: ['evangelism', 'salvation', 'revival', 'altar call'],
  },

  // ─────────────────────────────────────────────────────────
  // 8. PRAYER MEETING
  // ─────────────────────────────────────────────────────────
  {
    id: 'prayer_meeting',
    name: 'Prayer Meeting',
    description: 'Short, focused message to launch a powerful prayer service',
    icon: '🙏',
    color: 'from-teal-500 to-emerald-700',
    estimatedTime: '15-20 min',
    theme: 'The Power of United Prayer',
    introduction:
      'Welcome to the prayer meeting! Tonight is not a teaching night — it is a fighting night. We come not to be entertained but to seek the face of God. Heaven moves when His people pray. Let us take this short moment to be stirred, then we will pray until something happens.',
    mainPoints: [
      {
        title: 'God is LISTENING when we pray',
        content:
          'Scripture: 1 John 5:14-15, Jeremiah 33:3\n↳ Our prayers do not bounce off the ceiling\n↳ God hears every cry, every whisper\n↳ Call upon Him and He will show you great things\n↳ Pray with confidence, not hesitation',
      },
      {
        title: 'God MOVES when we pray together',
        content:
          'Scripture: Matthew 18:19-20, Acts 1:14, Acts 4:31\n↳ Where two or three are gathered, He is there\n↳ The early church prayed — the place was shaken\n↳ Unity in prayer multiplies power\n↳ Tonight let us agree as one — heaven will respond',
      },
    ],
    conclusion:
      'Enough talking — let us pray! Tonight we will pray for [list specific prayer points: revival, the nation, families, the sick, breakthroughs, etc.]. Get into your prayer posture. Let the Holy Spirit lead. Pray until you break through. [Transition into corporate prayer time].',
    tags: ['prayer', 'intercession', 'midweek'],
  },
]

// ─── Helper to find a template by ID ───
export const getTemplateById = (id: string): SermonTemplate | undefined => {
  return SERMON_TEMPLATES.find((t) => t.id === id)
}