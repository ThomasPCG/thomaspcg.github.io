const TaxTiers = {
    SINGAPORE: [
        { income: 20000, base: 0, rate: 0.02 },
        { income: 30000, base: 200, rate: 0.035 },
        { income: 40000, base: 550, rate: 0.07 },
        { income: 80000, base: 3350, rate: 0.115 },
        { income: 120000, base: 7950, rate: 0.15 },
        { income: 160000, base: 13950, rate: 0.18 },
        { income: 200000, base: 21150, rate: 0.19 },
        { income: 240000, base: 28750, rate: 0.195 },
        { income: 280000, base: 36550, rate: 0.20 },
        { income: 320000, base: 44550, rate: 0.22 },
        { income: 500000, base: 84150, rate: 0.23 },
        { income: 1000000, base: 199150, rate: 0.24 }
    ]
}

const isNull = function (val) {
    return (typeof val === 'undefined' || val == null);
};

const TaxCalculator = function () {
    TaxCalculator.prototype.calculateTax = function (gross_income, net_income, countryTaxTier = null) {
        let payload = {
            incomeTaxTier: null,
            taxpayable: 0,
            eir: 0
        };
        gross_income = parseFloat(gross_income);
        net_income = parseFloat(net_income);
        if (isNaN(gross_income) || isNaN(net_income)) {
            console.log('Income is not a valid figure.');
            return;
        }
        if (isNull(countryTaxTier)) {
            //Use SG Tax Tiers as default.
            countryTaxTier = TaxTiers.SINGAPORE;
        }
        let incomeTaxTier = countryTaxTier.find((tier, index) => {
            if (net_income < tier.income) {
                return true;
            } else {
                if (index < countryTaxTier.length - 1) {
                    return (tier.income < net_income && countryTaxTier[index + 1].income > net_income);
                } else {
                    return true;
                }
            }
        });
        if (!isNull(incomeTaxTier)) {
            payload.incomeTaxTier = incomeTaxTier;

            let excess = net_income - incomeTaxTier.income;
            excess = (excess < 0) ? 0 : excess;
            payload.taxpayable = incomeTaxTier.base + (excess * incomeTaxTier.rate);

            payload.eir = payload.taxpayable / gross_income;
            payload.eir = numeral(payload.eir).format('0.00%');
        }
        return payload;
    };
    return this;
}