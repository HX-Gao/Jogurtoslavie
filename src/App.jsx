import { useState } from "react";

/* ══════════════════════════════════════════════════════════════════════
   JOGURTOSLÁVIE — Historická strategická hra, 1941–1944
   5 oblastí + Bělehrad | Cíl: Osvobodit Bělehrad + 2 oblasti
   ══════════════════════════════════════════════════════════════════════ */

// ─── TERÉN ───────────────────────────────────────────────────────────────────

const TER = {
  plains:    { label:"Rovina",  icon:"🌾", pM:-1, gM:+2, desc:"Panonská nížina – tanky Němců jezdí volně. Partyzáni -1, Němci +2 k hodu." },
  mountains: { label:"Hory",   icon:"⛰️",  pM:+2, gM:-2, desc:"Dinárské Alpy – guerillový ráj. Partyzáni +2, Němci -2 k hodu." },
  mixed:     { label:"Kopce",  icon:"🌲", pM: 0, gM: 0, desc:"Šumadijské kopce – neutrální terén, bez modifikátorů." },
  city:      { label:"Město",  icon:"🏙️", pM:-2, gM:+2, desc:"Opevněné hl. město. Bez Rudé armády téměř nedobytné." },
};

// ─── OBLASTI ─────────────────────────────────────────────────────────────────

const REGIONS = [
  { id:"banat",    name:"Banát",         ter:"plains",
    sc:-3, sg:3, sb:0, isCapital:false,
    city:"V. Bečkerek", cx:265, cy:68, lx:292, ly:84,
    sp:"⚠️ Tankový koridor: Němci +1 útok. Banát spravován folksdojčery – etnická německá menšina.",
    path:"M 200,22 L 305,16 L 385,36 L 410,88 L 396,134 L 340,150 L 272,153 L 217,143 L 200,112 L 190,58 Z" },
  { id:"belehrad", name:"Bělehrad",      ter:"city",
    sc:-5, sg:6, sb:0, isCapital:true,
    city:"Bělehrad", cx:200, cy:160, lx:200, ly:165,
    sp:"🎯 HLAVNÍ CÍL – nutné osvobodit. Pevné opevnění (🔒). Bez Rudé armády téměř nedobytné.",
    path:"M 182,143 L 217,143 L 232,160 L 217,177 L 182,177 L 166,160 Z" },
  { id:"zap",      name:"Záp. Srbsko",   ter:"mountains",
    sc:0,  sg:2, sb:1, isCapital:false,
    city:"Čačak", cx:140, cy:270, lx:93, ly:248,
    sp:"⛰️ Dinárské Alpy: Základny +1 obrana. Oblast 1. povstání – Užická republika (1941).",
    path:"M 28,152 L 120,132 L 182,143 L 166,160 L 182,177 L 174,206 L 160,282 L 122,354 L 66,372 L 14,323 L 6,257 L 22,198 Z" },
  { id:"stred",    name:"Střed. Srbsko", ter:"mixed",
    sc:-2, sg:2, sb:0, isCapital:false,
    city:"Kragujevac", cx:265, cy:245, lx:272, ly:237,
    sp:"🏭 Průmyslové centrum: Sabotáž +2 zásoby navíc. Kragujevac – největší zbrojní závod Srbska.",
    path:"M 217,143 L 272,153 L 340,150 L 358,180 L 348,272 L 310,328 L 244,337 L 182,296 L 174,222 L 182,177 L 217,177 Z" },
  { id:"vych",     name:"Vých. Srbsko",  ter:"mixed",
    sc:-2, sg:1, sb:0, isCapital:false,
    city:"Niš", cx:370, cy:314, lx:406, ly:248,
    sp:"🔄 Hraniční trasy: +1 zásoby/tah při kontrole. Přístupy z Bulharska a Rumunska.",
    path:"M 340,150 L 396,134 L 443,148 L 478,201 L 462,293 L 422,354 L 363,373 L 318,344 L 310,328 L 348,272 L 358,180 Z" },
  { id:"jiz",      name:"Již. Srbsko",   ter:"mountains",
    sc:-1, sg:1, sb:0, isCapital:false,
    city:"K. Mitrovica", cx:256, cy:426, lx:226, ly:412,
    sp:"🏔️ Kopaonik & Kosovo: 1 základna vždy přežije. Po italské kap. (tah 8): snadněji osvoboditelné.",
    path:"M 122,354 L 182,296 L 244,337 L 310,328 L 318,344 L 363,373 L 350,436 L 288,483 L 218,485 L 152,457 L 88,404 Z" },
];

// ─── 12 TAHŮ — HISTORICKÉ INFORMACE ─────────────────────────────────────────

const TURNS = [
  { n:1,  date:"6. dubna 1941",  short:"Útok na Jugoslávii", hist:true,
    fLog:"💣 6. 4. 1941: Luftwaffe bombarduje Bělehrad (op. Strafgericht). 17. 4.: Jugoslávie kapituluje.",
    fApply:g=>({...g, morale:Math.max(0,g.morale-10)}),
    hTitle:"Dubnová válka (6.–17. dubna 1941)",
    hText:"Nacistické Německo zahájilo 6. dubna 1941 vojenský útok na Jugoslávii. Luftwaffe provedla operaci „Strafgericht\" (Odplata) – masivní bombardování Bělehradu, při němž zahynulo přes 17 000 civilistů za pouhé 4 dny. Jugoslávská armáda – špatně vybavená a politicky rozdělená – vzdala boj 17. dubna 1941, za pouhých 11 dní. Král Petr II. uprchl do Londýna a ustanovil exilovou vládu. Srbsko se ocitlo pod přímou německou vojenskou správou. Banát získal zvláštní statut spravovaný folksdojčery (etnická německá menšina). Loutkovým premiérem byl jmenován gen. Milan Nedić." },
  { n:2,  date:"Červenec 1941",  short:"Počátek odboje", hist:true,
    fLog:"✊ 27. 6. 1941: Tito zakládá Partyzánskou armádu. 4. 7.: Výzva k ozbrojenému povstání v Jugoslávii.",
    fApply:g=>({...g, fighters:g.fighters+3, morale:Math.min(100,g.morale+5)}),
    hTitle:"Počátek odboje – Partyzáni i Četníci (léto 1941)",
    hText:"Po německém útoku na SSSR (22. 6. 1941) vydala Komunistická strana Jugoslávie výzvu k ozbrojenému odporu. Josip Broz Tito 27. června 1941 formálně zorganizoval Partyzánskou armádu a 4. července vydal výzvu k celonárodnímu povstání. Paralelně plukovník Dragoljub Mihailović organizoval na hoře Ravna Gora četnické oddíly věrné exilové vládě krále Petra II. Oba proudy zpočátku spolupracovaly – koordinovaly útoky v západ. Srbsku. Ideologické rozdíly (komunismus vs. monarchismus) je záhy rozdělily. Do září 1941 bojovalo v Srbsku přibližně 70 000 odbojářů." },
  { n:3,  date:"Říjen 1941",     short:"Masakr v Kragujevaci", hist:true,
    fLog:"💀 21. 10. 1941: 2 794 civilistů popraveno v Kragujevaci. Odpor sílí, morálka klesá.",
    fApply:g=>{const r={...g.regions};if(r.stred)r.stred={...r.stred,garrison:Math.min(6,r.stred.garrison+1)};return{...g,regions:r,morale:Math.max(0,g.morale-12),fighters:g.fighters+4}},
    hTitle:"Masakr v Kragujevaci (21. října 1941)",
    hText:"V reakci na partyzánsko-četnické útoky nařídil Hitler popravu 100 srbských civilistů za každého zabitého německého vojáka. 21. října 1941 obklíčily německé jednotky průmyslové Kragujevac. Z ~10 000 shromážděných mužů a chlapců (16–60 let) bylo vybráno a zastřeleno 2 778–2 794 osob – včetně 144 středoškolských studentů s jejich učiteli. Jeden z učitelů prý vykřikl: „Střelte! Stále vyučuji!\" Ve stejném týdnu bylo v Kraljevu popraveno ~2 000 dalších civilistů. Na podzim 1941 zahynulo v Srbsku přes 20 000 civilistů při německých odvetách. Paradoxně tyto masakry přiměly tisíce Srbů vstoupit do odboje." },
  { n:4,  date:"Prosinec 1941",  short:"Pád Užické republiky", hist:true,
    fLog:"📉 Prosinec 1941: Mohutná německá ofenzíva. Užice padlo, partyzáni ustupují do Bosny. Těžké ztráty.",
    fApply:g=>{const r={...g.regions};if(r.zap)r.zap={...r.zap,control:Math.max(-3,r.zap.control-2),garrison:Math.min(5,r.zap.garrison+2),bases:Math.max(0,r.zap.bases-1)};return{...g,regions:r,fighters:Math.max(3,g.fighters-4),morale:Math.max(0,g.morale-8)}},
    hTitle:"Pád Užické republiky (listopad–prosinec 1941)",
    hText:"Partyzáni ovládli rozsáhlá území záp. Srbska a v Užici vyhlásili první svobodné territory – Užickou republiku (září–listopad 1941). Republika měla vlastní zbrojní továrnu (400 pušek/den), noviny a správní orgány. V listopadu 1941 zahájili Němci mohutnou ofenzívu. Tito byl nucen opustit Užice se ~4 500 bojovníky a ustoupit do Bosny. Tito a Mihailović se sešli dvakrát (26. 10. a 27. 11.), ale jejich jednání skončila neúspěchem kvůli ideologickým rozdílům. Četnické oddíly se stáhly z boje." },
  { n:5,  date:"Jaro 1942",      short:"Rok temna", hist:false,
    fLog:null, fApply:null,
    hTitle:"Rok 1942 – kolaborace četníků a reorganizace odboje",
    hText:"V průběhu roku 1942 se Titovi partyzáni reorganizovali v Bosně a Chorvatsku. Mihailović mezitím uzavíral tajné dohody s italskými silami (únor 1942: dohoda s italskými veliteli v Černé Hoře). Navzdory tomu byl v lednu 1942 jmenován ministrem obrany jugoslávské exilové vlády. Británie zásobovala četniky zbraněmi, aniž věděla o rozsahu jejich kolaborace. V prosinci 1942 navštívil Tita první britský poradce, kapitán William Deakin. Situace v Srbsku samotném byla klidnější – Němci udrželi kontrolu masivním garnizonem." },
  { n:6,  date:"Listopad 1942",  short:"AVNOJ – zárodek nové vlády", hist:true,
    fLog:"🏛️ 26. 11. 1942: Tito zakládá AVNOJ – zárodek budoucí jugoslávské federální vlády. Morálka roste.",
    fApply:g=>({...g, morale:Math.min(100,g.morale+12), fighters:g.fighters+3}),
    hTitle:"AVNOJ – zárodek nové Jugoslávie (26. 11. 1942)",
    hText:"26. listopadu 1942 svolal Tito v Bihaći první zasedání Antifašistické rady národního osvobození Jugoslávie (AVNOJ). Tento orgán se stal zárodkem budoucí federativní vlády. Tito jej prezentoval jako demokratickou alternativu k exilové vládě. Druhé zasedání AVNOJ (29. 11. 1943 v Jajci) pak prohlásilo exilovou vládu za nelegitimní a Tita jmenovalo maršálem Jugoslávie. Mezinárodní veřejnost poprvé vnímala partyzány jako organizovanou politickou sílu s vlastní vizí budoucnosti." },
  { n:7,  date:"Jaro–léto 1943", short:"Bitvy na Neretvě a Sutjesce", hist:true,
    fLog:"⚔️ 1943: Bitvy na Neretvě a Sutjesce. Třetina partyzánů padla, ústředí přežilo. Těžké ztráty.",
    fApply:g=>({...g, fighters:Math.max(4,g.fighters-5), morale:Math.max(20,g.morale-5), resources:Math.max(0,g.resources-2)}),
    hTitle:"Bitvy na Neretvě a Sutjesce (únor–červen 1943)",
    hText:"Případ Weiss (bitva na Neretvě, únor–březen 1943): Pět německo-italských divizí obklíčilo partyzány v Bosně. Partyzáni prolomili trojí obklíčení a porazili četnické síly Mihailoviće – de facto konec četníků jako bojové síly. Případ Schwarz (bitva na Sutjesce, 15. 5.–16. 6. 1943): Němci se pokoušeli zničit Titovo ústředí v kaňonu Sutjesky. Partyzáni ztratili přes 7 000 bojovníků (třetinu sil), ale ústředí přežilo. Brigádní generál Fitzroy Maclean pak informoval Londýn: Tito vede jedinou skutečnou bojovou sílu v Jugoslávii." },
  { n:8,  date:"Září 1943",      short:"⚡ Italská kapitulace!", hist:true,
    fLog:"🏳️ 8. 9. 1943: ITÁLIE KAPITULUJE! Partyzáni přebírají italské zbraně. +6 zásoby, +5 bojovníků!",
    fApply:g=>{const r={...g.regions};if(r.jiz)r.jiz={...r.jiz,control:Math.min(5,r.jiz.control+2),garrison:Math.max(0,r.jiz.garrison-1)};return{...g,regions:r,resources:Math.min(20,g.resources+6),fighters:g.fighters+5,morale:Math.min(100,g.morale+15)}},
    hTitle:"Italská kapitulace – průlom pro odboj (8. září 1943)",
    hText:"8. září 1943 Itálie podepsala příměří se Spojenci a kapitulovala. Pro jugoslávské partyzány to byl jeden z klíčových zlomů války. Převzali obrovské zásoby italských zbraní a munice. Italská armáda v Jugoslávii čítala přes 300 000 vojáků – část přešla k partyzánům. Tito mohl vyzbrolit desítky tisíc nových bojovníků. Vojenský tlak výrazně poklesl, protože Němci museli narychlo přebírat rozsáhlé italské pozice v Dalmácii, Černé Hoře a jižním Srbsku. Toto byl zlom, po němž začala konečná fáze odboje." },
  { n:9,  date:"Prosinec 1943",  short:"Teheránská konference", hist:true,
    fLog:"✈️ Prosinec 1943: Teheránská konference – Spojenci přecházejí na Titovu stranu. Britská mise aktivní!",
    fApply:g=>({...g, british:true, resources:Math.min(20,g.resources+5), morale:Math.min(100,g.morale+8)}),
    hTitle:"Teheránská konference – konec pomoci četníkům (28. 11.–1. 12. 1943)",
    hText:"Na konferenci v Teheránu se setkali Roosevelt, Churchill a Stalin. Britské zpravodajství (SOE) předložilo důkazy o četnické kolaboraci s Osou. Spojenci přestali zásobovat Mihailoviće a plně přešli na podporu Tita. Zásobovací lety RAF se staly pravidelnými. Churchill pronesl v parlamentu: „Zásobujeme ty, kteří zabíjejí více Němců.\" Mihailović byl v březnu 1944 nucen rezignovat z exilové vlády. Britská vojenská mise u Tita dostala instrukce: maximální podpora partyzánů." },
  { n:10, date:"Léto 1944",      short:"Operace Rösselsprung", hist:true,
    fLog:"🪂 25. 5. 1944: Němci útočí na Titovo sídlo v Drvaru! Tito uniká. RAF zásobuje, SSSR se blíží.",
    fApply:g=>({...g, fighters:g.fighters+4, morale:Math.min(100,g.morale+6)}),
    hTitle:"Operace Rösselsprung a britská vzdušná podpora (jaro–léto 1944)",
    hText:"25. května 1944 (Titovy narozeniny) spustili Němci výsadek 500 výsadkářů SS na Titovo velitelství v Drvaru v Bosně. Tito unikl tunelem do hor a byl evakuován britskými letci na ostrov Vis pod britskou ochranou. Ze Visu koordinoval závěrečné osvobozovací operace. Britské a americké letectvo zahájilo Operaci Ratweek – intenzivní útoky na německé zásobovací trasy. Partyzánská 1. tanková brigáda dostala od Británie 56 lehkých tanků M3. Rudá armáda mezitím postupovala přes Rumunsko k jugoslávské hranici." },
  { n:11, date:"Září 1944",      short:"🔴 Rudá armáda vstupuje!", hist:true,
    fLog:"🔴 6. 9. 1944: RUDÁ ARMÁDA vstupuje do Srbska! Bělehrad odblokován! +10 bojovníků, morálka +20!",
    fApply:g=>{const r={...g.regions};if(r.belehrad)r.belehrad={...r.belehrad,garrison:Math.max(2,r.belehrad.garrison-3),fortified:false};if(r.vych)r.vych={...r.vych,garrison:Math.max(0,r.vych.garrison-2),control:Math.min(5,r.vych.control+2)};return{...g,regions:r,redArmy:true,fighters:g.fighters+10,morale:Math.min(100,g.morale+20)}},
    hTitle:"Sovětský vstup do Jugoslávie – 3. Ukrajinský front (září 1944)",
    hText:"23. srpna 1944 Rumunsko přešlo na stranu Spojenců, čímž se otevřela cesta Rudé armádě. 6. září 1944 vstoupil 3. Ukrajinský front maršála Fjodora Tolbuchina přes bulharské území do Jugoslávie. Tito podepsal s Moskvou dohodu o průchodu s podmínkou, že sovieti po válce Jugoslávii opustí. Bulharsko přešlo na stranu Spojenců 9. 9. 1944. Jugoslávská Národní osvobozenecká armáda nyní čítala přes 400 000 bojovníků ve čtyřech polních armádách. Společná sovětsko-partyzánská ofenzíva na Bělehrad se připravovala." },
  { n:12, date:"20. října 1944", short:"⭐ Belgradská ofenzíva!", hist:true,
    fLog:"⭐ 20. 10. 1944: BELGRADSKÁ OFENZÍVA! Sovětské tanky útočí. FINÁLNÍ PŘÍLEŽITOST – nyní nebo nikdy!",
    fApply:g=>{const r={...g.regions};if(r.belehrad)r.belehrad={...r.belehrad,garrison:Math.max(1,r.belehrad.garrison-2)};return{...g,regions:r,morale:Math.min(100,g.morale+10)}},
    hTitle:"Belgradská ofenzíva – Osvobození (14.–20. října 1944)",
    hText:"Belgradská ofenzíva začala 14. října 1944 koordinovaným útokem sovětských a jugoslávských jednotek. Sovětská 4. gardová mechanizovaná armáda útočila ze severovýchodu přes Pančevo, Titova 1. armáda z jihu a jihozápadu. Německá Armádní skupina F bránila Bělehrad statečně. Po šesti dnech krutých pouličních bojů byl Bělehrad 20. října 1944 osvobozen. Sovětské velení omezilo těžké dělostřelectvo, aby ochránilo historická centra – za cenu mnoha vojáků. Josip Broz Tito slavnostně vstoupil do osvobozeného hlavního města. Osvobozením Bělehradu byl zlomen německý vliv na Balkáně." },
];

// ─── NÁHODNÉ UDÁLOSTI ────────────────────────────────────────────────────────

const REVENTS = [
  { id:"rep",  log:"💀 Německé odvetné popravy civilistů. Morálka -12.",   apply:g=>({...g,morale:Math.max(0,g.morale-12)}) },
  { id:"vol",  log:"💪 Dobrovolníci +5 bojovníků, morálka +5.",            apply:g=>({...g,fighters:g.fighters+5,morale:Math.min(100,g.morale+5)}) },
  { id:"air",  log:"📦 Britský výsadek zásob: +4 zásoby, +2 bojovníci.", cond:g=>g.turn>=5||g.british, apply:g=>({...g,resources:Math.min(20,g.resources+4),fighters:g.fighters+2}) },
  { id:"chH",  log:"🗡️ Četnická pomoc: +3 bojovníci, +1 kontrola v horách.", apply:g=>{const r={...g.regions};["zap","jiz"].forEach(id=>{if(r[id]?.control>=0)r[id]={...r[id],control:Math.min(5,r[id].control+1)}});return{...g,regions:r,fighters:g.fighters+3}} },
  { id:"chB",  log:"💔 Četnická zrada! Základna prozrazena. -3 bojovníci.",  apply:g=>{const r={...g.regions};const t=["zap","jiz"].find(id=>r[id]?.bases>0);if(t)r[t]={...r[t],bases:Math.max(0,r[t].bases-1)};return{...g,regions:r,fighters:Math.max(0,g.fighters-3)}} },
  { id:"ty",   log:"🤒 Tyfová epidemie: -4 bojovníci, morálka -5.",         apply:g=>({...g,fighters:Math.max(0,g.fighters-4),morale:Math.max(0,g.morale-5)}) },
  { id:"bbc",  log:"📻 BBC vysílá o jugoslávském odboji. Morálka +8.",     cond:g=>g.turn>=4, apply:g=>({...g,morale:Math.min(100,g.morale+8)}) },
  { id:"ger",  log:"🪖 Německé posily v jedné oblasti: garrison +2.",        apply:g=>{const r={...g.regions};const ids=Object.keys(r).filter(id=>r[id].control<=0&&id!=="belehrad");const t=ids[Math.floor(Math.random()*ids.length)];if(t)r[t]={...r[t],garrison:Math.min(6,r[t].garrison+2)};return{...g,regions:r}} },
  { id:"ussr", log:"🚂 Sovětské zásoby přes Turecko: +3 zásoby.",          cond:g=>g.turn>=10, apply:g=>({...g,resources:Math.min(20,g.resources+3)}) },
];

// ─── KARTY ───────────────────────────────────────────────────────────────────

const CARDS = [
  { id:"atk", name:"Partyzánský útok", icon:"⚔️", cost:2, n:3, reg:true,  ac:"#7a1515", desc:"Útok na oblast. P-hod+terén+bojovníci vs N-hod+garrison. Bělehrad bez Rudé armády: -4 penalty." },
  { id:"sab", name:"Sabotáž",          icon:"💣", cost:1, n:3, reg:true,  ac:"#6b5500", desc:"Garrison -2 (hod ≥ 4 s terénním mod.). Střed. Srbsko: +2 zásoby navíc." },
  { id:"rec", name:"Nábor",            icon:"👥", cost:0, n:3, reg:false, ac:"#1a5a1a", desc:"+4 bojovníci +1 za každou vaši oblast (kontrola ≥ +1)." },
  { id:"bas", name:"Základna",         icon:"🏕️", cost:2, n:2, reg:true,  ac:"#2a5a1a", desc:"Základna v oblasti (+2 obrana). Nutná kontrola ≥ 0. V horách +1. Max 2/oblast." },
  { id:"prp", name:"Propaganda",       icon:"📢", cost:1, n:2, reg:true,  ac:"#1a1a7a", desc:"Morálka +10, kontrola +1 v oblasti. Zvyšuje vliv na civilisty." },
  { id:"sup", name:"Zásoby",           icon:"✈️", cost:0, n:2, reg:false, ac:"#1a3a7a", desc:"+5 zásoby, +2 bojovníci (spojenecká pomoc z Londýna)." },
  { id:"int", name:"Výzvědci",         icon:"🕵️",cost:1, n:2, reg:false, ac:"#4a1a6a", desc:"Informátoři v Abwehru – příští německá fáze přeskočena." },
  { id:"dip", name:"Spojenecká mise",  icon:"🤝", cost:1, n:2, reg:false, ac:"#6a4000", desc:"+4 bojovníci. Aktivuje britské zásoby. Kontrola +1 v horách." },
];

// ─── POMOCNÉ FUNKCE ───────────────────────────────────────────────────────────

let _uid = 1;
const nuid = () => _uid++;
const d6 = () => Math.floor(Math.random()*6)+1;
const shuf = a => { const b=[...a]; for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]];}return b; };

function mkDeck() { return shuf(CARDS.flatMap(c=>Array.from({length:c.n},()=>({...c,_uid:nuid()})))); }

function mkRegions() {
  return Object.fromEntries(REGIONS.map(rd=>[rd.id,{...rd,control:rd.sc,garrison:rd.sg,bases:rd.sb,fortified:!!rd.isCapital}]));
}

function mkGame() {
  const deck=mkDeck();
  return {
    regions:mkRegions(), morale:62, fighters:8, resources:6,
    turn:1, maxTurns:12, phase:"event",
    deck:deck.slice(4), hand:deck.slice(0,4),
    actionsLeft:2, skipGerman:false, redArmy:false, british:false, over:null,
    log:["══════════════════════════════","🎮 JOGURTOSLÁVIE — 1941–1944","🎯 Cíl: Bělehrad + 2 oblasti (kontrola ≥+3) do tahu 12","⚠️  Bělehrad: nutná Rudá armáda (přijde v tahu 11)!","══════════════════════════════"],
  };
}

const addLog = (g,m) => ({...g, log:[m,...g.log]});

function checkVC(g) {
  if (g.morale<=0) return "lose";
  const lib=Object.values(g.regions).filter(r=>r.control>=3);
  const bOk=g.regions.belehrad?.control>=3;
  if (bOk && lib.length>=3) return "win";
  if (g.turn>g.maxTurns) return (bOk&&lib.length>=3)?"win":"lose";
  return null;
}

function ctrlColor(ctrl, isCapital, fortified) {
  if (isCapital && fortified) return ctrl<=-4?"#4a0000":"#6a0a0a";
  if (ctrl<=-4) return "#8B0000";
  if (ctrl<=-3) return "#AA1111";
  if (ctrl<=-2) return "#CC3322";
  if (ctrl<=-1) return "#CC6633";
  if (ctrl===0) return "#887755";
  if (ctrl<=2)  return "#447733";
  return "#226622";
}

// ─── HERNÍ LOGIKA ─────────────────────────────────────────────────────────────

function runEvent(g) {
  const td=TURNS.find(t=>t.n===g.turn);
  let g2={...g,regions:{...g.regions}};
  if (td?.fApply) { g2=td.fApply({...g2,regions:{...g2.regions}}); g2=addLog(g2,td.fLog); }
  // Random event: always for non-historical turns, 55% for historical
  if (!td?.hist||Math.random()>0.45) {
    const pool=REVENTS.filter(e=>!e.cond||e.cond(g2));
    if (pool.length) { const ev=pool[Math.floor(Math.random()*pool.length)]; g2=ev.apply({...g2,regions:{...g2.regions}}); g2=addLog(g2,ev.log); }
  }
  g2=addLog(g2,`📜 Tah ${g.turn} — ${td?.date||"?"}: ${td?.short||"Událost"}`);
  g2.phase="german";
  const r=checkVC(g2); if(r) g2.over=r;
  return g2;
}

function runGerman(g) {
  if (g.skipGerman) { let n=addLog({...g,skipGerman:false},"🕵️ Výzvědci zmátli Abwehr – německá fáze přeskočena!"); n.phase="player"; n.actionsLeft=2; return n; }
  let g2={...g,regions:{...g.regions}};
  const ids=Object.keys(g2.regions);
  // 1. Reinforce weakest German zone
  const gz=ids.filter(id=>g2.regions[id].control<=0).sort((a,b)=>g2.regions[a].garrison-g2.regions[b].garrison);
  if (gz.length) {
    const t=gz[0]; const amt=g.turn<=5?2:1;
    g2.regions[t]={...g2.regions[t],garrison:Math.min(6,g2.regions[t].garrison+amt)};
    g2=addLog(g2,`🪖 Wehrmacht posílil ${g2.regions[t].name} (garrison +${amt})`);
  }
  // 2. Attack most partisan-controlled region
  const pz=ids.filter(id=>g2.regions[id].control>0&&id!=="belehrad").sort((a,b)=>g2.regions[b].control-g2.regions[a].control);
  if (pz.length) {
    const tid=pz[0]; const reg=g2.regions[tid]; const ter=TER[reg.ter||reg.terrain||"mixed"];
    const extra=reg.id==="banat"?1:0;
    const gR=d6()+ter.gM+Math.floor(reg.garrison*0.8)+extra;
    const pR=d6()+ter.pM+reg.bases*2+Math.min(3,Math.floor(g2.fighters/4));
    if (gR>pR) {
      const nc=Math.max(-5,reg.control-2); let nb=reg.bases;
      if (nc<reg.control&&nb>0) {
        if (reg.id==="jiz"&&nb<=1) nb=1;
        else if (ter.pM>0) nb=Math.max(0,nb-1);
        else nb=Math.max(0,nb-Math.round(Math.random()));
      }
      g2.regions[tid]={...reg,control:nc,bases:nb};
      g2=addLog(g2,`⚔️ ${reg.name}: Němci ${gR} > Partyzáni ${pR} → NĚMCI. Kont.${reg.control}→${nc}${nb<reg.bases?" 🏕️zničena":""}`);
    } else {
      g2=addLog(g2,`🛡️ ${reg.name}: Němci ${gR} ≤ Partyzáni ${pR} → ODRAŽENI!`);
    }
  }
  // 3. Occupation pressure
  const tot=ids.reduce((s,id)=>s+g2.regions[id].garrison,0);
  if (tot>13) { g2.morale=Math.max(0,g2.morale-3); g2=addLog(g2,`😰 Těžká okupace (${tot} garrison celkem) – morálka -3`); }
  g2.phase="player"; g2.actionsLeft=2;
  const r=checkVC(g2); if(r) g2.over=r;
  return g2;
}

function playCard(g, card, rid) {
  if (g.resources<card.cost) return addLog(g,`❌ Nedostatek zásob (máte ${g.resources}, potřeba ${card.cost})`);
  if (card.reg&&!rid) return addLog(g,`❌ Vyberte oblast pro kartu: ${card.name}`);
  let g2={...g,regions:{...g.regions},resources:g.resources-card.cost};
  const reg=rid?g2.regions[rid]:null;
  const ter=reg?TER[reg.ter||reg.terrain||"mixed"]:null;
  let msg="";
  switch(card.id) {
    case "atk": {
      const fort=(rid==="belehrad"&&g2.regions.belehrad?.fortified!==false)?-4:0;
      const redB=(rid==="belehrad"&&g2.redArmy)?+4:0;
      const pR=d6()+ter.pM+Math.min(4,Math.floor(g2.fighters/2))+fort+redB;
      const gR=d6()+ter.gM+reg.garrison+(rid==="banat"?1:0);
      if (pR>gR) {
        g2.regions[rid]={...reg,control:Math.min(5,reg.control+2),garrison:Math.max(0,reg.garrison-1),fortified:false};
        g2.fighters=Math.max(0,g2.fighters-1);
        msg=`⚔️ Útok ${reg.name}: P${pR} > N${gR} → ÚSPĚCH! Kontrola +2, garrison -1.`;
      } else { g2.fighters=Math.max(0,g2.fighters-2); msg=`⚔️ Útok ${reg.name}: P${pR} ≤ N${gR} → Neúspěch. -2 bojovníci.`; }
      break;
    }
    case "sab": {
      const r=d6()+ter.pM;
      if (r>=4) {
        const ex=rid==="stred"?2:0;
        g2.regions[rid]={...reg,garrison:Math.max(0,reg.garrison-2)};
        g2.resources+=ex;
        msg=`💣 Sabotáž ${reg.name} (${r}): Úspěch! Garrison -2.${ex?` +2 zásoby.`:""}`;
      } else { g2.fighters=Math.max(0,g2.fighters-1); msg=`💣 Sabotáž ${reg.name} (${r}<4): Neúspěch. -1 bojovník.`; }
      break;
    }
    case "rec": { const b=Object.values(g2.regions).filter(r=>r.control>=1).length; g2.fighters+=4+b; msg=`👥 Nábor: +${4+b} bojovníků (4 + ${b} z oblastí).`; break; }
    case "bas": {
      if (reg.control<0) { g2.resources+=card.cost; return addLog(g2,`❌ ${reg.name}: Nutná kontrola ≥ 0 pro základnu.`); }
      if (reg.bases>=2)  { g2.resources+=card.cost; return addLog(g2,`❌ ${reg.name}: Maximálně 2 základny.`); }
      g2.regions[rid]={...reg,bases:reg.bases+1};
      msg=`🏕️ Základna v ${reg.name}${ter.pM>0?" (horský bonus +1 obrana)":""}.`;
      break;
    }
    case "prp": { g2.morale=Math.min(100,g2.morale+10); g2.regions[rid]={...reg,control:Math.min(5,reg.control+1)}; msg=`📢 Propaganda v ${reg.name}: Morálka +10, kontrola +1.`; break; }
    case "sup": { g2.resources+=5; g2.fighters+=2; msg=`✈️ Zásoby dorazily: +5 zásoby, +2 bojovníci.`; break; }
    case "int": { g2.skipGerman=true; msg=`🕵️ Výzvědci aktivní – příští německá fáze přeskočena!`; break; }
    case "dip": {
      g2.fighters+=4;
      if(!g2.british){g2.british=true;g2.resources=Math.min(20,g2.resources+3);}
      const mz=["zap","jiz"].filter(id=>g2.regions[id].control>=0);
      mz.forEach(id=>{g2.regions[id]={...g2.regions[id],control:Math.min(5,g2.regions[id].control+1)}});
      msg=`🤝 Spojenecká mise: +4 bojovníci${mz.length?`, +1 kontrola v horách`:""}.`;
      break;
    }
    default: msg=`${card.name} použita.`;
  }
  g2.hand=g2.hand.filter(c=>c._uid!==card._uid);
  if(g2.deck.length>0){g2.hand=[...g2.hand,g2.deck[0]];g2.deck=g2.deck.slice(1);}
  g2.actionsLeft-=1;
  g2=addLog(g2,`   ↳ ${msg}`);
  g2=addLog(g2,`🃏 ${card.icon} ${card.name} hrána`);
  const r=checkVC(g2); if(r) g2.over=r;
  return g2;
}

function endTurn(g) {
  let g2={...g,regions:{...g.regions}};
  const bon=[];
  if(g2.regions.vych?.control>0){g2.resources=Math.min(20,g2.resources+1);bon.push("Vých.Srbsko +1 zásoby");}
  if(g2.regions.belehrad?.control>=3){g2.morale=Math.min(100,g2.morale+5);bon.push("Bělehrad +5 morálka");}
  if(g2.british&&g2.turn>=9){g2.resources=Math.min(20,g2.resources+2);bon.push("Brit.mise +2 zásoby");}
  if(bon.length) g2=addLog(g2,`💰 Konec tahu: ${bon.join(", ")}`);
  g2.turn+=1; g2.phase="event";
  const r=checkVC(g2); if(r) g2.over=r;
  return g2;
}

// ─── SVG MAPA ─────────────────────────────────────────────────────────────────

function SerbiaMap({regions, selCard, onRegion, onHover, hovered, redArmy}) {
  const canClick=!!selCard?.reg;
  return (
    <svg viewBox="0 0 500 510" style={{width:"100%",height:"100%",display:"block"}}>
      <defs>
        <filter id="glow"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <pattern id="hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="6" stroke="#ffffff18" strokeWidth="1.5"/>
        </pattern>
      </defs>

      {/* Background */}
      <rect width="500" height="510" fill="#14120a"/>
      <rect width="500" height="510" fill="url(#hatch)" opacity="0.4"/>

      {/* Neighbor labels */}
      {[["Maďarsko",52,52],["Rumunsko",408,28],["Chorvatsko",10,200],["Bulharsko",413,430],["Čer. Hora",12,448],["Albánie",190,502]].map(([n,x,y])=>(
        <text key={n} x={x} y={y} fill="#3a3820" fontSize="10" fontStyle="italic" pointerEvents="none">{n}</text>
      ))}

      {/* Regions */}
      {REGIONS.map(rd => {
        const rs=regions[rd.id]; if(!rs) return null;
        const isFort=rs.isCapital&&rs.fortified!==false;
        const fill=ctrlColor(rs.control,!!rs.isCapital,isFort);
        const isHov=hovered===rd.id;
        const isClick=canClick;
        const strokeCol=isClick?"#44ff8844":isHov?"#ccaa6644":"#1a180a66";
        const sw=isClick||isHov?2.5:1.2;
        const ter=TER[rd.ter];

        return (
          <g key={rd.id}
            onClick={()=>isClick&&onRegion(rd.id)}
            onMouseEnter={()=>onHover(rd.id)}
            onMouseLeave={()=>onHover(null)}
            style={{cursor:isClick?"pointer":"default"}}
          >
            {/* Clickable glow */}
            {isClick&&<path d={rd.path} fill="none" stroke="#44ff88" strokeWidth={12} opacity={0.12}/>}
            {/* Main fill */}
            <path d={rd.path} fill={fill} stroke={strokeCol} strokeWidth={sw} opacity={0.8}/>
            {/* Hover highlight */}
            {isHov&&<path d={rd.path} fill="#ffffff" stroke="none" opacity={0.06}/>}

            {/* Region name */}
            <text x={rd.lx} y={rd.ly} textAnchor="middle" fill="#ffffffdd" fontSize={rd.isCapital?8:10} fontWeight="bold" pointerEvents="none"
              style={{textShadow:"0 1px 3px #000"}}>
              {rd.name}
            </text>

            {/* Control + garrison line */}
            <text x={rd.lx} y={rd.ly+13} textAnchor="middle"
              fill={rs.control>0?"#88ff88":rs.control<0?"#ff8888":"#cccc88"}
              fontSize={8} pointerEvents="none">
              {rs.control>0?`+${rs.control}`:rs.control} · 🪖{rs.garrison}{rs.bases>0?` ${"🏕".repeat(rs.bases)}`:""}
            </text>

            {/* City dot */}
            <circle cx={rd.cx} cy={rd.cy} r={rd.isCapital?5.5:3.5}
              fill={rd.isCapital?"#ffd700":"#ffffffaa"}
              stroke={rd.isCapital?"#ff8800":"#00000088"}
              strokeWidth={rd.isCapital?1.5:0.8}
              filter={rd.isCapital?"url(#glow)":"none"}
              pointerEvents="none"/>

            {/* Terrain icon */}
            <text x={rd.lx+(rd.isCapital?20:28)} y={rd.ly} fontSize={9} fill="#ffffff55" pointerEvents="none">{ter.icon}</text>

            {/* Lock for fortified Belgrade */}
            {isFort&&<text x={rd.lx} y={rd.ly-14} textAnchor="middle" fontSize={14} pointerEvents="none">🔒</text>}
          </g>
        );
      })}

      {/* Legend */}
      <rect x="5" y="420" width="122" height="84" rx="5" fill="#00000099" stroke="#33311a88"/>
      <text x="12" y="434" fill="#c9a84c" fontSize="8" fontWeight="bold" letterSpacing="1">LEGENDA</text>
      {[["#8B0000","Pevná německá kontrola"],["#CC6633","Sporné území"],["#887755","Neutrální"],["#447733","Partyzánská oblast"],["#226622","Osvobozeno ✓"]].map(([c,l],i)=>(
        <g key={i}><rect x="10" y={440+i*12} width="9" height="8" fill={c} rx="1.5"/><text x="24" y={447+i*12} fill="#aaaaaa" fontSize="7">{l}</text></g>
      ))}
    </svg>
  );
}

// ─── BARVY ───────────────────────────────────────────────────────────────────

const C = {
  bg:"#0d0d08", surf:"#161610", surfA:"#1c1c14", bord:"#2a2a18",
  gold:"#c9a84c", goldD:"#8a6e2a", red:"#c94040", grn:"#4a9a4a", blu:"#4a7aaa",
  txt:"#d0cdb8", mut:"#7a7860", dim:"#4a4838",
};

// ─── HLAVNÍ KOMPONENTA ────────────────────────────────────────────────────────

export default function Jogurtoslavie() {
  const [G, setG]     = useState(mkGame);
  const [sel, setSel] = useState(null);   // vybraná karta
  const [hov, setHov] = useState(null);   // hoveredRegion
  const [hturn, setHTurn] = useState(1);  // historický panel – zobrazovaný tah
  const [tab, setTab] = useState("hist"); // "hist" | "diary"
  const [help, setHelp] = useState(false);

  const td  = TURNS.find(t=>t.n===G.turn)||TURNS[0];
  const htd = TURNS.find(t=>t.n===hturn)||TURNS[0];

  const handlePhase = () => {
    if (G.phase==="event") setHTurn(G.turn);
    setG(g => {
      if (g.over) return g;
      if (g.phase==="event")  return runEvent(g);
      if (g.phase==="german") return runGerman(g);
      if (g.phase==="player") return endTurn(g);
      return g;
    });
    setSel(null);
  };

  const handleCard = (card) => {
    if (G.phase!=="player"||G.actionsLeft<=0||G.over) return;
    if (!card.reg) { setG(g=>playCard(g,card,null)); setSel(null); }
    else setSel(p=>p?._uid===card._uid?null:card);
  };

  const handleRegion = (rid) => {
    if (!sel||G.phase!=="player"||G.actionsLeft<=0) return;
    setG(g=>playCard(g,sel,rid)); setSel(null);
  };

  const lib = Object.values(G.regions).filter(r=>r.control>=3).length;
  const bCtrl = G.regions.belehrad?.control ?? -5;
  const isFort = G.regions.belehrad?.fortified!==false;

  const phLabel = {event:"📜 Fáze událostí", german:"🪖 Německá fáze", player:`🎯 Vaše fáze — ${G.actionsLeft} akce`}[G.phase];
  const phBtn   = {event:"▶ Táhnout událost", german:"▶ Němci jednají", player:G.actionsLeft>0?"⏩ Přeskočit akce":"▶ Ukončit tah"}[G.phase];

  // ── GAME OVER ──────────────────────────────────────────────────────────────
  if (G.over) {
    const win=G.over==="win";
    return (
      <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:C.bg,fontFamily:"'Palatino Linotype',Georgia,serif"}}>
        <div style={{textAlign:"center",padding:"52px 44px",borderRadius:18,background:C.surf,border:`3px double ${win?C.grn:C.red}`,maxWidth:540,boxShadow:`0 0 60px ${win?C.grn:C.red}44`}}>
          <div style={{fontSize:80,marginBottom:16}}>{win?"🏆":"💀"}</div>
          <div style={{fontSize:11,letterSpacing:5,color:C.mut,marginBottom:8,textTransform:"uppercase"}}>{win?"Vítězství odboje":"Kolaps odboje"}</div>
          <h1 style={{fontSize:30,color:win?C.grn:C.red,margin:"0 0 16px",letterSpacing:3}}>{win?"JUGOSLÁVIE OSVOBOZENA!":"ODBOJ POTLAČEN"}</h1>
          <p style={{color:C.txt,lineHeight:1.8,fontSize:13,marginBottom:20,maxWidth:420,margin:"0 auto 20px"}}>
            {win ? "Rudá armáda a Titovi partyzáni osvobodili Bělehrad 20. října 1944. Josip Broz Tito vstoupil do hlavního města jako maršál Jugoslávie. Německý vliv na Balkáně byl zlomen."
                 : "Německé divize rozdrtily partyzánský odboj. Gestapo pátrá po přeživších. Ale v horách Dinárských Alp stále hoří ohýnky – boj nekončí."}
          </p>
          <div style={{display:"flex",justifyContent:"center",gap:16,fontSize:11,color:C.mut,marginBottom:28,flexWrap:"wrap"}}>
            <span>📅 Tah {G.turn}</span><span>❤️ Morálka {G.morale}</span><span>⚔️ Bojovníci {G.fighters}</span><span>🚩 Oblasti {lib}/6</span>
          </div>
          <button onClick={()=>{setG(mkGame());setSel(null);setHTurn(1);}}
            style={{padding:"11px 30px",borderRadius:9,background:win?"#1a3a1a":"#2a1a1a",color:win?C.grn:C.red,border:`2px solid ${win?C.grn:C.red}`,cursor:"pointer",fontWeight:"bold",fontSize:14,letterSpacing:2}}>
            ↺ HRÁT ZNOVU
          </button>
        </div>
      </div>
    );
  }

  // ── HLAVNÍ UI ──────────────────────────────────────────────────────────────
  return (
    <div style={{height:"100vh",background:C.bg,fontFamily:"'Palatino Linotype',Georgia,serif",color:C.txt,display:"flex",flexDirection:"column",fontSize:13,overflow:"hidden"}}>

      {/* ═══ HEADER ═══ */}
      <div style={{background:C.surf,borderBottom:`2px solid ${C.bord}`,padding:"7px 14px",display:"flex",alignItems:"center",gap:10,flexWrap:"wrap",flexShrink:0}}>
        <div style={{marginRight:6}}>
          <span style={{fontSize:20,fontWeight:"bold",color:C.gold,letterSpacing:2,textTransform:"uppercase"}}>JOGURTOSLÁVIE</span>
          <span style={{marginLeft:10,fontSize:10,color:C.mut,fontFamily:"monospace"}}>
            Tah {G.turn}/{G.maxTurns} · {td.date}
            {G.redArmy&&<span style={{marginLeft:8,color:"#ff6666"}}>🔴 Rudá armáda aktivní</span>}
            {G.british&&!G.redArmy&&<span style={{marginLeft:8,color:C.blu}}>🇬🇧 Brit. mise</span>}
          </span>
        </div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginLeft:"auto"}}>
          {[["❤️","Morálka",G.morale,G.morale<30?C.red:G.morale<60?"#cc8822":C.grn],
            ["⚔️","Bojovníci",G.fighters,C.gold],
            ["📦","Zásoby",G.resources,C.blu],
            ["🚩","Osl. oblasti",`${lib}/6`,lib>=3?C.grn:C.gold]
          ].map(([ic,lb,val,col])=>(
            <div key={lb} style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"3px 9px",borderRadius:5,background:C.surfA,border:`1px solid ${C.bord}`}}>
              <span style={{fontSize:9,color:C.mut}}>{ic} {lb}</span>
              <span style={{fontSize:15,fontWeight:"bold",color:col,fontFamily:"monospace"}}>{val}</span>
            </div>
          ))}
        </div>
        <button onClick={()=>setHelp(v=>!v)} style={{padding:"4px 10px",borderRadius:5,background:C.surfA,color:C.gold,border:`1px solid ${C.bord}`,cursor:"pointer",fontSize:11}}>❓ Pravidla</button>
        <button onClick={()=>{setG(mkGame());setSel(null);setHTurn(1);}} style={{padding:"4px 10px",borderRadius:5,background:"#1f0a0a",color:C.red,border:"1px solid #4a1a1a",cursor:"pointer",fontSize:11}}>↺ Restart</button>
      </div>

      {/* ═══ TĚLO ═══ */}
      <div style={{flex:1,display:"flex",overflow:"hidden",minHeight:0}}>

        {/* ── LEVÝ PANEL: MAPA (Zvětšeno - nyní používá flex, aby zabralo většinu místa) ── */}
        <div style={{flex: 1.5, minWidth: 450, display:"flex",flexDirection:"column",borderRight:`2px solid ${C.bord}`}}>
          <div style={{flex:1,overflow:"hidden"}}>
            <SerbiaMap regions={G.regions} selCard={sel} onRegion={handleRegion} onHover={setHov} hovered={hov} redArmy={G.redArmy}/>
          </div>

          {/* Hover tooltip */}
          {hov&&(()=>{
            const rd=REGIONS.find(r=>r.id===hov);
            const rs=G.regions[hov];
            if(!rd||!rs) return null;
            const ter=TER[rd.ter];
            return (
              <div style={{padding:"8px 12px",borderTop:`1px solid ${C.bord}`,background:"#0d0d07",flexShrink:0}}>
                <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:3}}>
                  <span style={{fontSize:12,fontWeight:"bold",color:C.gold}}>{rs.name}</span>
                  <span style={{fontSize:10,color:ter.pM>0?"#88ee88":ter.pM<0?"#ee8888":C.mut,background:C.surfA,padding:"1px 6px",borderRadius:3}}>{ter.icon} {ter.label}</span>
                </div>
                <div style={{fontSize:9,color:C.mut,lineHeight:1.5,marginBottom:3}}>{ter.desc}</div>
                <div style={{fontSize:9,color:C.gold+"88",fontStyle:"italic"}}>{rs.sp}</div>
              </div>
            );
          })()}

          {/* Fáze + ovládání */}
          <div style={{padding:"9px 12px",borderTop:`1px solid ${C.bord}`,background:C.surf,flexShrink:0}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:7}}>
              <span style={{fontSize:12,fontWeight:"bold",color:C.gold}}>{phLabel}</span>
              {sel&&<span style={{fontSize:10,color:C.grn,animation:"pulse 1s infinite"}}>→ Klikněte na oblast</span>}
            </div>

            {/* Morálka bar */}
            <div style={{marginBottom:5}}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:9,color:C.mut,marginBottom:2}}>
                <span>Morálka odboje</span><span>{G.morale}%</span>
              </div>
              <div style={{height:5,background:"#222",borderRadius:3,overflow:"hidden"}}>
                <div style={{height:"100%",width:`${G.morale}%`,background:G.morale>50?C.grn:G.morale>25?"#cc8822":C.red,transition:"width 0.5s"}}/>
              </div>
            </div>

            {/* Bělehrad bar */}
            <div style={{marginBottom:8}}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:9,color:C.mut,marginBottom:2}}>
                <span>Bělehrad {isFort?"🔒 čeká na Rudou armádu":"🔓 odemčen"}</span>
                <span style={{color:bCtrl>=3?C.grn:bCtrl>0?"#cc8822":C.red}}>{bCtrl>0?`+${bCtrl}`:bCtrl}/5</span>
              </div>
              <div style={{height:5,background:"#222",borderRadius:3,overflow:"hidden"}}>
                <div style={{height:"100%",width:`${((bCtrl+5)/10)*100}%`,background:bCtrl>=3?C.grn:bCtrl>0?"#cc8822":C.red,transition:"width 0.5s"}}/>
              </div>
            </div>

            <button onClick={handlePhase}
              style={{width:"100%",padding:"8px",borderRadius:7,background:G.phase==="player"?"#112211":"#111128",color:C.gold,border:`2px solid ${C.goldD}`,cursor:"pointer",fontWeight:"bold",fontSize:12,letterSpacing:1}}>
              {phBtn}
            </button>

            {/* Tah tečky */}
            <div style={{display:"flex",justifyContent:"center",gap:4,marginTop:7,flexWrap:"wrap"}}>
              {Array.from({length:12}).map((_,i)=>(
                <div key={i} style={{width:8,height:8,borderRadius:"50%",
                  background:i<G.turn-1?C.goldD:i===G.turn-1?C.gold:C.bord,
                  transition:"background 0.3s",
                  boxShadow:i===G.turn-1?`0 0 6px ${C.gold}`:"none"}}
                  title={TURNS[i]?.date}/>
              ))}
            </div>
            <div style={{textAlign:"center",fontSize:8,color:C.dim,marginTop:3}}>{td.date} — {td.short}</div>
          </div>
        </div>

        {/* ── STŘED: KARTY (Zúženo na 210px) ── */}
        <div style={{width:210,flexShrink:0,display:"flex",flexDirection:"column",borderRight:`2px solid ${C.bord}`}}>
          <div style={{padding:"6px 10px",borderBottom:`1px solid ${C.bord}`,background:C.surf,flexShrink:0}}>
            <span style={{fontSize:10,fontWeight:"bold",color:C.gold,letterSpacing:2,textTransform:"uppercase"}}>🃏 Karty ({G.hand.length})</span>
          </div>
          <div style={{flex:1,padding:7,overflow:"auto",display:"flex",flexDirection:"column",gap:5}}>
            {G.hand.length===0&&<div style={{color:C.dim,fontSize:11,textAlign:"center",paddingTop:20,lineHeight:1.8}}>Žádné karty<br/><span style={{fontSize:9}}>Balíček vyčerpán.</span></div>}
            {G.hand.map(card => {
              const isSel=sel?._uid===card._uid;
              const dis=G.phase!=="player"||G.actionsLeft<=0;
              return (
                <div key={card._uid} onClick={dis?undefined:()=>handleCard(card)}
                  style={{display:"flex",alignItems:"flex-start",gap:7,padding:"8px 9px",borderRadius:7,
                    background:isSel?"#162416":C.surf,
                    border:`1px solid ${isSel?C.grn:card.ac+"66"}`,
                    cursor:dis?"not-allowed":"pointer",
                    opacity:dis?0.38:1,
                    boxShadow:isSel?`0 0 12px ${C.grn}44`:"none",
                    transition:"all 0.2s"}}>
                  <span style={{fontSize:18,flexShrink:0,paddingTop:1}}>{card.icon}</span>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:11,fontWeight:"bold",color:C.gold,marginBottom:2}}>{card.name}</div>
                    <div style={{fontSize:9,color:C.mut,lineHeight:1.4}}>{card.desc}</div>
                  </div>
                  <div style={{flexShrink:0,fontSize:10,fontWeight:"bold",color:card.cost===0?C.grn:C.blu,paddingTop:2,whiteSpace:"nowrap"}}>
                    {card.cost===0?"FREE":`📦 ${card.cost}`}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── PRAVÝ PANEL: FAKTA + DENÍK (Zmenšen a omezen na šířku) ── */}
        <div style={{flex: 0.8, minWidth: 250, maxWidth: 350, display:"flex",flexDirection:"column"}}>

          {/* Tabs */}
          <div style={{display:"flex",borderBottom:`1px solid ${C.bord}`,background:C.surf,flexShrink:0}}>
            {[["hist","📚 Historická fakta"],["diary","📋 Deník akcí"]].map(([key,label])=>(
              <button key={key} onClick={()=>setTab(key)}
                style={{flex:1,padding:"7px 6px",background:tab===key?C.surfA:"transparent",color:tab===key?C.gold:C.mut,
                  border:"none",borderBottom:tab===key?`2px solid ${C.gold}`:"2px solid transparent",
                  cursor:"pointer",fontSize:10,fontWeight:"bold",letterSpacing:1,textTransform:"uppercase"}}>
                {label}
              </button>
            ))}
          </div>

          {/* HISTORICKÁ FAKTA */}
          {tab==="hist"&&(
            <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
              {/* Navigace */}
              <div style={{padding:"6px 10px",borderBottom:`1px solid ${C.bord}`,display:"flex",alignItems:"center",gap:6,flexShrink:0,background:"#0d0d08"}}>
                <button onClick={()=>setHTurn(t=>Math.max(1,t-1))} disabled={hturn<=1}
                  style={{padding:"2px 8px",borderRadius:4,background:C.surfA,color:C.gold,border:`1px solid ${C.bord}`,cursor:hturn<=1?"default":"pointer",opacity:hturn<=1?0.35:1,fontSize:13}}>‹</button>
                <span style={{fontSize:9,color:C.mut,flex:1,textAlign:"center",fontFamily:"monospace"}}>📅 {htd.date} · Tah {hturn}</span>
                <button onClick={()=>setHTurn(t=>Math.min(G.turn,t+1))} disabled={hturn>=G.turn}
                  style={{padding:"2px 8px",borderRadius:4,background:C.surfA,color:C.gold,border:`1px solid ${C.bord}`,cursor:hturn>=G.turn?"default":"pointer",opacity:hturn>=G.turn?0.35:1,fontSize:13}}>›</button>
              </div>
              {/* Obsah */}
              <div style={{flex:1,overflow:"auto",padding:"10px 12px"}}>
                <div style={{fontSize:11,fontWeight:"bold",color:C.gold,marginBottom:4,lineHeight:1.5,letterSpacing:"0.3px"}}>{htd.hTitle}</div>
                {htd.hist&&<div style={{display:"inline-block",fontSize:9,color:"#88cc88",background:"#0a1a0a",border:"1px solid #1a3a1a",borderRadius:3,padding:"2px 7px",marginBottom:7,letterSpacing:1}}>HISTORICKÁ UDÁLOST</div>}
                <div style={{fontSize:11,color:"#c5c2a5",lineHeight:1.75}}>{htd.hText}</div>
              </div>
            </div>
          )}

          {/* DENÍK AKCÍ */}
          {tab==="diary"&&(
            <div style={{flex:1,overflow:"auto",padding:"8px 10px"}}>
              {G.log.map((entry,i)=>(
                <div key={i} style={{
                  fontSize:10,
                  color:i===0?C.txt:entry.startsWith("══")?C.goldD:C.mut,
                  marginBottom:i===0?6:3,
                  lineHeight:1.55,
                  borderLeft:i===0?`2px solid ${C.gold}`:entry.startsWith("📜")?`2px solid ${C.goldD}`:"none",
                  paddingLeft:i===0||entry.startsWith("📜")?7:0,
                  fontFamily:i===0?"inherit":"monospace",
                }}>
                  {entry}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* HELP MODAL */}
      {help&&(
        <div style={{position:"fixed",inset:0,background:"#000d",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200}} onClick={()=>setHelp(false)}>
          <div style={{background:C.surf,border:`2px solid ${C.gold}`,borderRadius:13,padding:28,maxWidth:540,maxHeight:"88vh",overflow:"auto",margin:16}} onClick={e=>e.stopPropagation()}>
            <h2 style={{color:C.gold,marginBottom:18,fontSize:17,letterSpacing:2}}>📖 PRAVIDLA — JOGURTOSLÁVIE</h2>
            {[
              ["🎯 Cíl vítězství","Osvobodit Bělehrad (kontrola ≥ +3) A alespoň 2 další oblasti (celkem 3+) do konce tahu 12."],
              ["🔒 Bělehrad","Bělehrad je silně opevněn. Útok bez Rudé armády: penalty -4 k hodu. Po příchodu Rudé armády (tah 11): penalty zmizí, garrison -3, Vých. Srbsko se uvolní. Sabotujte garrison předem!"],
              ["💀 Prohra","Morálka klesne na 0, nebo tah 12 skončí bez splnění cíle."],
              ["🔄 Fáze tahu","(1) Událost → historická nebo náhodná. (2) Němci → AI posílí a útočí. (3) Vy → 2 akce kartami. Pak nový tah."],
              ["⛰️ Terén","HORY (Záp./Již. Srbsko): Partyzáni +2, Němci -2. ROVINA (Banát): Němci +2, Partyzáni -1. KOPCE (Střed./Vých.): neutrální. MĚSTO (Bělehrad): Partyzáni -2, Němci +2."],
              ["🤝 Spojenci","Britská mise od tahu 9. Rudá armáda přichází v tahu 11 s +10 bojovníků a odblokuje Bělehrad. Bez SSSR je Bělehrad téměř nedobytný – to odpovídá historii!"],
              ["💡 Strategie","1. Nejdřív zabezpečte hory (Záp. a Již. Srbsko). 2. Sabotujte garrison ve Střed. Srbsku. 3. Čekejte na Rudou armádu (tah 11). 4. Finální útok na Bělehrad v tahu 11–12."],
            ].map(([t,txt])=>(
              <div key={t} style={{marginBottom:10,paddingBottom:10,borderBottom:`1px solid ${C.bord}`}}>
                <strong style={{color:C.gold}}>{t}: </strong>
                <span style={{color:C.txt,fontSize:12,lineHeight:1.7}}>{txt}</span>
              </div>
            ))}
            <button onClick={()=>setHelp(false)} style={{marginTop:8,padding:"7px 20px",borderRadius:6,background:"#1a1a0e",color:C.gold,border:`1px solid ${C.goldD}`,cursor:"pointer",fontSize:13}}>Zavřít</button>
          </div>
        </div>
      )}
    </div>
  );
}