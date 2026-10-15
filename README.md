# Hotelia backend

Markaziy Osiyodagi hotel va resortlar marketplace’i: NestJS, TypeScript,
GraphQL/Apollo va MongoDB/Mongoose. API va reytinglar uchun alohida batch ilovasi.
Frontend alohida `Hotelia-next` repository’sida.

Node versiyasi `package.json` engines’da ko‘rsatilgan. npm lockfile ishlatiladi:

```bash
npm ci
cp .env.example .env
npm run start:dev
```

`.env`ga development baza va auth sozlamalaringizni kiriting. Transaction uchun
MongoDB replica set yoki Atlas kerak. API porti `PORT_API` orqali sozlanadi.
`.env`ni Git’ga qo‘shmang.

```bash
npm test -- --runInBand --watchman=false
npm run build -- hotelia-api
npm run build -- hotelia-batch
```

Booking, availability, sessions, favorites, reviews, journal, public chat,
support/notifications va demo payment mavjud. Haqiqiy payment provider ulanmagan.

- [Agent uchun arxitektura va ish qoidalari](AGENTS.md)
- [Lokal Docker buyruqlari](docs/docker-local.md)
- [CI/CD va production sozlash tartibi](docs/ci-cd.md)
- [Booking va inventory tafsilotlari](docs/booking-availability.md)
