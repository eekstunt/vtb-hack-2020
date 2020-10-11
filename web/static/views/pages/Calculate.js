import storage from '../../services/Storage.js'
import {LOAN_PARAM_KEYS} from '../../services/Storage.js'
import Utils from "../../services/Utils.js";

let Calculate = {
    render: async () => {
        if (typeof storage.car !== 'string') {
            Utils.goto('/');
            return;
        }

        const content = await Calculate.doRender();
        return `<div id="calc_container">${content}</div>`;
    },

    doRender: async () => {
        const settings = await storage.getSettings();
        const params = await storage.getLoanParams();
        const result = storage.loanResponse === null ? null : storage.loanResponse.result;
        const graph = storage.paymentGraph;
        let graphRows = null;
        if (graph !== null) {
            graphRows = [
                ['<b>Месяц</b>'], ['<b>Платёж</b>'], ['(по телу долга)'], ['(по процентам)'], ['<b>Остаток долга</b>']];
            graph.forEach(month => {
                ['order', 'payment', 'debt', 'percent', 'balanceOut'].forEach((key, i) => {
                    graphRows[i].push(month[key]);
                })
            })
        }

        return `
            <section class="section">
                <b> Калькулятор кредита ${settings.name}: </b>
                <div class="field">
                    <label for="cost" class="label">Стоимость машины: </label>
                    <div class="control">
                        <input class="input" id="cost" type="number" value="${params.cost}">
                    </div>
                </div>
                <div class="field">
                    <label for="initialFee" class="label">Начальный взнос: </label>
                    <div class="control">
                        <input class="input" id="initialFee" type="number" value="${params.initialFee}">
                    </div>
                </div>
                <div class="field">
                    <label for="kaskoValue" class="label">Стоимость КАСКО: </label>
                    <div class="control">
                        <input class="input" id="kaskoValue" type="number" value="${params.kaskoValue}">
                    </div>
                </div>
                <div class="field">
                    <label for="residualPayment" class="label">Остаточный платёж: </label>
                    <div class="control">
                        <input class="input" id="residualPayment" type="number" value="${params.residualPayment}">
                    </div>
                </div>
                <div class="field">
                    <label for="term" class="label">Срок погашения: </label>
                    <div class="control">
                        <input class="input" id="term" type="number" value="${params.term}">
                    </div>
                </div>
                ${settings.specialConditions.map(cond => `
                    <div class="field">
                    <div class="control">    
                        <label for="${cond['id']}" class="label">
                            <input class="checkbox" id="${cond['id']}" name='${cond['id']}'
                             type="checkbox"${params.specialConditions.indexOf(cond.id) >= 0 ? ' checked' : ''}>
                         
                            ${cond['name']}
                        </label>
                    </div>
                    </div>
                `).join('')}
                <button id="recalc" class="button is-link">Рассчитать параметры кредита</button>
            </section>
            ${storage.loanResponse === null ? '' : `
            <section class="section">
                <p>Вам подойдёт кредит по программе <a href="${storage.loanResponse.program.programUrl}">${storage.loanResponse.program.programName}</a>:</p>
                <p>${result.loanAmount} ₽ на ${result.term} лет по ставке ${result.contractRate}%.</p>
                <p>Ежемесячный платёж &mdash; ${result.payment} ₽, остаточный платёж &mdash; ${result.lastPayment ?? 0} ₽.</p>
                <p>Стоимость КАСКО составит ${result.kaskoCost ?? 0} ₽, а государственные субсидии покроют ${result.subsidy ?? 0}% суммы.</p>
                ${graph === null ? '' : `
                <br/>
                <p><b>Таблица выплат:</b></p>
                <div class="table-container">
                    <table class="table">
                        ${graphRows.map(row => `
                            <tr>
                                ${row.map(item => `<td class="has-text-right">${item}</td>`).join('\n')}
                            </tr>
                        `).join('\n')}
                    </table>
                </div>
                `}
                <button id="get_loan" class="button is-link">Взять кредит с такими параметрами</button>
            </section>
            `}`;
    },

    after_render: async () => {
        const getLoanButton = document.getElementById("get_loan");
        if (getLoanButton) {
            getLoanButton.addEventListener('click', () => {
                Utils.goto('/loan');
            });
        }
        const recalc = document.getElementById("recalc");
        recalc.addEventListener('click', async () => {
            recalc.classList.add('is-loading');
            await Calculate.recalc();
            document.getElementById('calc_container').innerHTML = await Calculate.doRender();
            recalc.classList.remove('is-loading');
            await Calculate.after_render();
        });
    },

    recalc: async () => {
        const settings = await storage.getSettings();
        const params = {};
        LOAN_PARAM_KEYS.forEach(key => {
            if (key !== 'specialConditions') {
                params[key] = parseFloat(document.getElementById(key).value ?? 0);
            }
        });
        params.specialConditions = [];
        const conds = {};
        settings.specialConditions.forEach(cond => {
            if (document.getElementById(cond.id).checked) {
                params.specialConditions.push(cond.id);
                conds[cond.id] = true;
            }
        });
        let error = '';
        settings.specialConditions.forEach(cond => {
            if (conds[cond.id]) {
                cond.excludingConditions.forEach(ex_cond => {
                   if (conds[ex_cond]) {
                       error = `"${cond}" не может быть выбрано при выбранном "${ex_cond}"`;
                   }
                });
            }
        });
        if (error) {
            alert(error);
            return;
        }
        storage.setLoanParams(params);

        let payload = {
            clientTypes: settings.clientTypes,
            language: settings.language,
            settingsName: settings.name,
            ...params
        };
        let raw_resp = await fetch('/calculate', {method: 'POST', body: JSON.stringify(payload)});
        let resp = await raw_resp.json();
        storage.setLoanResponse(resp);

        payload = {
            contractRate: resp.result.contractRate,
            lastPayment: resp.result.lastPayment,
            loanAmount: resp.result.loanAmount,
            term: resp.result.term,
            payment: resp.result.payment
        };
        raw_resp = await fetch('/payments-graph', {method: 'POST', body: JSON.stringify(payload)});
        resp = await raw_resp.json();
        storage.setPaymentGraph(resp.payments);
    }
};

export default Calculate;