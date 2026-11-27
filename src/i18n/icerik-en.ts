// v1.4 İngilizce içerik. Asıl metin Türkçedir (src/content/*); burada yalnız metin var — kimlikler, sayılar
// ve etiketler Türkçe karttan gelir, bu yüzden iki dilde oyun birebir aynı oynanır.
// Kapı (tests/content/ceviri.test.ts): her kartın, seçeneğin, zincirin, unvanın İngilizcesi var; fazla
// anahtar yok; yer tutucular aynı; İngilizce metinde Türkçe harf yok (çevrilmeden kalan metin yakalanır).
// Çeviri kelimesi kelimesine değil: espri İngilizcede de çalışsın diye yerelleştirildi (Claude Code taslağı).
import type { ChainId } from '../core/types.ts';

export interface SecenekEN {
  text: string;
  log: string;
}
export interface KartEN {
  title: string;
  description: string;
  options: Record<string, SecenekEN>;
}

export const KARTLAR_EN: Record<string, KartEN> = {
  'ilk-musteri': {
    title: 'First customer at the door',
    description: '“I’ll buy it if you add CSV export.”',
    options: {
      csv: {
        text: 'Build just the CSV export they asked for',
        log: 'CSV done. The customer opened it in a spreadsheet, paid, and brought two friends. The team is a little disappointed: it shouldn’t have been this easy.',
      },
      motor: {
        text: 'Write a general-purpose export engine',
        log: 'The engine supports 14 formats. CSV is not one of them yet, but the architecture is very ready.',
      },
      bicim: {
        text: 'Design our own file format',
        log: 'The customer waited, then gave up. But we now own the standard of the file they can’t open.',
      },
    },
  },
  'api-faturasi': {
    title: 'The paid API bill arrived',
    description: '“The integration service wants 300 TL a month.”',
    options: {
      ode: {
        text: 'Pay this month’s fee and keep working on the product',
        log: '300 TL paid. Nothing exploded. Nobody on the team remembers a week this boring.',
      },
      kaldir: {
        text: 'Remove the integration for now',
        log: 'The integration was removed. The customers who relied on it removed themselves too.',
      },
      kendimiz: {
        text: 'Let’s write our own alternative',
        log: 'We spent 15,000 TL to escape a 300 TL dependency. You can’t put a price on independence.',
      },
    },
  },
  rakip: {
    title: 'A rival shipped a similar feature',
    description: '“And people are actually using it.”',
    options: {
      konus: {
        text: 'Talk to the customers',
        log: 'We talked to customers. Nobody uses the rival’s feature; they only saw the ad. Two people switched to us.',
      },
      demo: {
        text: 'Make a short demo showing what makes us different',
        log: 'The demo lasted 90 seconds; 85 of them were the intro animation. One person was convinced anyway.',
      },
      rust: {
        text: 'Rewrite it in Rust',
        log: 'Our market share did not change. The compiler understands us better now.',
      },
    },
  },
  eklenti: {
    title: 'A suggestion from the team',
    description: '“Let’s move the app to a plugin architecture. Nobody has asked for plugins yet, but they might.”',
    options: {
      ertele: {
        text: 'Postpone it',
        log: 'The plugin architecture was postponed. The team has entered the first of the five stages of grief: denial.',
      },
      sor: {
        text: 'Ask the customer',
        log: 'The customer didn’t want plugins; they wanted to send invoices. Invoicing took one afternoon, and another license was sold.',
      },
      cekirdek: {
        text: 'Split out the core',
        log: 'The core was split out. Now we have two separate things instead of one, and neither makes money.',
      },
    },
  },
  logo: {
    title: 'A designer friend dropped by',
    description: '“Your logo looks a bit dated. Want me to take a pass at it?”',
    options: {
      'odeme-sayfasi': {
        text: 'Forget the logo, finish the payment page',
        log: 'The payment page worked; two people paid right away. The logo is still old. The money is new.',
      },
      animasyon: {
        text: 'Add an animation to the logo',
        log: 'The logo got an animation. The revenue did not.',
      },
      'tasarim-sistemi': {
        text: 'Let’s build a design system first',
        log: 'The design system is ready: 48 shades of grey, 112 button components. The product has 3 buttons in total.',
      },
    },
  },
  destek: {
    title: 'First support ticket',
    description: '“I forgot my password, can you help?”',
    options: {
      yardim: {
        text: 'Pick up the phone and help',
        log: 'A five-minute call. The customer was so surprised they told a friend; the friend subscribed too.',
      },
      discord: {
        text: 'Set up a community server',
        log: 'Community server is live: 14 channels, 6 roles, 1 bot, 1 member. The member is the bot. The password is still forgotten.',
      },
      kimlik: {
        text: 'Let’s write our own authentication system',
        log: 'Authentication was written from scratch. The customer still can’t log in, but now they can’t log in much more securely.',
      },
    },
  },
  yatirimci: {
    title: 'Coffee with an investor',
    description: '“Can I see your numbers?”',
    options: {
      durust: {
        text: 'Show the real numbers',
        log: 'The numbers were small. The investor didn’t invest, but bought a license for their own company. We paid for the coffee.',
      },
      sunum: {
        text: 'Prepare a 70-slide pitch deck',
        log: 'The investor fell asleep on slide 41. They loved the slide transitions, before falling asleep.',
      },
      kubernetes: {
        text: 'Set up Kubernetes to look ready to scale',
        log: 'The system can now scale to 10 million users. Only a few million left to reach the target.',
      },
    },
  },
  'yapay-zeka': {
    title: 'The rival went “AI-powered”',
    description: 'Nobody knows what it does, but it really shines on their website.',
    options: {
      rapor: {
        text: 'Add the report customers asked for',
        log: 'The report is in. There is no artificial intelligence in it, just the natural kind. Customers didn’t notice the difference; two new licenses came in.',
      },
      etiket: {
        text: 'Write “AI-powered” on your website',
        log: 'The website now says “AI-powered.” Nobody asked what it powers. One person signed up.',
      },
      model: {
        text: 'Let’s train our own language model from scratch',
        log: 'The model trained for three weeks. Its first sentence: “Where is the customer?” We had no answer.',
      },
    },
  },
  'odeme-hatasi': {
    title: 'A bug on Friday evening',
    description: '“The payment screen sometimes charges twice.”',
    options: {
      duzelt: {
        text: 'Fix the bug and refund the money',
        log: 'Bug fixed, money refunded. The customer was so amazed by our honesty they signed up their spouse too. Friday evening was sacrificed.',
      },
      duyur: {
        text: 'Post “a big update is coming” on social media',
        log: 'The big update was announced. The payment screen kept charging twice. Someone ran out of patience and left, slamming the door twice.',
      },
      yeniden: {
        text: 'Rewrite the payment screen',
        log: 'The payment screen is being rewritten. Meanwhile nobody can pay, so nobody gets charged twice either. Problem solved.',
      },
    },
  },
  konferans: {
    title: 'Conference invitation',
    description: 'A chance to speak on stage for 20 minutes. The attendance fee is 7,500 TL.',
    options: {
      gitme: {
        text: 'Skip it, meet potential customers that day',
        log: 'We skipped the conference. Coffee with three prospects: two bought licenses, the third paid for the coffee.',
      },
      konusma: {
        text: 'Go and give the “Why we won’t go under” talk',
        log: 'The talk got a big round of applause. Besides applause, we also got a business card. Its owner became a customer.',
      },
      cati: {
        text: 'Give the talk on our own JavaScript framework',
        log: 'We presented our framework. Out of 300 people in the room, two starred the repo. Both are on our team.',
      },
    },
  },
  stajyer: {
    title: 'The intern’s question',
    description: '“Why did we rewrite this code from scratch three times?”',
    options: {
      haklisin: {
        text: 'You’re right, back to the customer list',
        log: 'The question ended the meeting in ten minutes. Two sales were made in the time left. People are talking about promoting the intern; not the founder.',
      },
      belge: {
        text: 'Make them read the architecture documents',
        log: 'The intern read the 400-page architecture document and took the question back. They didn’t quit, but something showed on their face.',
      },
      dorduncu: {
        text: 'Rewrite it a fourth time; this time it’ll be clean',
        log: 'The fourth version is spotless. So clean that it has no features in it yet.',
      },
    },
  },
  kurumsal: {
    title: 'Final week: an enterprise customer',
    description: '“We’ll take five licenses. Only, the contract has a ‘theme support’ clause.”',
    options: {
      imzala: {
        text: 'Sign with the default theme',
        log: 'Contract signed, five licenses sold. The company thought the default theme was “corporate blue.” Nobody corrected them.',
      },
      video: {
        text: 'Let’s shoot a promo video first',
        log: 'The video turned out great. The company liked it so much they bought one license instead of five.',
      },
      tema: {
        text: 'Write a theme engine, then we sign',
        log: 'Our third theme engine is complete. The company signed with the rival; the rival has exactly one theme.',
      },
    },
  },
  'fiyat-yakinda': {
    title: 'Pricing: Coming Soon',
    description: '“The pricing page has said ‘Coming soon’ for three months.”',
    options: {
      'fiyat-yaz': {
        text: 'Write down a price, ask three customers to pay',
        log: 'One found it expensive, two paid without asking. The feature missing for three months was a number.',
      },
      anket: {
        text: 'Run a “How much would you pay?” survey',
        log: 'Most picked “I’d use it if it were free.” We added that option ourselves.',
      },
      'fiyat-motoru': {
        text: 'Write an engine that prices by demand',
        log: 'The engine measures demand a hundred times a second. Demand is zero, so the price it suggests is zero too.',
      },
    },
  },
  'testler-yesil': {
    title: 'All Tests Green',
    description: '“The file I upload never shows up on the screen.”',
    options: {
      'elle-dene': {
        text: 'Try the product by hand with the customer’s file',
        log: 'The product never read the file at all. The fix was one line; the customer uploaded a second file too.',
      },
      rozet: {
        text: 'Publish a “Our tests are 100% green” badge',
        log: 'People loved the badge. The first comment came from the customer asking why their file still doesn’t show up.',
      },
      'test-testi': {
        text: 'Write tests that check the tests',
        log: 'Now the tests have tests too, and they are all green. The product still never opens the file.',
      },
    },
  },
  departmanlar: {
    title: 'Every Department, Eventually',
    description: '“Eventually every department will use it, so build it that way.”',
    options: {
      'tek-rol': {
        text: 'Keep one role, configure it by hand for whoever asks',
        log: 'Two manual settings took two minutes. Whether those departments exist is still unknown.',
      },
      'yetki-duyur': {
        text: 'Announce “Enterprise permissions coming soon”',
        log: 'The roadmap page got more views than the product. A date nobody was waiting for got a round of applause.',
      },
      'yetki-sistemi': {
        text: 'Write a fourteen-role permission system',
        log: 'We now have a role that “can view the report but cannot export it.” The only person with that role is the founder.',
      },
    },
  },
  'hayali-ekip': {
    title: 'The Imaginary Team',
    description: 'The team is small; the processes are being built for a team of thirty.',
    options: {
      'bes-firma': {
        text: 'Forget the process, demo the product to five companies this week',
        log: 'Five meetings, two overnight buses. Every meeting asked “Who approves this?”; when the answer was “we do,” things sped up.',
      },
      ilan: {
        text: 'Post a “Our team is growing” job ad',
        log: 'The ad got a hundred and ten applications. None of them wanted to buy anything.',
      },
      'onay-hatti': {
        text: 'Build a seven-stage approval pipeline',
        log: 'Every change now goes through seven approvals. On a small team, that means approving your own code several times a day.',
      },
    },
  },
  'kayit-sayaci': {
    title: 'Sign-up Counter Party',
    description: 'The dashboard shows hundreds of free sign-ups; the billing sheet is silent.',
    options: {
      'kayitlilari-ara': {
        text: 'Call the people who signed up, offer a paid trial',
        log: 'The calls produced four payments. This time the confetti landed in accounting.',
      },
      rekor: {
        text: 'Share the sign-up record on social media',
        log: 'The record got applause. The applause stayed on the free plan.',
      },
      sayac: {
        text: 'Build real-time counter infrastructure',
        log: 'The counter is now millisecond-accurate. Zero refreshes faster than ever.',
      },
    },
  },
  'simitle-kurulum': {
    title: 'Setup Over Simit',
    description: '“I couldn’t do the setup on my own, could you come to the office?”',
    options: {
      simit: {
        text: 'Grab some simit, go over and set it up together',
        log: 'The setup took half an hour and three glasses of tea. Two companies from the same floor were waiting at the door: “Could you set it up for us too?”',
      },
      'video-serisi': {
        text: 'Shoot a professional setup video series',
        log: 'Twelve episodes, flawless lighting. One person finished the setup; the rest are waiting for season two.',
      },
      sihirbaz: {
        text: 'Write a wizard that generates setup wizards',
        log: 'The wizard can generate any setup at all. The customer still couldn’t install it; the wizard has its own setup.',
      },
    },
  },
  'musteriye-mail': {
    title: 'Emailing Customers',
    description: 'Writing the same news to twenty people one by one is exhausting.',
    options: {
      'iki-cumle': {
        text: 'Send a two-sentence email with an off-the-shelf service',
        log: 'Not a template, just two plain sentences, and they got replies. Both replies said “Could you open an account for us?”',
      },
      bulten: {
        text: 'Work on a newsletter design and a corporate identity',
        log: 'The newsletter is stylish, the logo is new. The product name is missing from the third paragraph; nobody noticed.',
      },
      'mail-sunucusu': {
        text: 'Let’s set up our own mail server',
        log: 'Two nights of configuration, one argument about blacklists. Our first newsletter landed in the spam folder.',
      },
    },
  },
  'arama-kutusu': {
    title: 'The Search Box',
    description: '“Is there no search in here?” This is the third customer to ask.',
    options: {
      'basit-arama': {
        text: 'Add a simple search, show it to three customers',
        log: 'The job postponed for three weeks took two hours. Customers type in the box, find things, and keep the tab open.',
      },
      'arama-gorseli': {
        text: 'Announce search with a promo graphic',
        log: 'The graphic is slick. The first comment was “Which version?”; whoever wrote it misspelled the product name again.',
      },
      'arama-motoru': {
        text: 'Let’s write our own full-text search engine',
        log: 'Inverted index, stemmer and a Turkish suffix parser are ready. The only word anyone types in the box is “invoice.”',
      },
    },
  },
  'kucuk-ofis': {
    title: 'A Small Office',
    description: 'A small office has been rented; everyone on the team wants their own desk.',
    options: {
      'ofisi-ertele': {
        text: 'Postpone the office, spend the money visiting customers',
        log: 'Finding a socket in the customer’s meeting room was hard. Still, two accounts were opened and nobody had to pick a locker.',
      },
      'ofis-turu': {
        text: 'Shoot an office tour video, share the team culture',
        log: 'The comments say “I wish I worked here.” The only person who called was asking about invoice tracking.',
      },
      'masa-sistemi': {
        text: 'Write a desk booking system',
        log: 'The system talks to the calendar and asks for a QR code. There is still one more desk than employees.',
      },
    },
  },
  abonelikler: {
    title: 'The Forgotten Subscriptions',
    description: '“Half of the monthly costs go to subscriptions nobody remembers the name of.”',
    options: {
      'abonelik-kapat': {
        text: 'Cancel the subscriptions, put the money into customer visits',
        log: 'Nobody noticed the cancelled subscriptions were gone. Customers had been noticing the missing visits for months.',
      },
      'arac-listesi': {
        text: 'Share a “Tools we use” list',
        log: 'The list got saved a lot, and the makers of two tools said thanks. That day the team saw half of those tools for the first time.',
      },
      'abonelik-araci': {
        text: 'Let’s write our own subscription analysis tool',
        log: 'The tool found every subscription and charted them. Our most loyal subscriber turned out to be the founder’s own credit card.',
      },
    },
  },
  gundem: {
    title: 'Item Four on the Agenda',
    description: 'Three meetings this week; none of them has customers on the agenda.',
    options: {
      'toplanti-iptal': {
        text: 'Cancel the meetings, call customers in those hours',
        log: 'Fourteen calls, eleven “call back later,” three payments. The team is a little uneasy without meetings.',
      },
      'nasil-calisiyoruz': {
        text: 'Publish a “How we work” post',
        log: 'The post was shared a lot. Readers want to work like us; nobody wanted to buy anything from us.',
      },
      'toplanti-sureci': {
        text: 'Set up a process for meetings',
        log: 'Agenda template, decision log and a meeting about meetings are ready. The product was item four; time ran out.',
      },
    },
  },
  'ilk-satisci': {
    title: 'The First Salesperson',
    description: 'Everyone on the team is an engineer. Who is going to sell?',
    options: {
      'kurucu-satsin': {
        text: 'Let the founder do sales again this month',
        log: 'Three setups, two invoices and one support call before midnight. Customers are happy; the founder has started talking to the coffee machine.',
      },
      'kultur-belgesi': {
        text: 'Prepare a careers page and a culture document',
        log: 'The culture document lists seven values. Nobody applied, but the values are lovely.',
      },
      'ise-alim-yonergesi': {
        text: 'Write a forty-point hiring guideline',
        log: 'Interview guideline, access policy and onboarding programme are ready. Still no salesperson, but there is a security policy.',
      },
    },
  },
  'gec-yayin': {
    title: 'The Launch That Keeps Slipping',
    description: 'Two small businesses are ready to use the product; we keep saying “just a few more things.”',
    options: {
      'eksikleri-dondur': {
        text: 'Freeze the to-do list, switch on the two businesses',
        log: 'Both businesses started entering data on day one. The unfinished items stopped nobody this week.',
      },
      'bekleme-listesi': {
        text: 'Open an early-access waiting list',
        log: 'People loved the waiting list page. The only person on the list got tired of waiting and paid.',
      },
      'surum-hatti': {
        text: 'Build a zero-downtime release pipeline',
        log: 'Releases now swap in under a second with zero downtime. A product that isn’t live was hardly going to have downtime anyway.',
      },
    },
  },
  'tek-ekran': {
    title: 'A One-Screen Request',
    description: '“Not the whole report, I just want to see today’s total.”',
    options: {
      'toplam-ekrana': {
        text: 'Put today’s total on the screen',
        log: 'The total is on screen, two payments came in. One line did the job.',
      },
      lansman: {
        text: 'Announce the new screen with a launch',
        log: 'The launch brought one payment. The visuals showed three more screens that don’t exist yet.',
      },
      'sorgu-dili': {
        text: 'Write a general-purpose report query language',
        log: 'The query language is ready; its manual is forty pages long. Today’s total now depends on the syntax.',
      },
    },
  },
  'demo-gunu': {
    title: 'Final week: Demo Day',
    description: 'Investor demo day is tomorrow. You have five minutes on stage.',
    options: {
      'bes-dakika': {
        text: 'Use the five minutes on customers and numbers',
        log: 'The pitch took three minutes. In the remaining two, two investors introduced us to customers.',
      },
      'kirk-slayt': {
        text: 'Prepare a forty-slide vision deck',
        log: 'The slides were very impressive. By slide forty one person was left in the room; they stayed to try the product.',
      },
      'demo-altyapi': {
        text: 'Build separate infrastructure for the demo, explain the architecture',
        log: 'The architecture was explained flawlessly. An investor took a note: “I asked the founder the time; they explained how the clock was made.”',
      },
    },
  },
};

export interface ZincirEN {
  card: KartEN;
  epilogue: string;
  hintSlot: string;
  hintEnd: string;
}

/** Takip kartları. Yer tutucular Türkçedeki gibi: {hafta} {karar} {musteri} · {gun} {esik}. */
export const ZINCIR_EN: Record<ChainId, ZincirEN> = {
  bakim: {
    card: {
      title: 'That Thing Is Still Running',
      description: 'Week {hafta}: “{karar}”. That thing is still running. And every night at three it wants something.',
      options: {
        'hazir-servis': {
          text: 'Shut it down, do the part customers use with an off-the-shelf service',
          log: 'Three weeks of work gone with a single delete command. The customer didn’t notice the difference; the team did.',
        },
        'acik-kaynak': {
          text: 'Open-source it, let the community maintain it',
          log: 'We gave the repo its first star ourselves. And its first bug report.',
        },
        'bakim-araci': {
          text: 'Let’s write an internal tool to maintain it',
          log: 'Now two things need maintenance. One maintains the other; who maintains that one is a separate meeting.',
        },
      },
    },
    epilogue: 'The maintenance bill for “{karar}” was left to the next founder.',
    hintSlot: 'Will need maintenance in {gun} weeks.',
    hintEnd: 'The maintenance bill goes on the results screen.',
  },
  soz: {
    card: {
      title: 'So Where Is It?',
      description: 'In week {hafta} we said “{karar}”. The internet did not forget. Someone shared the screenshot: “So where is it?”',
      options: {
        ozur: {
          text: 'Apologise, call the customers you promised one by one',
          log: 'We called six people. Two said “Actually, I forgot too” and opened an account.',
        },
        'geri-sayim': {
          text: 'Add a countdown next to “Coming very soon”',
          log: 'The countdown hit zero and a new countdown started in its place. The team calls this an “iterative roadmap.”',
        },
        'soz-takip': {
          text: 'Build a system that tracks which promise we made when',
          log: 'In its first week the system found 47 open promises. Promise number forty-eight: “We will finish this system too.”',
        },
      },
    },
    epilogue: 'The “{karar}” promise is still out there on the internet. So is the screenshot.',
    hintSlot: 'This promise will be brought up in {gun} weeks.',
    hintEnd: 'This promise will be brought up on the results screen.',
  },
  teslim: {
    card: {
      title: 'When Is Ours Ready?',
      description: 'You now have {musteri} customers. All of them asked the same question the same morning: “When is ours ready?”',
      options: {
        'en-cok-odeyen': {
          text: 'Start with the biggest payer, give the others an honest date',
          log: 'One of the customers who got a date commented: “First time anyone has given me a real date.”',
        },
        'oncelikli-mail': {
          text: 'Email everyone “You are our priority customer”',
          log: '{musteri} customers got {musteri} separate “priority” emails. Two of them work at the same company.',
        },
        'oncelik-motoru': {
          text: 'Let’s write a request prioritisation engine first',
          log: 'The engine reviewed every request and decided the highest priority was the engine itself.',
        },
      },
    },
    epilogue: '{musteri} customers are still asking “When is ours ready?” The answer is in the next release.',
    hintSlot: 'You reach {esik} customers: in {gun} weeks they ask when theirs is ready.',
    hintEnd: 'You reach {esik} customers: they ask when theirs is ready on the results screen.',
  },
};

/** Kurucu karnesi unvanları (src/core/calculate-awards.ts kimlikleriyle). */
export const UNVAN_EN: Record<string, { title: string; quip: string }> = {
  'mimar-sinan': {
    title: 'Mimar Sinan, Zero Revenue',
    quip: 'Like the great architect Sinan, your works will stand for centuries. Your company did not.',
  },
  'acik-kaynak-fedaisi': {
    title: 'Open Source Martyr',
    quip: 'You refused to bow to a 300 TL bill. Now you don’t have a company to bow with.',
  },
  'sunum-unicornu': {
    title: 'Pitch Deck Unicorn',
    quip: 'Your slides are worth a billion dollars. Your bank account is not a slide.',
  },
  'istemeden-ceo': {
    title: 'Accidental CEO',
    quip: 'You talked to the customer, built what they wanted, and took their money. Your engineer friends no longer recognise you.',
  },
};

/** Yatırımcı yorumları (INVESTOR_COMMENTS anahtarlarıyla). */
export const YATIRIMCI_EN: Record<string, string> = {
  kazandi: '“Talking to customers worked. Don’t tell anyone, it would ruin the industry.”',
  kumbara: '“There is cash and no customers. That’s not a company, that’s a piggy bank.”',
  altyapi: '“If only you had tried taking money just once.”',
  soba: '“The only faster way to burn money would have been a stove. And you would have written that yourselves too.”',
};

/** "Suçu teknoloji yığınına at" ile açılan oyunun ilk notu (BLAME_NOTE). */
export const SUC_NOTU_EN = 'Responsibility delegated.';
