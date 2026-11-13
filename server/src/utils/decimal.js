import { Prisma } from '@prisma/client';

const Decimal = Prisma.Decimal;

export function toDecimal(value) {
  if (value === null || value === undefined || value === '') {
    return new Decimal(0);
  }
  return new Decimal(value);
}

export function sumDecimals(values) {
  return values.reduce((acc, val) => acc.plus(toDecimal(val)), new Decimal(0));
}

export function toMoneyNumber(value) {
  return Number(toDecimal(value).toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toFixed(2));
}

export function calcUtilizationPercent(actual, allocated) {
  const allocDec = toDecimal(allocated);
  if (allocDec.lte(0)) {
    return 0;
  }
  const actualDec = toDecimal(actual);
  const pct = actualDec.div(allocDec).mul(100);
  return Number(pct.toDecimalPlaces(1, Decimal.ROUND_HALF_UP).toFixed(1));
}
