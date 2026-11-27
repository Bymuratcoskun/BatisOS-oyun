# BatışOS game guide

[Türkçe](REHBER.md) · **Play:** https://bymuratcoskun.github.io/BatisOS-oyun/?lang=en

> Sink your startup before it sinks.

<!-- Generated from `src/i18n/rehber.ts` (`tools/rehber-yaz`); do not edit by hand. -->

## Contents

1. [What is this game?](#nedir)
2. [Quick start](#baslangic)
3. [What is on the screen?](#ekran)
4. [How does a week work?](#hafta)
5. [Winning and losing](#bitis)
6. [Kinds of decisions](#kararlar)
7. [Event chains: decisions come back](#zincirler)
8. [Deck, classic deck and seed](#deste)
9. [Results screen and founder report card](#sonuc)
10. [Sharing and playing again](#paylas)
11. [Keyboard, language and accessibility](#kullanim)
12. [Saving and privacy](#gizlilik)
13. [Tips](#ipuclari)
14. [Frequently asked questions](#sss)
15. [About](#hakkinda)

<a id="nedir"></a>

## What is this game?

BatışOS is a short, comic decision game about the first 12 weeks of a brand-new software startup. A game takes a few minutes. Each week something happens and you pick one of three decisions.

The point: engineers often want to build "the right thing" instead of the small thing the customer asked for. Let’s write our own engine, get the infrastructure solid first, it would be cleaner if we rewrote it… These choices lift team morale but drain the cash. Talking to the customer and building what they asked for looks boring, but it keeps the company alive.

You don’t need to know anything about running a company. Every number is on screen and the game tells you what will happen before you choose. The rest is reading the cards and laughing.

<a id="baslangic"></a>

## Quick start

- Press "Found the company".
- Read the card and pick one of the three decisions. Under each decision you see its effect on cash, customers and morale.
- Read the outcome and continue with "Next week".
- If at the end of week 12 your cash is above 0 TL and you have at least 10 paying customers, you win.

<a id="ekran"></a>

## What is on the screen?

- Top bar: which week you are in, and the language button.
- Cash: the company’s money. It starts at 100,000 TL. Below 20,000 TL it turns red with a ⚠ sign.
- Paying customers: starts at 0, the target is 10.
- Founder morale: starts at 80, maxes out at 100. It can also go below zero. Morale never ends the game; it only shows how much fun you are having while sinking.
- Activity log: the outcome of every week, newest on top.
- Bottom line: the game version, the card set name and this deck’s seed (handy when reporting a bug).

<a id="hafta"></a>

## How does a week work?

Each week an event card opens: a title, a short situation and three decisions. Under each decision its effects are written as numbers, for example "Cash −5,000 TL · Customers +3 · Morale 0". There are no hidden effects: what is written is what happens.

After you decide, the outcome screen shows each indicator before and after, plus a short text about what happened. Customers can’t go below 0 and morale can’t go above 100; if a number is cut off, a note like "(limit 100)" says so.

The order of the options is shuffled in every game. A button’s position tells you nothing; you have to read the text.

<a id="bitis"></a>

## Winning and losing

- If cash drops to 0 TL or below, the company closes on the spot. Customers gained by the same decision don’t save you.
- If you finish all 12 weeks with positive cash and at least 10 paying customers: the company is still standing and you win.
- If you finish all 12 weeks but have fewer than 10 customers: you lose. The investor calls that a "piggy bank".
- Morale never ends the game, whatever it is.

In this game customers don’t bring in money on their own. Cash changes only through your decisions; the customer count is a separate goal.

<a id="kararlar"></a>

## Kinds of decisions

Three kinds of decisions show up again and again. They are not labelled on screen, but the titles on the results screen and the event chains look at them:

- Customer-facing decision: cheap, brings customers, morale dips a little. Boring. It works.
- Promotion decision: announcements, badges, pitch decks, videos. Morale goes up, customers mostly don’t come.
- Infrastructure decision: "let’s write our own", "let’s build the engine first". Expensive, the biggest morale boost of all, brings no customers. The results screen counts how many you took.

<a id="zincirler"></a>

## Event chains: decisions come back

In a normal game some decisions come back 3 weeks later. There are 3 chains and each one opens at most once per game:

- Maintenance: your first infrastructure decision needs maintenance 3 weeks later ("That Thing Is Still Running").
- Promise: your first promotional promise is brought up 3 weeks later ("So Where Is It?").
- Delivery: when you reach 6 customers, 3 weeks later they all ask the same question ("When Is Ours Ready?").

Under a decision that will open a chain, an orange line tells you in advance what will happen, for example "Will need maintenance in 3 weeks." It always comes true.

The follow-up card replaces that week’s card and quotes your own decision. The game still lasts 12 weeks; the final week never changes. If there is no room left for the follow-up (a chain opened late) or the company sinks early, a line appears under "LEFT BEHIND" on the results screen.

<a id="deste"></a>

## Deck, classic deck and seed

Each game builds a 12-card deck from a pool of 27 cards: 4 early, 7 middle and 1 final card. Cards that are too similar never appear in the same deck, so every game is a little different.

- Classic deck: add #klasik to the end of the address. You get the first version’s 12 cards in their original order, with no event chains.
- Seed: every deck has a number (shown as "seed …" on the bottom line). The #tohum-NUMBER address opens the same deck with the same option order. If your decisions differ, the game still goes differently.

<a id="sonuc"></a>

## Results screen and founder report card

When the game ends you see: how many weeks you lasted, cash left, customers, morale, the number of infrastructure decisions, your last spend (your last signature if you won) and an investor comment. The decision summary table shows each decision’s effect on cash and the cash left, week by week.

Titles on the founder report card:

- Accidental CEO: you won.
- Mimar Sinan, Zero Revenue: you took at least 4 infrastructure decisions and finished with 0 customers.
- Pitch Deck Unicorn: you took at least 3 promotion decisions and finished with fewer than 3 customers.
- Open Source Martyr: you answered the 300 TL API bill with "let’s write our own" and lost.

You can earn several titles at once. No title at all? Mediocrity is an achievement too.

<a id="paylas"></a>

## Sharing and playing again

- "Copy result" copies your result and a link to this deck. A friend who opens the link plays the same deck. If the browser does not allow copying, the text appears in a box you can select.
- When you play in English, the copied link opens the game in English.
- "Try again" starts over with a new deck.
- "Blame the tech stack" also starts over; the only difference is that the log says "Responsibility delegated."

<a id="kullanim"></a>

## Keyboard, language and accessibility

- Keys 1, 2 and 3 pick the decision in its on-screen position. Every button also works with Tab and Enter.
- Increases and decreases are shown not only with colour but also with ▲ ▼ signs and text.
- Text zoom (up to 200%) and narrow phone screens are supported.
- Language: the button in the top bar switches between Turkish and English; it works mid-game too and is remembered in this browser. You can also add ?lang=en or ?lang=tr to the address.
- The game has not been tested with a screen reader yet.

<a id="gizlilik"></a>

## Saving and privacy

No account, no server, no tracking. The game sends data nowhere. This browser only remembers how many games you played, how many you won, your best cash and your language choice. In a private window nothing is stored, and the screen says so. An unfinished game is not saved; it only takes a few minutes anyway.

<a id="ipuclari"></a>

## Tips

- Talking to customers almost always works. Don’t tell anyone.
- High morale does not protect the cash. Going bust at 100 morale is possible; it has been tried.
- Read the orange warning: a decision that looks shiny today brings its bill 3 weeks later.
- Sinking is fun too. Most titles go to founders who sink.

<a id="sss"></a>

## Frequently asked questions

- Is this a real business simulation? No. The numbers are game tuning, not market data.
- Do the cards mention real companies or products? No; only well-known technical names (CSV, Rust, Kubernetes, JavaScript) appear.
- Why is the currency TL? The game is about a startup founded in Turkey, so it stays TL in English too.
- What is simit? A ring-shaped Turkish bread covered in sesame. Doing an installation over simit and tea is a tradition.
- Who is Mimar Sinan? The famous Ottoman architect whose buildings have stood for centuries. Your company is not that durable.
- Will there be a plugin system? No. It says so on the bottom line too.

<a id="hakkinda"></a>

## About

BatışOS is open source (MIT licence). It runs in the browser and needs no installation. It has been tested with Chromium and Firefox.
