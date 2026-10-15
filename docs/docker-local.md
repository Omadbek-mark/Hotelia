# Hotelia — lokal Docker tekshiruvi (F1)

Avval Docker Desktop ishga tushgan bo‘lsin:

```bash
docker version
```

## Backend

`Hotelia` papkasida API va batch image’larini alohida quring:

```bash
docker build --build-arg APP_NAME=hotelia-api -t hotelia-api:local .
docker build --build-arg APP_NAME=hotelia-batch -t hotelia-batch:local .
```

Ikkalasi bir Dockerfile’dan quriladi, ammo alohida konteynerlarda ishlaydi.
Har bir konteyner ichidagi port `3001`. Bu hostdagi portni band qilmaydi;
faqat `-p` berilganda hostga chiqariladi.

API’ni development bazasi bilan tekshirish (`MONGO_DEV` to‘g‘ri bo‘lsin):

```bash
docker run --rm --name hotelia-api-local --env-file .env -e NODE_ENV=development -e PORT_API=3001 -p 127.0.0.1:3001:3001 -v hotelia-local-uploads:/app/uploads hotelia-api:local
```

Yangi volume bo‘sh bo‘ladi: mavjud lokal rasmlar unga avtomatik ko‘chmaydi.
Bu buyruq production bazasini sinash uchun mo‘ljallanmagan.
Batch bazaga reyting o‘zgarishlarini yozadi; uning ishga tushirilishini alohida rejalashtiramiz.

## Frontend

`Hotelia-next` papkasida (API yuqoridagi portda ishlayotgan bo‘lsa):

```bash
docker build --build-arg REACT_APP_API_URL=http://localhost:3001 --build-arg REACT_APP_API_GRAPHQL_URL=http://localhost:3001/graphql --build-arg REACT_APP_API_WS=ws://localhost:3001 -t hotelia-next:local .
docker run --rm --name hotelia-next-local -p 127.0.0.1:3015:3001 hotelia-next:local
```

Sayt: `http://localhost:3015`. Bu API manzillari brauzer uchun;
production image’da ularning o‘rniga haqiqiy HTTPS/WSS manzillari beriladi.
URL o‘zgarsa frontend image qayta quriladi.

Next.js standalone server `node server.js` bilan ishga tushadi;
`public` va `.next/static` image’ga alohida ko‘chiriladi.

## Coolify’da keyin beriladigan sozlamalar

- API: `APP_NAME=hotelia-api` build argument; runtime `MONGO_PROD`, JWT va boshqa backend env’lar.
- Batch: `APP_NAME=hotelia-batch` build argument; runtime production baza sozlamalari; ochiq domen kerak emas.
- Frontend: uchta `REACT_APP_API_*` URL build argument.
- Konteyner porti: `3001`; health check: `HTTP`, `127.0.0.1`, `/`, kutilgan kod `200`.
- Faqat API’ga doimiy uploads volume: `/app/uploads`.

`.env`, lokal `node_modules` va uploads image’ga kirmaydi.
MongoDB Atlas tashqi xizmat bo‘lib qoladi. Serverga alohida Nginx yoki MongoDB o‘rnatilmaydi.
