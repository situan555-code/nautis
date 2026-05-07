/**
 * ROI Calculators — Shared Logic
 * This module replaces all inline <script> tags in insight pages to achieve 
 * full CSP compliance and remove 'unsafe-eval' triggers.
 */

const formatters = {
  currency: (n) => {
    if (Math.abs(n) >= 1e9) return '$' + (n / 1e9).toFixed(1) + 'B';
    if (Math.abs(n) >= 1e6) return '$' + (n / 1e6).toFixed(1) + 'M';
    if (Math.abs(n) >= 1e3) return '$' + Math.round(n / 1000) + 'K';
    return '$' + Math.round(n).toLocaleString();
  },
  number: (n) => {
    if (Math.abs(n) >= 1e6) return (n / 1e6).toFixed(1) + 'M';
    if (Math.abs(n) >= 1e3) return Math.round(n / 1000) + 'K';
    return Math.round(n).toLocaleString();
  },
  percent: (n) => Math.round(n) + '%',
  months: (n) => (n < 1 ? '<1 mo' : n.toFixed(1) + ' mo'),
};

/**
 * Registry of calculator logic.
 * Each key corresponds to a data-calc attribute on the .roi-calculator element.
 */
const calculatorLogics = {
  // 3D Visualization
  v1: (inputs) => {
    const skus = +inputs.skus;
    const photo = +inputs.photo;
    const refresh = +inputs.refresh / 100;
    const rev = +inputs.rev;
    const render = +inputs.render;

    const updated = Math.round(skus * refresh);
    const photoSpend = updated * photo;
    const renderCost = updated * render;
    const savings = photoSpend - renderCost;
    const savePct = photoSpend > 0 ? Math.round((savings / photoSpend) * 100) : 0;
    const lift = rev * 0.047;
    const total = savings + lift;

    return {
      skus_out: skus.toLocaleString(),
      photo_out: '$' + photo,
      refresh_out: Math.round(refresh * 100) + '%',
      rev_out: formatters.currency(rev),
      render_out: '$' + render,
      photo_spend: formatters.currency(photoSpend),
      render_cost: formatters.currency(renderCost),
      savings: formatters.currency(savings),
      pct: formatters.percent(savePct),
      lift: formatters.currency(lift),
      total: formatters.currency(total),
    };
  },

  // B2B Lead Gen
  l: (inputs) => {
    const leads = +inputs.leads;
    const conv = +inputs.conv / 100;
    const ltv = +inputs.ltv;
    const cpl = +inputs.cpl;
    const spend = +inputs.spend;

    const newLeads = Math.round(leads * 1.8);
    const addLeads = newLeads - leads;
    const newConv = conv * 1.77;
    const newCpl = cpl * 0.4;
    const currentCusts = Math.round(leads * conv);
    const newCusts = Math.round(newLeads * newConv);
    const addCusts = newCusts - currentCusts;
    const addRev = addCusts * ltv;

    return {
      leads_out: leads,
      conv_out: (conv * 100).toFixed(1) + '%',
      ltv_out: formatters.currency(ltv),
      cpl_out: '$' + cpl,
      spend_out: formatters.currency(spend),
      new_leads: formatters.number(addLeads),
      new_conv: (newConv * 100).toFixed(1) + '%',
      new_cpl: '$' + Math.round(newCpl),
      new_custs: addCusts,
      new_rev: formatters.currency(addRev),
      annual: formatters.currency(addRev * 12),
    };
  },

  // AI Copilot
  a: (inputs) => {
    const reps = +inputs.reps;
    const salary = +inputs.salary;
    const admin = +inputs.admin;

    const hourly = salary / 160;
    const reclaimed = admin * 0.7 * 4 * reps;
    const monthlyValue = reclaimed * hourly;
    const annual = monthlyValue * 12;

    return {
      reps_out: reps,
      salary_out: formatters.currency(salary),
      admin_out: admin + ' hrs',
      time: Math.round(reclaimed) + ' hrs',
      lift: formatters.currency(monthlyValue),
      total: formatters.currency(annual),
    };
  },

  // Competitive Intelligence
  ci: (inputs) => {
    const spend = +inputs.spend;
    const win = +inputs.win / 100;
    const deal = +inputs.deal;

    const dealsPerMonth = spend / 2000;
    const currentRev = dealsPerMonth * win * deal;
    const lift = 0.24;
    const newWin = win * (1 + lift);
    const newRev = dealsPerMonth * newWin * deal;
    const addRev = newRev - currentRev;

    return {
      spend_out: formatters.currency(spend),
      win_out: Math.round(win * 100) + '%',
      deal_out: formatters.currency(deal),
      new_win: (newWin * 100).toFixed(1) + '%',
      rev: formatters.currency(addRev),
      annual: formatters.currency(addRev * 12),
    };
  },

  // Sales Enablement
  s: (inputs) => {
    const team = +inputs.team;
    const quota = +inputs.quota;
    const att = +inputs.att / 100;

    const currentRev = team * (quota * att);
    const lift = 0.15;
    const newAtt = Math.min(1.0, att + lift);
    const newRev = team * (quota * newAtt);
    const addRev = newRev - currentRev;

    return {
      team_out: team,
      quota_out: formatters.currency(quota),
      att_out: Math.round(att * 100) + '%',
      lift_pct: Math.round(newAtt * 100) + '%',
      rev: formatters.currency(addRev),
      annual: formatters.currency(addRev * 12),
    };
  },

  // Digital Twins
  dt: (inputs) => {
    const t = +inputs.t;
    const opex = +inputs.opex;
    const cac = +inputs.cac;

    const cacSave = cac * 0.32;
    const velocity = (t * 0.05) * 5000;
    const opexSave = opex * 0.6;
    const total = (cacSave * (t * 0.1) + velocity + opexSave);

    return {
      t_out: t,
      opex_out: formatters.currency(opex),
      cac_out: formatters.currency(cac),
      cac_save: formatters.currency(cacSave),
      velocity: formatters.currency(velocity),
      annual: formatters.currency(total * 12),
    };
  },

  // ERP Integration
  er: (inputs) => {
    const orders = +inputs.orders;
    const time = +inputs.time;
    const labor = +inputs.labor;

    const hoursSaved = orders * (time / 60) * 0.9;
    const laborSavings = hoursSaved * labor;
    const errorSavings = orders * 15;
    const total = (laborSavings + errorSavings) * 12;

    return {
      orders_out: orders,
      time_out: time + ' min',
      labor_out: '$' + labor,
      hours: Math.round(hoursSaved),
      savings: formatters.currency(laborSavings),
      total: formatters.currency(total),
    };
  },

  // Interactive Kiosk
  ki: (inputs) => {
    const units = +inputs.units;
    const sales = +inputs.sales;
    const staff = +inputs.staff;

    const lift = sales * 0.22;
    const labor = staff * 0.286;
    const total = (lift + labor) * 12;

    return {
      units_out: units,
      sales_out: formatters.currency(sales),
      staff_out: formatters.currency(staff),
      lift: formatters.currency(lift),
      labor: formatters.currency(labor),
      total: formatters.currency(total),
    };
  },

  // MarTech Audit
  ma: (inputs) => {
    const tools = +inputs.tools;
    const spend = +inputs.spend;
    const waste = +inputs.waste / 100;

    const toolSavings = tools * 0.42 * 1500;
    const spendSavings = spend * waste;
    const total = toolSavings + spendSavings;

    return {
      tools_out: tools,
      spend_out: formatters.currency(spend),
      waste_out: Math.round(waste * 100) + '%',
      tool_savings: formatters.currency(toolSavings),
      spend_savings: formatters.currency(spendSavings),
      total: formatters.currency(total),
    };
  },

  // Whale Curve
  wh: (inputs) => {
    const accounts = +inputs.accounts;
    const profit = +inputs.profit;
    const toxic = +inputs.toxic / 100;

    const recovery = profit * toxic * 0.65;
    const focus = profit * 0.12;
    const total = recovery + focus;

    return {
      accounts_out: accounts,
      profit_out: formatters.currency(profit),
      toxic_out: Math.round(toxic * 100) + '%',
      recovery: formatters.currency(recovery),
      focus: formatters.currency(focus),
      total: formatters.currency(total),
    };
  },

  // Leaky Funnel
  fu: (inputs) => {
    const pipe = +inputs.pipe;
    const win = +inputs.win / 100;
    const leak = +inputs.leak / 100;

    const recovered = pipe * leak * (win * 1.34);
    const annual = recovered * 12;

    return {
      pipe_out: formatters.currency(pipe),
      win_out: Math.round(win * 100) + '%',
      leak_out: Math.round(leak * 100) + '%',
      recovered: formatters.currency(recovered),
      annual: formatters.currency(annual),
      payback: formatters.months(4.5),
    };
  },

  // PIM / Omnichannel
  pi: (inputs) => {
    const skus = +inputs.skus;
    const error = +inputs.error / 100;
    const sell = +inputs.sell;

    const savings = skus * error * 250;
    const lift = sell * 0.29;
    const total = savings + lift;

    return {
      skus_out: skus,
      error_out: Math.round(error * 100) + '%',
      sell_out: formatters.currency(sell),
      savings: formatters.currency(savings),
      lift: formatters.currency(lift),
      total: formatters.currency(total),
    };
  },
};

/**
 * Initialize all calculators on the page.
 */
export function initCalculators() {
  const calculators = document.querySelectorAll('.roi-calculator');

  calculators.forEach((calc) => {
    const type = calc.dataset.calc;
    const logic = calculatorLogics[type];

    if (!logic) return;

    const inputs = calc.querySelectorAll('input');

    const update = () => {
      // Gather all input values
      const values = {};
      inputs.forEach((input) => {
        // Use ID without prefix as key
        const key = input.id.split('_').slice(1).join('_');
        values[key] = input.value;
      });

      // Run logic
      const results = logic(values);

      // Update outputs
      Object.keys(results).forEach((key) => {
        const outputId = `${type}_${key}`;
        // Support both ID and [id] selectors within the calculator
        const output = calc.querySelector(`#${outputId}`) || document.getElementById(outputId);
        if (output) {
          output.textContent = results[key];
        }
      });
    };

    // Attach listeners
    inputs.forEach((input) => {
      input.addEventListener('input', update);
    });

    // Run once to init
    update();
  });
}
