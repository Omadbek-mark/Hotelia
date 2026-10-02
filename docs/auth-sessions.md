# Hotelia: access / refresh session oqimi

## Qoshilgan oqim

- signup/login: Member javobida accessToken va refreshToken qaytadi.
- Access JWT: sub (member ID), sid (session ID), type=access; 15 daqiqa.
- Refresh token: sessionId + 32 byte kriptografik tasodifiy secret; JWT emas.
- sessions kolleksiyasi: memberId, refreshTokenHash, expiresAt, revokedAt, timestamps.
- Faqat SHA-256 xesh saqlanadi. Yuqori entropiyali tasodifiy token uchun bu mos;
  foydalanuvchi parollari avvalgidek bcrypt bilan xeshlanadi.
- Session 7 kun amal qiladi. Rotation 7 kunlik umumiy muddatni uzaytirmaydi.
- Har himoyalangan sorovda ACTIVE member va bekor qilinmagan, muddati tugamagan session tekshiriladi.
- refreshToken(token): faol session/member tekshiriladi, hash atomik compare-and-swap orqali almashtiriladi.
  Parallel bir xil tokenli sorovlardan faqat bittasi yutadi.
- logout: joriy session revokedAt belgilanadi. Keyingi tekshiruvda shu sessiondagi
  barcha access tokenlar ham, refresh token ham rad etiladi. Boshqa sessionlar saqlanadi.
- Oldin autentifikatsiyadan otib bajarilayotgan sorov logout tomonidan orqaga qaytarilmaydi.

## GraphQL misollar

```graphql
mutation Login($input: LoginInput!) {
  login(input: $input) { _id memberNick accessToken refreshToken }
}

mutation Refresh($token: String!) {
  refreshToken(token: $token) { accessToken refreshToken }
}

mutation Logout {
  logout
}
```

Logout uchun Authorization: Bearer <accessToken> headeri kerak.
Refresh uchun access token talab qilinmaydi. Tokenlarni literal query matniga yozish orniga variables ishlating.
Frontend ulanayotganda refresh token transportini HttpOnly/Secure cookiega otkazamiz,
Origin/CSRF va aniq CORS sozlamalarini ham shu paytda birga tekshiramiz.
Hozir cookie ishlatilmaydi; raw refresh token faqat signup/login/refresh javobida beriladi,
Member hujjatiga yozilmaydi. Browser localStorageda saqlash ushbu dizaynning tavsiyasi emas.

## Moslik va chegaralar

- Session IDsi yoq oldingi access tokenlar endi qabul qilinmaydi: qayta login kerak.
- Profil update yangi token/session bermaydi; caller mavjud session bilan davom etadi.
- Refresh response yoqolsa, eski token allaqachon ishlatilgan bolishi mumkin; qayta login kerak boladi.
- Oldingi refresh token qayta ishlatilsa rad etiladi; butun session avtomatik bekor qilinmaydi.
- Logout muddati tugamagan access token bilan himoyalangan. Access tugagan bolsa,
  avval refresh qilib, keyin logout chaqiriladi.
- Logout-all va parol almashganda barcha sessionlarni bekor qilish hali qoshilmagan.
- Signup member yaratishi va session yaratishi ikkita yozuv: ikkinchisi xato bersa member qoladi;
  foydalanuvchi keyin login qilishi mumkin.
- TTL tozalash kechiksa ham expiresAt har sorovda tekshiriladi.
- Secret mavjud sozlamadan: SECRET_TOKEN. Alohida refresh signing secret kerak emas, refresh JWT emas.

## Tekshiruv

apps/hotelia-api/test/auth/: session/rotation/logout va haqiqiy GraphQL guard/resolver oqimi.
JWT kriptografiyasi haqiqiy kutubxonada, MongoDB esa in-memory model mock.
Atomik findOneAndUpdate filtri test qilindi; haqiqiy MongoDB parallel sorovlari va TTL
ishlashi hali integratsion bazada tekshirilmagan. Amaldagi bazaga yozuv yoki migratsiya bajarilmadi.
