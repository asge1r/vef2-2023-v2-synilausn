# Vef2 2023, verkefni 2 sýnilausn

Sýnilausn á [verkefni 2](https://github.com/vefforritun/vef2-2023-v2).

Byggir á sýnilausn á verkefni 2 frá því 2022 og breytir/lagar eftirfarandi:

- Uppfærir öll dependency.
- Eyðir `yarn.lock` þ.a. við notum NPM.
- Krefst node 18.
- Uppfærir logout virkni ([sjá breytingar í passport.js](https://medium.com/passportjs/fixing-session-fixation-b2b68619c51d)).
- Bætir við almennum notendum:
  - Breytir login virkni úr admin-eingöngu í almenna með `user-routes.js`.
  - Breytir birtingu á innskráðum notanda í EJS templatum (`user.ejs`).
  - Passar að aðeins notendur með `admin=true` í gagnagrunni geti skráð, breytt og eytt viðburðum.
  - Ef innskráður notandi reynir að fara á stjórnandasíðu er `404` skilað.
  - Bætir við nýskráningu á _aðeins_ venjulegum notendum.
- TODO
  - Bætir við að aðeins innskráðir notendur geti skráð sig á viðburði.
  - Lagar villu í nýskráningum á viðburði.
  - Bætir við að hægt sé að eyða viðburðum.
  - Bætir við staðsetningu og slóð í viðburðaskráningu.
  - Bætir við paging á viðburðum.
  - Bætir við testum fyrir nýja virkni.

## Keyrsla

```bash
createdb vef2-2022-v2
createdb vef2-2022-v2-test
# setja upp .env & .env.test með tengingu í gagnagrunna
npm install
npm run test
npm run setup
npm start # eða `npm run dev`
```
