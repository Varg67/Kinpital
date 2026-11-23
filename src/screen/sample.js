/**
 * Sample data for the prototype. Dates are relative to today, so the screen always shows something due soon.
 * Exchange rates are rough sample values, not live quotes.
 */
import { addDays } from '../core/dates.js';

/** @param {Date} now */
export function sampleData(now) {
  /** @param {number} n */
  const d = (n) => addDays(now, n);
  return {
    rates: { base: 'BRL', perUnit: { BRL: 1, USD: 5.32, EUR: 6.14, GBP: 7.01, JPY: 0.0355, INR: 0.0631 } },
    people: [
      { id: 'you', name: 'You', kind: 'user' },
      { id: 'bia', name: 'Bia', kind: 'kin' },
      { id: 'lucas', name: 'Lucas', kind: 'kin' },
    ],
    accounts: [
      { owner: 'you', bank: 'violeta', currency: 'BRL', balance: 4820.35 },
      { owner: 'you', bank: 'banco-imperial', currency: 'BRL', balance: 2310 },
      { owner: 'you', bank: 'revolux', currency: 'EUR', balance: 450 },
      { owner: 'bia', bank: 'itauba', currency: 'BRL', balance: 6200 },
      { owner: 'bia', bank: 'mintzo', currency: 'GBP', balance: 380.5 },
      { owner: 'lucas', bank: 'liberty-federal', currency: 'USD', balance: 1250 },
      { owner: 'lucas', bank: 'santierra', currency: 'EUR', balance: 85.2 },
    ],
    cards: [
      { owner: 'you', bank: 'violeta', currency: 'BRL', limit: 5000, bill: 830, due: d(17) },
      { owner: 'you', bank: 'revolux', currency: 'EUR', limit: 1500, bill: 64.9, due: d(5) },
      { owner: 'bia', bank: 'itauba', currency: 'BRL', limit: 12000, bill: 2140.6, due: d(9) },
    ],
    loans: [
      { owner: 'you', bank: 'banco-imperial', currency: 'BRL', remaining: 9600, installment: 480, due: d(22) },
      { owner: 'lucas', bank: 'santierra', currency: 'EUR', remaining: 2880, installment: 120, due: d(-2) },
    ],
    income: [
      { owner: 'you', bank: 'banco-imperial', currency: 'BRL', amount: 3200, payday: 5, job: 'Graphic designer' },
      { owner: 'bia', bank: 'itauba', currency: 'BRL', amount: 4100, payday: 1, job: 'Café owner' },
      { owner: 'lucas', bank: 'liberty-federal', currency: 'USD', amount: 2600, payday: 15, job: 'Paramedic' },
    ],
    assets: [
      { owner: 'you', kind: 'car', name: 'Hatchback, 2019', value: 48000, currency: 'BRL' },
      { owner: 'bia', kind: 'home', name: 'Apartment in the city centre', value: 380000, currency: 'BRL' },
    ],
    activity: [
      { owner: 'you', bank: 'violeta', text: 'Transfer to Bia', amount: -50, currency: 'BRL', date: d(0) },
      { owner: 'you', bank: 'violeta', text: 'Coffee', amount: -12.9, currency: 'BRL', date: d(-1) },
      { owner: 'you', bank: 'revolux', text: 'Train ticket', amount: -23.4, currency: 'EUR', date: d(-3) },
      { owner: 'you', bank: 'violeta', text: 'Groceries', amount: -214.75, currency: 'BRL', date: d(-4) },
      { owner: 'you', bank: 'banco-imperial', text: 'Salary', amount: 3200, currency: 'BRL', date: d(-18) },
      { owner: 'bia', bank: 'itauba', text: 'Transfer from You', amount: 50, currency: 'BRL', date: d(0) },
      { owner: 'bia', bank: 'itauba', text: 'Coffee beans supplier', amount: -186.4, currency: 'BRL', date: d(-2) },
      { owner: 'bia', bank: 'mintzo', text: 'Bookshop', amount: -12, currency: 'GBP', date: d(-5) },
      { owner: 'lucas', bank: 'liberty-federal', text: 'Rent', amount: -900, currency: 'USD', date: d(-8) },
      { owner: 'lucas', bank: 'liberty-federal', text: 'Gym', amount: -35, currency: 'USD', date: d(-6) },
      { owner: 'lucas', bank: 'santierra', text: 'Loan installment', amount: -120, currency: 'EUR', date: d(-32) },
    ],
    monthChange: { you: 320, bia: -140.2, lucas: -410 },
  };
}
