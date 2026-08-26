import type { Lesson } from './lessonTypes';

/** LONG-TERM COURSE — 18 lessons. Staying well, and what to do when it returns. */
export const LONG_COURSE_LESSONS: Lesson[] = [
  {
    id: 'l1',
    title: 'What relapse actually looks like',
    blurb: 'Rarely a collapse. Usually a slow narrowing.',
    minutes: 4,
    mo: 'listening',
    blocks: [
      {
        type: 'p',
        text: 'People expect a return of depression to announce itself. In practice it usually starts as a narrowing: one thing dropped, then another, all with reasonable explanations attached. You are tired this week. Work is busy. You will call them back at the weekend.',
      },
      {
        type: 'p',
        text: 'By the time low mood is obvious, the narrowing has often been running for two or three weeks. This is good news, because a narrowing is visible from the outside long before it is felt from the inside — if you know what your own version looks like.',
      },
      { type: 'pull', text: 'Behaviour changes first. Mood is the lagging indicator.' },
      { type: 'h', text: 'Common early signs' },
      {
        type: 'list',
        items: [
          'Cancelling things you had wanted to go to, with a plausible reason each time.',
          'Sleep moving — later to bed, later up, or waking early again.',
          'The phone becoming a place to hide rather than a way to reach anyone.',
          'Small maintenance slipping: post unopened, dishes stacking, laundry cycling through the same three items.',
          'Irritability, which for many people arrives before sadness does.',
        ],
      },
      {
        type: 'try',
        text: 'Think back to the last time things slid. What was the first thing that quietly stopped?',
      },
    ],
    takeaway: 'Relapse starts as behaviour narrowing, weeks before mood makes it obvious.',
  },
  {
    id: 'l2',
    title: 'Your relapse signature',
    blurb: 'Yours is specific, repeatable, and worth writing down.',
    minutes: 5,
    mo: 'listening',
    blocks: [
      {
        type: 'p',
        text: 'Depression tends to run the same script in the same person. The same thing goes first, the same thoughts arrive in the same order, the same hour of the day gets worst. That repeatability is the most useful thing you own.',
      },
      { type: 'h', text: 'Build it from the last episode' },
      {
        type: 'list',
        items: [
          'What was the first thing to go? Not the biggest — the first.',
          'What did your sleep do, and in which direction?',
          'Which thought showed up early? Most people have a signature sentence.',
          'What did other people notice, and what did they say? Ask them; their version is often earlier than yours.',
          'What was the last thing to go? That is your floor, and it is worth defending.',
        ],
      },
      { type: 'pull', text: 'Write it while you are well. It cannot be written from inside an episode.' },
      { type: 'h', text: 'Keep it concrete' },
      {
        type: 'p',
        text: 'A signature that says "I feel worse" is no use. One that says "I stop answering my sister, I start going to bed at two, and I begin thinking that everyone is being polite rather than genuine" is an early-warning system.',
      },
      {
        type: 'try',
        text: 'Write your five signature items into the Anchr under warning signs. Use plain, specific language.',
      },
    ],
    takeaway: 'Your episode has a repeating script. Write it down while you can see it.',
  },
  {
    id: 'l3',
    title: 'The early-warning list',
    blurb: 'From signature to something you can act on.',
    minutes: 4,
    mo: 'warm',
    blocks: [
      {
        type: 'p',
        text: 'A warning sign is only useful if something is attached to it. The list should read as pairs: when I notice this, I do that. Decided in advance, because the moment you notice is the moment your judgement is least available.',
      },
      { type: 'h', text: 'Three tiers' },
      {
        type: 'list',
        items: [
          'Amber: one or two signs, a fortnight or less. Response — reinstate the basics. Wake time, daylight, one connection a day, one lift a day.',
          'Orange: several signs, or the same one for a month. Response — tell one person, book a GP or therapist appointment, drop non-essential commitments deliberately rather than by collapse.',
          'Red: safety is affected, or you cannot function at work or at home. Response — the Anchr, professional contact this week, not "if it carries on".',
        ],
      },
      { type: 'pull', text: 'Decide the responses now. Later-you will not want to decide anything.' },
      {
        type: 'p',
        text: 'One more thing worth writing: who checks. Many people cannot see amber in themselves. Naming one person who is allowed to say "you have gone quiet again" is the cheapest safeguard there is.',
      },
      {
        type: 'try',
        text: 'Turn each warning sign into a pair. Put the pairs in the Anchr where you will find them.',
      },
    ],
    takeaway: 'Pair every warning sign with a decided response, and name who checks.',
  },
  {
    id: 'l4',
    title: 'A low week or an episode?',
    blurb: 'Telling weather from climate.',
    minutes: 4,
    mo: 'listening',
    blocks: [
      {
        type: 'p',
        text: 'Not every dip is a relapse, and treating every dip as one is its own problem — it makes ordinary bad weeks frightening, and fear of relapse is itself a risk factor.',
      },
      { type: 'h', text: 'What tends to distinguish them' },
      {
        type: 'list',
        items: [
          'Duration. A low week responds to a weekend, sleep, or the thing that caused it passing. Two solid weeks with no lift is a different category.',
          'Breadth. A low week affects mood. An episode affects sleep, appetite, concentration, movement and interest as well.',
          'Function. Can you still do the things you have to do, even badly? When function goes, take it seriously.',
          'Response to action. In a low week, doing something usually helps within the day. In an episode, the same action produces very little for a long time — and still needs doing.',
        ],
      },
      { type: 'pull', text: 'Two weeks, most of the day, most days, with function affected. That is the line worth using.' },
      {
        type: 'p',
        text: 'Lumo does not diagnose and neither should you. What this distinction is for is deciding whether to ride it out or to pick up the phone.',
      },
      {
        type: 'try',
        text: 'Look at your last 90 days in Progress. Dips and troughs look different on a chart than they do in memory.',
      },
    ],
    takeaway: 'Duration, breadth, function. Those three decide whether to escalate.',
  },
  {
    id: 'l5',
    title: 'The first seventy-two hours of a dip',
    blurb: 'What you do early has more leverage than anything later.',
    minutes: 4,
    mo: 'warm',
    blocks: [
      {
        type: 'p',
        text: 'Early in a dip you still have some capacity, and the habits are still partly intact. That combination does not last. Anything you can do in the first three days is worth roughly a week of the same effort later.',
      },
      { type: 'h', text: 'The three-day protocol' },
      {
        type: 'list',
        items: [
          'Protect the wake time above everything else. If sleep slides, the dip accelerates.',
          'Do not cancel the next social thing. Shorten it instead. Cancelling is the accelerant.',
          'Add daylight in the morning. Ten minutes, outside, even in cloud.',
          'One lift a day, at the smallest useful size. Do not attempt a heroic week.',
          'Tell one person, in one sentence, with no request attached.',
          'Cut alcohol for the duration. It is the single fastest way to turn three bad days into three bad weeks.',
        ],
      },
      { type: 'pull', text: 'Shorten commitments. Do not delete them.' },
      {
        type: 'try',
        text: 'Write these six as a note you can find fast. When you need them you will not want to search.',
      },
    ],
    takeaway: 'Move early and small. Early effort is worth several times late effort.',
  },
  {
    id: 'l6',
    title: 'Maintaining gains when you feel well',
    blurb: 'The most common mistake in recovery.',
    minutes: 4,
    mo: 'proud',
    blocks: [
      {
        type: 'p',
        text: 'When things improve, the tools get dropped. This is entirely understandable — they were effortful and they were associated with a bad period — but it is the most reliable route back.',
      },
      {
        type: 'p',
        text: 'The other version is subtler: as mood improves, people take on far more than they were doing before, on the grounds that they are behind. A month of overcommitment ends in exhaustion, and exhaustion looks a great deal like the start of an episode.',
      },
      { type: 'pull', text: 'Recovery is not the same as capacity. Capacity returns more slowly.' },
      { type: 'h', text: 'What to keep' },
      {
        type: 'list',
        items: [
          'The wake time. Cheap, high value, keep it indefinitely.',
          'One weekly check-in, even when things are fine, so the chart has a baseline to compare against.',
          'Two or three activities in your floor set, permanently.',
          'The Anchr, reviewed twice a year. Contacts change.',
        ],
      },
      {
        type: 'try',
        text: 'Decide today what you will keep doing when you no longer need it. Write it down; the decision will be harder later.',
      },
    ],
    takeaway: 'Keep a small maintenance set forever, and add capacity back slowly.',
  },
  {
    id: 'l7',
    title: 'Your floor set',
    blurb: 'The two or three things that hold regardless.',
    minutes: 3,
    mo: 'resting',
    blocks: [
      {
        type: 'p',
        text: 'A floor set is the minimum you keep doing in the worst week you have. It is not a goal and it is not a routine. It is a floor — the thing that stops the fall being unlimited.',
      },
      { type: 'h', text: 'Rules for choosing' },
      {
        type: 'list',
        items: [
          'Three items maximum. More is not a floor, it is a plan.',
          'Each must be possible on your worst day, in bed, with no preparation.',
          'Each must be checkable in a second. "Eat better" is not; "drink one glass of water" is.',
          'Include medication if you take it. Stopping unilaterally is a common and avoidable trigger — any change belongs in a conversation with the prescriber.',
        ],
      },
      { type: 'pull', text: 'The floor is not what good looks like. It is what stops the drop.' },
      {
        type: 'try',
        text: 'Write your three now and put them in the Anchr. Then do one of them today, even though today is fine.',
      },
    ],
    takeaway: 'Three tiny non-negotiables, possible on the worst day.',
  },
  {
    id: 'l8',
    title: 'Sleep over the long run',
    blurb: 'The one that keeps mattering.',
    minutes: 4,
    mo: 'resting',
    blocks: [
      {
        type: 'p',
        text: 'Persistent insomnia roughly doubles the risk of a future depressive episode, and residual sleep problems after an episode are one of the better predictors of relapse. That makes long-term sleep one of the highest-value things to protect, and one of the easiest to let slide once mood improves.',
      },
      { type: 'h', text: 'What holds up over years' },
      {
        type: 'list',
        items: [
          'A stable wake time. Still the lever, still the thing to hold on weekends.',
          'Morning light, daily. It matters more in winter and at higher latitudes.',
          'Bed for sleep. If the bed becomes the place you scroll, worry and wait, it stops working as a sleep cue.',
          'A wind-down that is dull rather than pleasant. The purpose is deceleration, not reward.',
        ],
      },
      { type: 'h', text: 'When it is properly broken' },
      {
        type: 'p',
        text: 'For long-running insomnia, CBT-I is the first-line treatment and works better than sleeping tablets over any horizon longer than a few weeks. It is available as a structured programme through many health services and as self-guided courses. If sleep is the main problem, treat sleep as the main problem.',
      },
      {
        type: 'try',
        text: 'Check your wake time over the last week. If it varies by more than about ninety minutes, that is the thing to fix first.',
      },
    ],
    takeaway: 'Protect sleep for the long term; treat persistent insomnia directly.',
  },
  {
    id: 'l9',
    title: 'Alcohol and the two-day tax',
    blurb: 'Neutral information, no lecture.',
    minutes: 3,
    mo: 'listening',
    blocks: [
      {
        type: 'p',
        text: 'Alcohol is a depressant, it fragments the second half of the night, and it lowers mood for one to two days afterwards in most people. In a low period, that means an evening of relief costs a day and a half of worse.',
      },
      {
        type: 'p',
        text: 'This is not a moral point and it is not an instruction to stop. It is a piece of accounting that is easy to miss, because the bill arrives far enough after the drink for the connection to go unnoticed.',
      },
      { type: 'pull', text: 'The relief is immediate. The cost is on Thursday.' },
      {
        type: 'p',
        text: 'If you want to test it rather than take anyone’s word: log it as a context chip in your check-ins for a month and look at the chart. The pattern is usually visible, and your own data is more persuasive than advice.',
      },
      {
        type: 'try',
        text: 'Add drinking as a context chip when it applies. Look at the two days after, not the day itself.',
      },
    ],
    takeaway: 'Check the two days after, not the evening itself.',
  },
  {
    id: 'l10',
    title: 'Work: pacing and disclosure',
    blurb: 'What to say, to whom, and how much.',
    minutes: 5,
    mo: 'listening',
    blocks: [
      {
        type: 'p',
        text: 'Two separate questions get tangled here. One is how to keep working while unwell. The other is who to tell. They have different answers and it helps to take them apart.',
      },
      { type: 'h', text: 'Pacing' },
      {
        type: 'list',
        items: [
          'Concentration goes before capability. Protect one or two focused blocks rather than trying to be alert all day.',
          'Do the hardest thing in your best hour, whenever that is. In depression it is often later than it used to be.',
          'Write things down more than feels necessary. Working memory is affected and this is not a character issue.',
          'Take the breaks properly, away from the screen. Micro-breaks at the desk do very little.',
        ],
      },
      { type: 'h', text: 'Disclosure' },
      {
        type: 'p',
        text: 'You are generally not obliged to disclose a diagnosis. In many countries, though, disclosing does trigger a duty on the employer to make reasonable adjustments — so the question is partly practical: is there an adjustment worth having? Later start, fewer meetings, a written brief instead of a verbal one, a phased return.',
      },
      {
        type: 'p',
        text: 'You can also disclose partially and truthfully: "I am dealing with a health issue and I need X for a while." That is often enough to get the adjustment without a conversation you do not want to have.',
      },
      { type: 'pull', text: 'Ask for the adjustment. You do not owe anyone the whole story.' },
      {
        type: 'try',
        text: 'Write the one adjustment that would help most this month. That is the thing to ask for.',
      },
    ],
    takeaway: 'Pace around concentration, and disclose only as far as the adjustment requires.',
  },
  {
    id: 'l11',
    title: 'Telling the people close to you',
    blurb: 'Saying it once, in a way you can manage.',
    minutes: 4,
    mo: 'warm',
    blocks: [
      {
        type: 'p',
        text: 'Depression is isolating partly for a mechanical reason: explaining it is effortful, and effort is the thing in short supply. So people say nothing, and then the silence itself becomes something to explain.',
      },
      { type: 'h', text: 'A shape that works' },
      {
        type: 'list',
        items: [
          'Name it plainly, once. "I have been depressed for a while."',
          'Say what it changes. "I am cancelling more. It is not about you."',
          'Say what you want from them, specifically. Most people want to help and have no idea how.',
          'Say what you do not want. "I would rather not be asked for updates" is a legitimate request.',
        ],
      },
      { type: 'pull', text: 'The most useful sentence is usually: keep inviting me, and do not mind if I say no.' },
      { type: 'h', text: 'If it goes badly' },
      {
        type: 'p',
        text: 'Some people respond poorly — with advice, with their own story, with discomfort. That is about their limits, not about whether you were right to say it. It is worth telling more than one person for exactly this reason.',
      },
      {
        type: 'try',
        text: 'Draft the four sentences in the Reframr or a note. Having the words ready lowers the cost of saying them.',
      },
    ],
    takeaway: 'One plain sentence, what it changes, what you want, what you do not.',
  },
  {
    id: 'l12',
    title: 'When someone asks how to help',
    blurb: 'A list you can hand over.',
    minutes: 3,
    mo: 'warm',
    blocks: [
      {
        type: 'p',
        text: 'People close to you will ask what they can do, and "I do not know" is usually the honest answer in the moment. It helps to have decided in advance, on a better day.',
      },
      { type: 'h', text: 'Things that reliably help' },
      {
        type: 'list',
        items: [
          'Keep inviting, and accept a no without a negotiation.',
          'Offer something specific and small: a walk on Sunday, sitting in the same room, driving me to the appointment.',
          'Do a practical thing rather than asking what needs doing. A meal, a load of shopping, taking the bins out.',
          'Check in with a text that does not require a reply. "Thinking of you, no need to answer."',
          'Take me seriously if I say something about safety, without panic and without leaving.',
        ],
      },
      { type: 'h', text: 'Things that do not' },
      {
        type: 'list',
        items: [
          'Advice you did not ask for, especially about exercise, diet or thinking positively.',
          'Being told about someone who had it worse and recovered.',
          'Being asked repeatedly whether you feel better yet.',
        ],
      },
      {
        type: 'try',
        text: 'Put your version of this list in the Anchr. Then you can hand it over instead of composing it.',
      },
    ],
    takeaway: 'Decide in advance what help looks like, and let people do that.',
  },
  {
    id: 'l13',
    title: 'Advice you did not ask for',
    blurb: 'How to take it without it costing you anything.',
    minutes: 3,
    mo: 'listening',
    blocks: [
      {
        type: 'p',
        text: 'You will be told to go for a run, cut sugar, get off your phone, try cold water, and count your blessings. Some of it is not wrong. Almost all of it is delivered as though you had not thought of it.',
      },
      {
        type: 'p',
        text: 'The reason it stings is not the content. It is the implication that the problem is your failure to try. That implication is worth rejecting even when the suggestion itself is reasonable.',
      },
      { type: 'pull', text: '"That works for some people" is a complete sentence.' },
      { type: 'h', text: 'Useful responses' },
      {
        type: 'list',
        items: [
          '"Thanks — I am working on it with someone." Ends the exchange without a debate.',
          '"I have tried that. It helped a bit." True more often than not, and it closes the loop.',
          '"What I would actually find helpful is…" Redirects the energy, which is usually well meant.',
        ],
      },
      {
        type: 'try',
        text: 'Pick your default line now, so you are not writing one while irritated.',
      },
    ],
    takeaway: 'The advice is rarely the problem. The implied blame is. Decline that part.',
  },
  {
    id: 'l14',
    title: 'Medication over the long term',
    blurb: 'Described neutrally. Your decision, made with your prescriber.',
    minutes: 5,
    mo: 'listening',
    blocks: [
      {
        type: 'p',
        text: 'Lumo has no position on whether you should take medication. What follows is the information people most often say they wish they had been given, so that the conversation with a prescriber is a better one.',
      },
      { type: 'h', text: 'Things worth knowing' },
      {
        type: 'list',
        items: [
          'Antidepressants generally take four to six weeks for a full effect, and side effects usually arrive before benefits. A lot of people stop in week two, in the window where the trade looks worst.',
          'The first one prescribed does not work well for everyone. Switching, or adjusting the dose, is a normal part of the process rather than a sign of failure.',
          'Continuing for a period after recovery substantially reduces relapse risk. Stopping the moment you feel better is common and is associated with things returning.',
          'Stopping is best done gradually and with your prescriber. Discontinuation effects are real, are not the same thing as addiction, and are much easier to manage when tapered.',
          'Medication and therapy are not competitors. For moderate and severe depression, the combination generally outperforms either alone.',
        ],
      },
      { type: 'pull', text: 'Neither taking it nor not taking it says anything about your character.' },
      {
        type: 'p',
        text: 'What matters for this course is only that any change is a decision made with the person prescribing, not one made at three in the morning during a bad week.',
      },
      {
        type: 'try',
        text: 'If you have questions you keep not asking, write them down and take the list to the appointment.',
      },
    ],
    takeaway: 'Know the timelines, expect adjustments, and never change it alone at 3am.',
  },
  {
    id: 'l15',
    title: 'Therapy: getting the most from it',
    blurb: 'Including how to tell whether it is working.',
    minutes: 4,
    mo: 'listening',
    blocks: [
      {
        type: 'p',
        text: 'The strongest predictor of whether therapy works is not the model. It is the relationship — whether you feel understood, and whether you and the therapist agree on what you are working on. That is worth knowing, because it means a poor fit is a reason to change therapist rather than to give up on therapy.',
      },
      { type: 'h', text: 'Practical' },
      {
        type: 'list',
        items: [
          'Say what you want to work on in the first two sessions, even roughly. Drift is the main way courses of therapy get wasted.',
          'Do the between-session work. It is where most of the change happens, particularly in CBT and behavioural activation.',
          'Bring the awkward thing. The session you dread is usually the useful one.',
          'Say when something is not working. A good therapist wants that information and will adjust.',
        ],
      },
      { type: 'h', text: 'Ending well' },
      {
        type: 'p',
        text: 'Endings are part of the treatment. Ask for a proper one: a review of what changed, what your warning signs are, and what you will do if things slide. That conversation is essentially the material of this course, and it is worth having with someone who knows your history.',
      },
      {
        type: 'try',
        text: 'If you are in therapy, bring your warning-sign list to a session. If you are not, that list is still yours to keep.',
      },
    ],
    takeaway: 'Fit matters most, between-session work does the lifting, and ask for a proper ending.',
  },
  {
    id: 'l16',
    title: 'Seasons, anniversaries and predictable dips',
    blurb: 'Some of it is scheduled. Plan for it.',
    minutes: 4,
    mo: 'resting',
    blocks: [
      {
        type: 'p',
        text: 'Not all of this is random. Many people have dips that arrive on roughly the same schedule every year: the clocks changing, a particular anniversary, the week after a birthday, the fortnight after a holiday, the end of a long project.',
      },
      { type: 'pull', text: 'A dip you saw coming is a different experience from one that ambushes you.' },
      { type: 'h', text: 'How to use it' },
      {
        type: 'list',
        items: [
          'Mark the known dates in advance and lighten the load around them rather than after them.',
          'For seasonal patterns, start morning light early — before the dip, not once it has landed.',
          'Plan connection into those weeks deliberately. They are the weeks it gets cancelled.',
          'Tell one person: "the next fortnight is usually hard for me."',
        ],
      },
      {
        type: 'p',
        text: 'Anniversaries of a loss are worth naming rather than trying to sail past. Most people find the run-up worse than the day, which is useful to know in advance.',
      },
      {
        type: 'try',
        text: 'Look back over your chart for last year, if you have one. Otherwise write down the two hardest months from memory.',
      },
    ],
    takeaway: 'Predictable dips can be prepared for. Lighten the load before, not after.',
  },
  {
    id: 'l17',
    title: 'When it comes back',
    blurb: 'You already know how to do this.',
    minutes: 4,
    mo: 'warm',
    blocks: [
      {
        type: 'p',
        text: 'If depression returns, the worst part is often not the symptoms. It is the meaning attached to the return: that the recovery was fake, that the work was wasted, that this is now permanent.',
      },
      {
        type: 'p',
        text: 'None of that follows. Recurrence is common and it says nothing about how genuine the recovery was. What is different this time is that you have a signature, a floor set, a plan and a set of tools you have already used. The second episode is usually shorter than the first for exactly this reason.',
      },
      { type: 'pull', text: 'You are not starting again. You are starting from a marked path.' },
      { type: 'h', text: 'The order to do things in' },
      {
        type: 'list',
        items: [
          'Name it early and without argument. Do not spend three weeks debating whether it counts.',
          'Drop to the floor set immediately.',
          'Tell your named person. Tell your clinician if you have one.',
          'Reinstate the wake time and the daylight before anything else.',
          'Restart the Liftr at the bottom rung, not where you left off last time.',
        ],
      },
      {
        type: 'try',
        text: 'Read your own warning-sign list now, while you are well, so it is familiar rather than a discovery.',
      },
    ],
    takeaway: 'Recurrence is common and does not undo the recovery. Start from the marked path.',
  },
  {
    id: 'l18',
    title: 'Your maintenance plan',
    blurb: 'The last lesson is one you write.',
    minutes: 5,
    mo: 'glowing',
    blocks: [
      {
        type: 'p',
        text: 'Everything in this course comes together as one page, in your words, kept where you can find it. It is not for anyone else. Write it as though you are leaving instructions for a version of yourself who is tired, slow and not inclined to believe you.',
      },
      { type: 'h', text: 'The seven lines' },
      {
        type: 'list',
        items: [
          'My floor set: the two or three things I keep doing regardless.',
          'My warning signs: five, specific, in the order they usually arrive.',
          'My amber response: what I do when one or two show up.',
          'My red response: what I do when safety is affected, and who I call.',
          'My people: who checks on me, and who I tell first.',
          'My directions: two or three things that are worth aiming at.',
          'What I want to remember: the sentence that helped most this year.',
        ],
      },
      { type: 'pull', text: 'Write it while it is easy. Use it when it is not.' },
      {
        type: 'p',
        text: 'Put it in the Anchr, which is on this device, reachable in two taps from anywhere in Lumo, and works with no signal. Review it twice a year — contacts change, and so do you.',
      },
      {
        type: 'try',
        text: 'Write the seven lines today. It takes about fifteen minutes and it is the most useful fifteen minutes in this course.',
      },
    ],
    takeaway: 'One page, in your words, written for a tired version of you.',
  },
];
