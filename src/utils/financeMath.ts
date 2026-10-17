import { 
  Loan, 
  AmortizationRow, 
  PrepaymentSimulationResult, 
  BalanceTransferResult,
  PrepayVsInvestResult 
} from '../types/finance';

/**
 * Standard Reducing Balance EMI calculation:
 * E = P * r * (1 + r)^n / ((1 + r)^n - 1)
 */
export function calculateEMI(principal: number, annualInterestRate: number, tenureMonths: number): number {
  if (principal <= 0 || tenureMonths <= 0) return 0;
  if (annualInterestRate <= 0) return Math.round(principal / tenureMonths);

  const monthlyRate = annualInterestRate / 12 / 100;
  const factor = Math.pow(1 + monthlyRate, tenureMonths);
  const emi = (principal * monthlyRate * factor) / (factor - 1);
  return Math.round(emi);
}

/**
 * Calculate Remaining Tenure in Months given principal, EMI and annual rate
 */
export function calculateRemainingTenure(principal: number, emi: number, annualInterestRate: number): number {
  if (principal <= 0 || emi <= 0) return 0;
  if (annualInterestRate <= 0) return Math.ceil(principal / emi);

  const monthlyRate = annualInterestRate / 12 / 100;
  if (emi <= principal * monthlyRate) {
    // EMI does not even cover 1 month interest - loan will never finish
    return 999;
  }

  const n = Math.log(emi / (emi - principal * monthlyRate)) / Math.log(1 + monthlyRate);
  return Math.ceil(n);
}

/**
 * Generate full Amortization Schedule with optional extra prepayment
 */
export function generateAmortizationSchedule(
  principal: number,
  annualInterestRate: number,
  emi: number,
  maxMonths: number = 360,
  prepaymentMonth?: number,
  prepaymentAmount?: number,
  monthlyExtraPrepayment: number = 0
): { schedule: AmortizationRow[]; totalInterest: number; totalPaid: number; monthsTaken: number } {
  const schedule: AmortizationRow[] = [];
  let balance = principal;
  const monthlyRate = annualInterestRate / 12 / 100;
  let totalInterest = 0;
  let totalPaid = 0;
  let month = 1;

  while (balance > 0.5 && month <= maxMonths) {
    const interest = balance * monthlyRate;
    let extra = 0;
    if (prepaymentMonth && month === prepaymentMonth && prepaymentAmount) {
      extra += prepaymentAmount;
    }
    extra += monthlyExtraPrepayment;

    let principalPaid = emi - interest;
    let actualEmi = emi;

    if (balance + interest <= emi) {
      // Final month adjustment
      actualEmi = balance + interest;
      principalPaid = balance;
      extra = 0;
    }

    // Apply extra prepayment
    let totalPrincipalPayment = principalPaid + extra;
    if (totalPrincipalPayment > balance) {
      extra = Math.max(0, balance - principalPaid);
      totalPrincipalPayment = balance;
    }

    const endingBalance = Math.max(0, balance - totalPrincipalPayment);
    totalInterest += interest;
    totalPaid += actualEmi + extra;

    schedule.push({
      month,
      beginningBalance: Math.round(balance),
      emi: Math.round(actualEmi),
      principal: Math.round(principalPaid),
      interest: Math.round(interest),
      extraPrepayment: Math.round(extra),
      endingBalance: Math.round(endingBalance),
    });

    balance = endingBalance;
    month++;
  }

  return {
    schedule,
    totalInterest: Math.round(totalInterest),
    totalPaid: Math.round(totalPaid),
    monthsTaken: schedule.length,
  };
}

/**
 * Simulate prepayment ("What if I pay ₹50k extra?")
 */
export function simulatePrepayment(
  loan: Loan,
  extraLumpSum: number = 0,
  extraMonthly: number = 0,
  lumpSumMonth: number = 1
): PrepaymentSimulationResult {
  // Baseline without extra payment
  const baseline = generateAmortizationSchedule(
    loan.currentBalance,
    loan.interestRate,
    loan.emi,
    Math.max(loan.tenureMonths * 2, 480)
  );

  // With extra payment
  const withPrepayment = generateAmortizationSchedule(
    loan.currentBalance,
    loan.interestRate,
    loan.emi,
    Math.max(loan.tenureMonths * 2, 480),
    extraLumpSum > 0 ? lumpSumMonth : undefined,
    extraLumpSum,
    extraMonthly
  );

  const monthsSaved = Math.max(0, baseline.monthsTaken - withPrepayment.monthsTaken);
  const interestSaved = Math.max(0, baseline.totalInterest - withPrepayment.totalInterest);

  return {
    originalTenureMonths: baseline.monthsTaken,
    newTenureMonths: withPrepayment.monthsTaken,
    monthsSaved,
    yearsSaved: Number((monthsSaved / 12).toFixed(1)),
    originalTotalInterest: baseline.totalInterest,
    newTotalInterest: withPrepayment.totalInterest,
    interestSaved,
    prepaymentAmount: extraLumpSum + (extraMonthly * withPrepayment.monthsTaken),
    schedule: withPrepayment.schedule,
  };
}

/**
 * Compare Prepayment vs Mutual Fund / Equity Investment
 */
export function comparePrepayVsInvest(
  extraAmount: number, // e.g. 50,000 lump sum or monthly
  isMonthly: boolean,
  loanRate: number, // annual %
  investmentReturnRate: number, // e.g. 12% CAGR
  durationYears: number, // horizon e.g. 10 years
  effectiveTaxReliefRate: number = 0 // e.g. 0% or 20% Section 24b tax slab effect
): PrepayVsInvestResult {
  const effectiveLoanRate = loanRate * (1 - effectiveTaxReliefRate / 100);
  const totalMonths = durationYears * 12;

  let totalInvestedCapital = 0;
  let grossInvestmentValue = 0;
  let interestSaved = 0;

  if (isMonthly) {
    totalInvestedCapital = extraAmount * totalMonths;
    // Monthly SIP future value: FV = P * [((1 + i)^n - 1) / i] * (1 + i)
    const monthlyInvRate = investmentReturnRate / 12 / 100;
    grossInvestmentValue = extraAmount * ((Math.pow(1 + monthlyInvRate, totalMonths) - 1) / monthlyInvRate) * (1 + monthlyInvRate);

    // Cumulative interest saved from recurring prepayment
    const monthlyLoanRate = effectiveLoanRate / 12 / 100;
    // Compounded interest saved over tenure
    interestSaved = extraAmount * ((Math.pow(1 + monthlyLoanRate, totalMonths) - 1) / monthlyLoanRate) * (1 + monthlyLoanRate) - totalInvestedCapital;
  } else {
    // Lump sum
    totalInvestedCapital = extraAmount;
    grossInvestmentValue = extraAmount * Math.pow(1 + investmentReturnRate / 100, durationYears);
    // Compound interest saved on lump sum
    interestSaved = extraAmount * (Math.pow(1 + effectiveLoanRate / 100, durationYears) - 1);
  }

  // Capital Gains Tax: Indian LTCG 12.5% on gains above ₹1.25 Lakh exemption
  const capitalGains = Math.max(0, grossInvestmentValue - totalInvestedCapital);
  const taxableGains = Math.max(0, capitalGains - 125000);
  const estimatedTax = taxableGains * 0.125;
  const netInvestmentGain = capitalGains - estimatedTax;
  const netInvestmentValue = totalInvestedCapital + netInvestmentGain;

  // Prepayment financial return is the capital saved plus interest avoided
  const totalPrepaymentBenefit = totalInvestedCapital + interestSaved;

  const netWealthDifference = netInvestmentValue - totalPrepaymentBenefit;
  const winner = netWealthDifference > 1000 ? 'INVESTMENT' : netWealthDifference < -1000 ? 'PREPAYMENT' : 'BALANCED';

  // Hurdle rate: What return does equity need to equal loan savings post-tax?
  // Approx: r_prepay / (1 - 0.125)
  const hurdleRate = Number((effectiveLoanRate / (1 - 0.125)).toFixed(2));

  // 50/50 Hybrid strategy
  const halfCapital = totalInvestedCapital / 2;
  const halfInvestmentValue = (netInvestmentValue - totalInvestedCapital) / 2 + halfCapital;
  const halfInterestSaved = interestSaved / 2;
  const hybridNetWealth = halfInvestmentValue + halfCapital + halfInterestSaved;

  return {
    extraMonthlyAmount: isMonthly ? extraAmount : 0,
    lumpSumAmount: isMonthly ? 0 : extraAmount,
    durationYears,
    interestSaved: Math.round(interestSaved),
    monthsSaved: Math.round(durationYears * 3), // estimated average
    effectiveLoanRate: Number(effectiveLoanRate.toFixed(2)),
    grossInvestmentValue: Math.round(grossInvestmentValue),
    investedCapital: Math.round(totalInvestedCapital),
    investmentGain: Math.round(capitalGains),
    estimatedTax: Math.round(estimatedTax),
    netInvestmentValue: Math.round(netInvestmentValue),
    netWealthDifference: Math.round(netWealthDifference),
    winner,
    hurdleRate,
    hybridNetWealth: Math.round(hybridNetWealth),
    hybridInterestSaved: Math.round(halfInterestSaved),
  };
}

/**
 * Loan Balance-Transfer Calculator
 */
export function calculateBalanceTransfer(
  currentBalance: number,
  currentRate: number,
  remainingMonths: number,
  newRate: number,
  processingFeePercent: number = 0.5,
  otherCharges: number = 2500, // e.g. MODT / legal / valuation
  adjustTenureMonths?: number
): BalanceTransferResult {
  const currentEMI = calculateEMI(currentBalance, currentRate, remainingMonths);
  const targetTenure = adjustTenureMonths || remainingMonths;
  const newEMI = calculateEMI(currentBalance, newRate, targetTenure);

  // Total interest payable under current loan
  const currentSchedule = generateAmortizationSchedule(currentBalance, currentRate, currentEMI, remainingMonths + 12);
  const newSchedule = generateAmortizationSchedule(currentBalance, newRate, newEMI, targetTenure + 12);

  const currentRemainingInterest = currentSchedule.totalInterest;
  const newRemainingInterest = newSchedule.totalInterest;

  const grossInterestSaved = Math.max(0, currentRemainingInterest - newRemainingInterest);

  // 18% GST on processing fees in India
  const baseProcessingFee = (currentBalance * processingFeePercent) / 100;
  const processingFeeWithGST = baseProcessingFee * 1.18;
  const totalSwitchingCost = Math.round(processingFeeWithGST + otherCharges);

  const netLifetimeSavings = Math.round(grossInterestSaved - totalSwitchingCost);
  const monthlySavings = Math.round(currentEMI - newEMI);

  let breakEvenMonths = 0;
  if (monthlySavings > 0) {
    breakEvenMonths = Math.ceil(totalSwitchingCost / monthlySavings);
  } else {
    // If EMI increases due to shortening tenure, break-even based on cumulative monthly interest delta
    const monthlyInterestDiff = (currentBalance * (currentRate - newRate) / 100) / 12;
    breakEvenMonths = monthlyInterestDiff > 0 ? Math.ceil(totalSwitchingCost / monthlyInterestDiff) : 999;
  }

  let isRecommended = false;
  let recommendationGrade: 'STRONG_SWITCH' | 'MODERATE_SWITCH' | 'STAY_PUT' = 'STAY_PUT';
  let recommendationReason = '';

  const rateDelta = currentRate - newRate;

  if (netLifetimeSavings > 50000 && breakEvenMonths <= 18 && rateDelta >= 0.5) {
    isRecommended = true;
    recommendationGrade = 'STRONG_SWITCH';
    recommendationReason = `Excellent switch! You will save ₹${formatINR(netLifetimeSavings)} net after fees and recover switching costs in just ${breakEvenMonths} months.`;
  } else if (netLifetimeSavings > 20000 && breakEvenMonths <= 36 && rateDelta >= 0.25) {
    isRecommended = true;
    recommendationGrade = 'MODERATE_SWITCH';
    recommendationReason = `Moderate benefit. You save ₹${formatINR(netLifetimeSavings)} net over ${targetTenure} months. Consider asking your existing lender to match the ${newRate}% rate for an internal conversion fee.`;
  } else {
    isRecommended = false;
    recommendationGrade = 'STAY_PUT';
    recommendationReason = `Not worth switching. High processing fees (₹${formatINR(totalSwitchingCost)}) erode your interest savings, or the rate difference (${rateDelta.toFixed(2)}%) is too narrow.`;
  }

  return {
    currentMonthlyEMI: currentEMI,
    newMonthlyEMI: newEMI,
    monthlySavings,
    currentRemainingInterest,
    newRemainingInterest,
    grossInterestSaved,
    processingFeeAmount: Math.round(processingFeeWithGST),
    otherCharges,
    totalSwitchingCost,
    netLifetimeSavings,
    breakEvenMonths,
    isRecommended,
    recommendationGrade,
    recommendationReason,
  };
}

/**
 * Format Indian Rupee (INR) with standard lakh/crore commas or compact representation
 */
export function formatINR(val: number, compact: boolean = false): string {
  if (isNaN(val) || val === null || val === undefined) return '0';
  const abs = Math.abs(val);

  if (compact) {
    if (abs >= 10000000) {
      // Crores
      return `${(val / 10000000).toFixed(2)} Cr`;
    } else if (abs >= 100000) {
      // Lakhs
      return `${(val / 100000).toFixed(2)} L`;
    } else if (abs >= 1000) {
      // Thousands
      return `${(val / 1000).toFixed(1)}k`;
    }
  }

  // Full Indian number format e.g. 50,00,000
  return val.toLocaleString('en-IN');
}

/**
 * Format months to "X yrs Y mos"
 */
export function formatMonths(months: number): string {
  if (months <= 0) return '0 mos';
  const yrs = Math.floor(months / 12);
  const mos = months % 12;
  if (yrs === 0) return `${mos} mos`;
  if (mos === 0) return `${yrs} yrs`;
  return `${yrs}y ${mos}m`;
}

/**
 * Calculate Date when all debts will be cleared
 */
export function calculateDebtFreeDate(maxRemainingMonths: number): string {
  if (maxRemainingMonths <= 0) return 'Debt Free!';
  const now = new Date();
  now.setMonth(now.getMonth() + maxRemainingMonths);
  return now.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
}
