# Hotelia backend audit: Member / Auth / Hotel creation

Tekshiruv chegarasi: enumlar, Member schema/input/output, signup/login/profile/admin update,
member queries, Auth/guards, Hotel schema/DTO/module/resolver/createHotel va shu oqimdagi upload.
Nestar namunasi sifatida repodagi Property model/DTO/resolver/service hamda qolgan Member kodlari
solishtirildi. Alohida, ozgartirilmagan Nestar repozitoriysi bu workspace ichida yoq;
shuning uchun bu butun original repo bilan avtomatik diff emas.

## Taqqoslash va tuzatishlar

| Nestar oqimi | Hotelia holati |
| --- | --- |
| createProperty -> memberStatsEditor(memberProperties, +1) | createHotel -> memberStatsEditor(memberHotels, +1) tiklandi |
| PropertyModule imports MemberModule | HotelModule ham MemberModule import qiladi |
| Member schema + output hisoblagichi | memberHotels default 0, integer va min 0 bilan qoshildi |
| Ikki mustaqil yozuv | Hotel va Member bitta connection.transaction/session ichida yoziladi |
| HotelInput ichki ownerId | declare ownerId: runtime own-property yaratilmaydi; strict ValidationPipe bilan toqnashuv tuzatildi |
| Model<Property>, create(input), return result | Model<Hotel> va shu uslub saqlandi; tranzaksiyada create([input], {session}) kerak |
| Resolver memberId ni inputga beradi | ownerId faqat AuthMember orqali beriladi; GraphQL inputida ochilmagan |
| AGENT / getAgents / AgentsInquiry | HOTEL_OWNER / getHotelOwners / HotelOwnersInquiry |
| memberProperties | Faqat eski Property/batch uchun saqlandi; Hotel uni ozgartirmaydi |
| JWT payload roli | JWT tekshiriladi, ACTIVE member va joriy rol bazadan olinadi |
| SECRET_TOKEN interpolatsiyasi | ConfigService orqali olinadi; qiymat yoq bolsa startup xato beradi |
| Login xatosi InternalServerError | Notogri login Unauthorized; BLOCK uchun Forbidden |
| Umumiy profil/admin input | Ajratilgan; profil roli/status/counter allowlistga kirmaydi |
| Parol signupda hash | Signup va ikkala update oqimida hash; login bcrypt compare |
| Member pagination | Integer, min/max, limit <= 100 va nested search validatsiyasi |
| Member regex | Input literal text sifatida escape qilinadi |
| Noto'g'ri ObjectId | Baza cast xatosidan oldin BadRequest |
| Request body logi | Faqat GraphQL fieldName; parol/token body logga yozilmaydi |
| Upload | hotel target, mkdir, target whitelist, MIMEga mos extension, stream error propagation |
| LikeSchema ViewGroup | LikeGroupga tuzatildi |

## memberHotels semantikasi

Memberga tegishli DELETE qilinmagan hotellar soni: ACTIVE va PAUSED hisoblanadi.
Hozir faqat createHotel mavjud: har muvaffaqiyatli create +1.
Keyingi deleteHotel yozilganda ACTIVE/PAUSED -> DELETE otishida bir marta -1 qilish,
takroriy delete da kamaytirmaslik, restore yozilsa +1 qilish shu tranzaksiyaga boglanadi.
Pause/resume hisoblagichni ozgartirmaydi. Hozir mavjud bolmagan hotel delete/update
funksiyalari bajarilgan deb hisoblanmaydi.

## Tranzaksiya talabi va mavjud malumotlar

MongoDB replica set (Atlas ham mos) yoki tranzaksiyani qollaydigan sharded cluster kerak.
Standalone MongoDBda createHotel xato beradi; atomiclikdan voz kechib alohida yozishga fallback yoq.
Haqiqiy baza konfiguratsiyasi ushbu auditda tekshirilmadi.

Oldin yaratilgan member/hotellar bolsa, schema defaulti tarixiy qiymatlarni qayta hisoblamaydi.
`scripts/reconcile-member-hotels.cjs` tayyorlandi: HOTELIA_MIGRATION_URI orqali aniq baza tanlanadi.
`node scripts/reconcile-member-hotels.cjs` faqat dry-run;
`node scripts/reconcile-member-hotels.cjs --apply` countlarni qayta hisoblaydi.
Apply paytida API/batch yozuvlarini toxtatish kerak. Script bu auditda bazaga qarshi ishga tushirilmadi.
Eski Nestar bazasidagi AGENT/email/article-category migratsiyasi alohida masala; script ularni ozgartirmaydi.

## Moslik ozgarishlari

GraphQL getAgents -> getHotelOwners, AgentsInquiry -> HotelOwnersInquiry.
Client operatsiyalari shu nomlarga yangilanishi kerak. Frontend hali workspace ichida yoq.
SECRET_TOKEN yoq bolsa ilova ishga tushmaydi; oldingi xavfli 'undefined' secret ishlatilmaydi.
Refresh token bu bosqichda qoshilmadi; access token muddati hozircha 30 kun.

## Tekshiruv chegaralari

Audit testlari: apps/hotelia-api/test/audit/. Bcrypt/JWT haqiqiy kutubxonalarda;
GraphQL/NestJS DI va guard/pipe zanjiri haqiqiy schema orqali; MongoDB write va transaction mock.
Mock testlar session uzatilishi va xato yuqoriga chiqishini tekshiradi, serverdagi haqiqiy rollback,
parallel yozuvlar va indekslar qurilishini isbotlamaydi. Bular replica set bilan integratsion tekshiruv talab qiladi.
Upload target va oqim xatolari tuzatildi; MIME tekshiruvi fayl mazmunini tasdiqlash emas.
Bir nechta uploadning oldingi muvaffaqiyatli fayllari keyingi fayl xato bersa diskda qolishi mumkin.

## Hali kochirilmagan qismlar

Property CRUD/search, Property like/comment/view oqimlari va eski batch ranking hali Nestar domenida.
Ular Hotel uchun tayyor deb belgilanmagan. Batchni Hotel statistikasi sifatida ishga tushirmaslik kerak.
Hotel get/update/delete/search service/resolver, Room/Booking/Favorite/Review hali keyingi bosqichlarda.
Memberdagi social counterlar va eski like/follow/article oqimlari alohida hamjamiyat auditiga tegishli.

## Yakuniy tekshiruv natijalari

- 26 test, 2 suite: PASS (core.spec.ts va graphql.spec.ts).
- API va batch TypeScript noEmit tekshiruvlari: PASS.
- Reconciliation script syntax check: PASS.
- Counter failure testidagi ExceptionsHandler logi ataylab berilgan xato: GraphQL xato javobi qaytishi tekshirildi.
- Haqiqiy MongoDBga ulanilmadi; migratsiya va real rollback/parallel-write sinovi bajarilmadi.

Keyingi ishlarda Nestar module/resolver/service/model uslubi saqlanadi.
Har yangi domen amali uchun unga bogliq Member counter, DTO, module import va batch ehtiyojlari birga tekshiriladi.
