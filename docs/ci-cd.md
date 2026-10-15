# Hotelia CI/CD — F1.3 va F1.4

## Branch tartibi

- `develop`: kundalik ish va tekshiruvlar.
- `master`: production. Tayyor o‘zgarishlar `develop` → `master` PR orqali o‘tadi.
- Branch nomlari o‘zgartirilmaydi. Hozir hech qanday merge yoki push bajarilmadi.

Ikkala repository’da `develop` va `master` push’lari, shuningdek `master`ga PR
ochilganda CI ishlaydi. Backendda testlar, TypeScript tekshiruvi va ikkala Docker
image buildi bajariladi. Frontendda testlar, TypeScript va Docker buildi bajariladi.
Frontend Docker buildi Next.js production buildini ham bajaradi.
Testlar production bazasi yoki production kalitlarini talab qilmaydi.

PR va `develop` uchun deploy ishlamaydi. Faqat `master` push’ida, ikkala tekshiruv
job’i muvaffaqiyatli tugagach va `COOLIFY_URL` sozlangan bo‘lsa deploy boshlanadi.

## Keyin GitHub’da qo‘shiladigan qiymatlar

Avval Coolify’da qo‘lda muvaffaqiyatli deploy qilamiz (F7).
Shundan keyingina ushbu qiymatlarni kiritamiz (F8).

Har bir repository’da `production` nomli GitHub Environment yaratiladi;
deployment branch qoidasi faqat `master`ga ruxsat beradi.
Environment secret: `COOLIFY_TOKEN` (Coolify’da faqat read + deploy huquqlari).

Backend repository **Actions → Variables**:

| Nomi | Qiymat |
| --- | --- |
| `COOLIFY_URL` | Panelning HTTPS manzili; avtomatlashtirishga tayyor bo‘lganda oxirida kiriting |
| `COOLIFY_API_UUID` | Hotelia API ilovasi UUID’i |
| `COOLIFY_BATCH_UUID` | Hotelia batch ilovasi UUID’i |
| `API_SMOKE_URL` | `https://api.hotelia.uz/` |

Frontend repository **Actions → Variables**:

| Nomi | Qiymat |
| --- | --- |
| `COOLIFY_URL` | Panelning HTTPS manzili; tayyor bo‘lganda kiriting |
| `COOLIFY_APP_UUID` | Hotelia frontend ilovasi UUID’i |
| `SMOKE_URL` | `https://hotelia.uz/` |

Bu qiymatlar repository variables bo‘ladi, environment variables emas.
`COOLIFY_TOKEN` esa faqat secret sifatida saqlanadi. MongoDB, JWT va Gemini
kalitlari GitHub CI uchun kerak emas; ular keyin Coolify runtime env’iga beriladi.

## Deploy tartibi

Coolify’dagi uchala ilova `master` branchdan quriladi. Auto deploy o‘chiriladi;
deploy’ni GitHub Actions tekshiruvlardan keyin API orqali boshlaydi.
Backend workflow avval API’ni deploy qilib, ochiq endpointni tekshiradi,
keyin batch’ni deploy qiladi. Batch uchun ochiq domen shart emas, Coolify’dagi
HTTP health check yoqilgan bo‘lishi kerak.
Frontend o‘z repository’sidan alohida deploy qilinadi.

CI frontend image’i localhost URL’lari bilan faqat tekshiruv uchun quriladi;
u productionga yuborilmaydi. Coolify yangi image’ni haqiqiy HTTPS/WSS build
argumentlari bilan quradi. CI buildlari GitHub runner’da, production buildlari
umumiy VPSda bajariladi. VPSda frontend va backend deploylarini bir vaqtda
boshlamaslikka kelishamiz.

Deploy muvaffaqiyatsiz bo‘lsa workflow xato bilan tugaydi. Avtomatik rollback
qo‘shilmagan; kerak bo‘lsa Coolify orqali oldingi ishlagan versiyaga qaytiladi.
