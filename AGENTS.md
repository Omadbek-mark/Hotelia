# Hotelia backend — agent yo‘riqnomasi

## Ishlash tartibi

- Foydalanuvchiga o‘zbekcha tushuntiring. U loyihani o‘rganmoqda: bosqichdan keyin nima, nima uchun o‘zgargani va tekshiruv natijasini yozing.
- Avval tegishli mavjud kodni o‘qing. Katta ishni bosqichlarga bo‘ling; kelishilgan bosqich tugagach foydalanuvchi tekshiruvini kuting. Joriy topshiriq bu umumiy tartibdan ustun.
- Nestar’dan olingan module/resolver/service/schema uslubini saqlang. Ishlayotgan kodni sababsiz qayta yozmang, ortiqcha abstraksiya yoki kutubxona qo‘shmang.
- Favorites — LikeService, reviews — CommentService; room availability RoomService ichida qoladi. Mavjud yechimni domen uchun moslash yangi servis yaratishdan afzal.
- Bog‘liq DTO, schema, module import/export, authorization, counter va batch oqibatlarini birga tekshiring.
- Commit faqat foydalanuvchi so‘rasa; push, merge va deploy ham foydalanuvchi ko‘rsatmasi bilan. Boshqa o‘zgarishlarni qaytarmang.
- `.env`, token, parol, to‘liq MongoDB URI va SSH private key’ni javob, log yoki Git’ga chiqarmang. Jonli bazaga test yozuvi/migratsiyani topshiriqsiz kiritmang.

## Tuzilma va stack

- Bu mustaqil Hotelia backend repository’si. Frontend odatda yonidagi `../Hotelia-next`da. Eski Nestar kodi namuna; Hotelia kontraktining o‘rnini bosmaydi.
- Node versiyasi `package.json` engines’da: hozir 22.13+ yoki 24. npm va `package-lock.json` ishlatiladi; `--force`/`--legacy-peer-deps` bilan moslik xatolarini yashirmang.
- NestJS 12, TypeScript 6, GraphQL code-first, Apollo Server 5, Mongoose 8/MongoDB, JWT sessions.
- `apps/hotelia-api/src/components/<domain>/`: module, resolver, service. Faol modullarni `components.module.ts`dan tekshiring; legacy papkani ulangan deb taxmin qilmang.
- `apps/hotelia-api/src/schemas/`: Mongoose schema’lar; `src/libs/dto/<domain>/`: GraphQL input/output/inquiry; `src/libs/enums/`: enumlar.
- `src/libs/booking/`: sana, inventar va narx yordamchilari; `src/socket/`: ommaviy WebSocket chat.
- `apps/hotelia-batch/src/`: alohida jarayon, hotel/owner ranking. Booking auto-confirm API scheduler’ida ishlaydi.
- Domenlar: member/auth, hotel/room/booking/payment, like/view/comment/follow, board-article, support/notification, bo-config, chatbot.

## NestJS, GraphQL va MongoDB

- Resolver transport, guard va authenticated identity’ni uzatadi; biznes mantiq servisda. Member/owner identity’ni client payload’dan ishonib olmang.
- Model kerak bo‘lgan modulda `MongooseModule.forFeature` orqali ro‘yxatdan o‘tsin. Servis dependency’si uchun tegishli modulni import va provider’ni export qiling. Aylanma dependency yaratmang.
- AuthModule Member va Session modellarini bevosita ishlatadi; MemberService’ga aylanma bog‘liqlik qo‘shmang.
- Mongoose `Connection` kabi faqat type bo‘lgan importlar `import type` bo‘lsin; Nest 12 ESM bilan ishlaydi. Mavjud explicit injection decoratorlarini saqlang.
- GraphQL decoratorlari, DTO validation/transform va schema mos bo‘lsin. Profil update allowlist’i rol/status/statistikani qabul qilmasligi kerak.
- ObjectId uchun mavjud `shapeIntoMongoObjectId` yordamchisini ishlating; noto‘g‘ri ID’ni DB cast xatosidan oldin rad eting.
- Search regex’ida matnni escape qiling. Ownership/visibility/availability filtrlarini pagination/count’dan oldin bajaring; sort’da barqaror `_id` tie-breaker saqlang.
- List javobi `list` + `metaCounter`; page/limit chegaralari tegishli DTO’da. Yangi parallel pagination formatini kiritmang.
- Aggregation Mongoose `select: false`ga tayanmaydi: lookup’da explicit public member projection ishlating. `memberData` relation’dagi memberni anglatadi: hotelda owner, bookingda guest.
- Unique/partial indekslar va idempotent requestId’larni saqlang; faqat oldindan `find` bilan duplicate tekshirish yetmaydi.
- Biznes yozuvi va counter/notification hozir transaction’da bo‘lsa, bitta session’da qolsin. Replica set/Atlas kerak. Har oddiy view uchun yangi transaction qo‘shmang.
- Tegishli Nest exception qaytaring; infratuzilma xatosini credential xatosiga aylantirmang yoki umumiy catch bilan yashirmang.

## Domen qoidalari

- Rollar USER, HOTEL_OWNER, ADMIN. Owner faqat o‘z inventory/bookinglarini boshqaradi; admin amallari alohida guard/resolver orqali.
- Signup va parol update bcrypt ishlatadi. Access token 15 minut: `sub`, `sid`, `type=access`. Auth ACTIVE member va faol sessionni bazadan tekshiradi; JWT roli/profile’iga ishonmaydi.
- Refresh JWT emas: session ID + random secret; bazada hash. Session 7 kun, atomik rotation umumiy expiry’ni uzaytirmaydi. Logout shu sessionni bekor qiladi. WithoutGuard faqat UnauthorizedException’ni guest holatiga aylantiradi.
- `memberHotels` — DELETE qilinmagan ACTIVE + PAUSED hotellar soni. Create/delete bilan atomik o‘zgaradi; pause/resume uni o‘zgartirmaydi. `memberProperties` Hotelia hisoblagichi emas.
- Geografiya asosan Uzbekistan, Kazakhstan, Kyrgyzstan; mavjud country/city/timezone DTO/helper’lariga tayaning.
- Booking sanalari hotel-local `YYYY-MM-DD`, bazada UTC-midnight marker. Oraliq `[checkIn, checkOut)`; overlap start < otherEnd va end > otherStart. Yonma-yon bronlar overlap emas.
- `roomQuantity` fizik xonalar soni. Availability kunlar bo‘yicha eng kam qolgan miqdor; barcha overlap bronlarni ko‘r-ko‘rona qo‘shmang. Capacity `ceil(guests / rooms)`ga yetishi kerak.
- Narx USD. Nights, price snapshot va total backendda integer cents orqali hisoblanadi; frontend totaliga ishonmang. Booking UUID v4 requestId bilan idempotent.
- Yangi PENDING va CONFIRMED inventory band qiladi. 15 minut free cancellation; keyin auto-confirm. Deadline yangi bron inventarini bo‘shatmaydi. Guest keyin cancel qilsa 5% fee/refund; owner/admin cancel fee-free. Legacy compatibility yo‘lini saqlang.
- COMPLETED tegishli checkout sanasidan keyin; CANCELLED/COMPLETED terminal. Booking va room/hotel mutatsiyalari mavjud shared hotel lock/transaction tartibida qoladi.
- Payment demo: CEO_BANK_ACCOUNT default, BANK_CARD to‘lovi o‘chiq. Real charge/refund yo‘q. Card maskalashni saqlang; to‘liq PAN/CVV saqlamang yoki loglamang.
- Favorites `likes` kolleksiyasining HOTEL guruhi orqali. Alohida collection yaratmang. Save/remove idempotent; counter faqat real o‘zgarishda yangilanadi.
- Hotelga ratingsiz comment yozish authenticated rollarga ochiq. Rated review uchun bookingId va 1–5 integer rating birga beriladi; memberning COMPLETED bookingi tekshiriladi. Bir bookingga bitta review; faqat ACTIVE verified review’lar rating/count’ga kiradi.
- `hotelRank` likes + barcha ACTIVE HOTEL commentlaridan hisoblanadi; rating bilan aralashtirmang. `memberRank` alohida batch formulasi. Unique hotel view takrorlansa recency yangilanadi, counter oshmaydi.
- Notification listing/count/read authenticated receiver’ga tegishli. Booking/inventory/support hodisalari mavjud notification servisidan foydalanadi. Private inquiry ommaviy noticega aylanmasin.
- Ommaviy chat guestlarga ochiq native WebSocket/WsAdapter: Socket.IO emas. History/presence in-memory; private inbox bilan aralashtirmang. Gemini bot alohida GraphQL modulida, kalit faqat backendda.

## Buyruqlar va tekshiruv

```bash
npm ci
npm run start:dev
npm run start:dev:batch
npm test -- --runInBand --watchman=false
npx tsc --noEmit -p apps/hotelia-api/tsconfig.app.json
npx tsc --noEmit -p apps/hotelia-batch/tsconfig.app.json
npm run build -- hotelia-api
npm run build -- hotelia-batch
```

- Tegishli suite uchun `--runTestsByPath apps/hotelia-api/test/...` ishlating. Unit testlar jonli bazaga ulanmasin.
- `npm run test:booking:integration` opt-in vaqtinchalik MongoDB replica set ishlatadi; app `.env`ini ishlatmaydi, binary yuklashi mumkin.
- Jest ESM uchun scriptlardagi `--experimental-vm-modules` va `jest.setup.cjs`ni saqlang.
- `test:e2e` eski config yo‘liga ishora qiladi; config mavjudligini tekshirmasdan ishlaydi deb aytmang.
- Har kichik tahrirda barcha test/buildni qaytarmang. Tegishli tekshiruv yetarli; bajarilmaganini ochiq ayting. Hujjat tahririda link va diff tekshiruvi yetarli.
- Backend kontrakti o‘zgarsa frontendda `npm run contracts:sync` kerak bo‘lishi mumkin; generated fayllarni qo‘lda tahrirlamang.

## Deploy va hujjatlar

- `develop` — ish, `master` — production branch; PR orqali o‘tiladi. Bu hujjatning o‘zi merge/push/deploy ruxsati emas.
- Shared Ubuntu VPS Coolify/Traefik orqali boshqariladi. Alohida Nginx o‘rnatmang; umumiy Docker/proxy/firewall’ni topshiriqsiz o‘zgartirmang, boshqa loyihalarga tegmang.
- Dockerfile APP_NAME orqali API/batch’ni alohida quradi. Ichki port 3001; API uploads `/app/uploads` volume’da. `.env`/uploads image’ga kirmaydi.
- NODE_ENV=production MONGO_PROD’ni tanlaydi. Production baza Hotelia-Prod. Lokal sinov production yozuvlarini ishlatmasin; DB/uploads migratsiyasini deployga yashirin qo‘shmang.
- Rejalashtirilgan domenlar `hotelia.uz`, `api.hotelia.uz`, DNS Eskiz.uz. DNS/TLS/CORS yoki deployni tekshirmasdan tayyor deb e’lon qilmang.
- Docker buyruqlari: [docker-local.md](docs/docker-local.md). GitHub/Coolify ulash: [ci-cd.md](docs/ci-cd.md).
- Batafsil API: [booking](docs/booking-availability.md), [sessions](docs/auth-sessions.md), [favorites](docs/hotel-favorites.md), [reviews](docs/hotel-reviews.md), [support](docs/support-api.md), [follows](docs/follows.md), [journal](docs/board-articles.md), [views](docs/recently-viewed.md).
- Eski bosqichlarning test sonlari/deploy holati tarixiy; joriy kod va tekshiruv natijasi ustun.
