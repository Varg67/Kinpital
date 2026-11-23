# Kinpital

A fictional, realistic finance app for Kindroid: an app inside the app, built as a Kindroid Workshop program
(same model as Clotheskin). Users and their attached Kins hold accounts in 24 fictional banks across 7 regions,
with real-time due dates, interest, installments, loans, debt and currency exchange. **KinWallet** is the wallet
area that opens the banks.

Status: specification. See [`docs/especificacao.md`](docs/especificacao.md) (Portuguese).

## Develop

Requires Node 22+. No dependencies.

```bash
npm test             # unit tests (node --test)
npm start            # dev server: http://localhost:5173/dev/banks.html (bank logos and colours)
```

- `src/core/banks.js`: the 24 banks, their regions, currencies and colours.
- `screen/assets/banks/<id>.svg`: each bank's logo (64×64, symbol only).
- `screen/theme.css`: the Kinpital theme tokens (same as Clotheskin).
