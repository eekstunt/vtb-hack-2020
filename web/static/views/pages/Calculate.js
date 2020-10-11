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
                    <label for="cost">Стоимость машины: </label>
                    <input class="my_input" id="cost" type="number" value="${params.cost}">
                </div>
                <div class="field">
                    <label for="initialFee">Начальный взнос: </label>
                    <input class="my_input" id="initialFee" type="number" value="${params.initialFee}">
                </div>
                <div class="field">
                    <label for="kaskoValue">Стоимость КАСКО: </label>
                    <input class="my_input" id="kaskoValue" type="number" value="${params.kaskoValue}">
                </div>
                <div class="field">
                    <label for="residualPayment">Остаточный платёж: </label>
                    <input class="my_input" id="residualPayment" type="number" value="${params.residualPayment}">
                </div>
                <div class="field">
                    <label for="term">Срок погашения: </label>
                    <input class="my_input" id="term" type="number" value="${params.term}">
                </div>
                ${settings.specialConditions.map(cond => `
                    <div class="field">
                        <input class="my_input" id="${cond['id']}" name='${cond['id']}'
                         type="checkbox"${params.specialConditions.indexOf(cond.id) >= 0 ? ' checked' : ''}>
                        <label for="${cond['id']}">${cond['name']}</label>
                    </div>
                `).join('')}
                <button id="recalc">Рассчитать параметры кредита</button>
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
                <div class="overflow">
                <table>
                    ${graphRows.map(row => `
                        <tr>
                            ${row.map(item => `<td>${item}</td>`).join('\n')}
                        </tr>
                    `).join('\n')}
                </table>
                </div>
                `}
                <button id="get_loan">Взять кредит с такими параметрами</button>
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
        document.getElementById("recalc").addEventListener('click', async () => {
            await Calculate.recalc();
            document.getElementById('calc_container').innerHTML = await Calculate.doRender();
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