import storage from '../../services/Storage.js'
import Utils from "../../services/Utils.js";

const IDS = [
    'first_name', 'middle_name', 'family_name', 'email', 'phone',
    'birth_date_time', 'birth_place', 'nationality_country_code', 'income_amount', 'comment'];

const STATUS_MESSAGES = {
    'prescore_approved': 'Кредит одобрен!',
    'processing': 'Заявка находится в обработке. С вами свяжутся сотрудники банка.',
    'prescore_denied': 'К сожалению, в кредите отказано.'
};


let Loan = {
    render: async () => {
        if (storage.car === null) {
            Utils.goto('/');
            return;
        }
        if (storage.loanResponse === null) {
            Utils.goto('/calculator');
            return;
        }

        return `
            <section class="section">
                <div class="field">
                    <label for="first_name">Имя: </label>
                    <input class="my_input" id="first_name" type="text" placeholder="Иван">
                </div>
                <div class="field">
                    <label for="middle_name">Отчество: </label>
                    <input class="my_input" id="middle_name" type="text" placeholder="Иванович">
                </div>
                <div class="field">
                    <label for="family_name">Фамилия: </label>
                    <input class="my_input" id="family_name" type="text" placeholder="Иванов">
                </div>
                <div class="field">
                    <input type="radio" id="male" name="gender" value="male" checked>
                    <label for="male">Мужчина</label>
                    
                    <input type="radio" id="female" name="gender" value="female">
                    <label for="female">Женщина</label>
                </div>
                <div class="field">
                    <label for="email">Email: </label>
                    <input class="my_input" id="email" type="email" placeholder="ivan.ivanov@example.com">
                </div>
                <div class="field">
                    <label for="phone">Телефон: </label>
                    <input class="my_input" id="phone" type="text" placeholder="+79990000000">
                </div>
                <div class="field">
                    <label for="birth_date_time">Дата рождения: </label>
                    <input class="my_input" id="birth_date_time" type="date">
                </div>
                <div class="field">
                    <label for="birth_place">Место рождения: </label>
                    <input class="my_input" id="birth_place" type="text" placeholder="г. Воронеж">
                </div>
                <div class="field">
                    <label for="nationality_country_code">Национальность (код страны): </label>
                    <input class="my_input" id="nationality_country_code" type="text" placeholder="RU" maxlength="2">
                </div>
                <div class="field">
                    <label for="income_amount">Среднемесячная зарплата: </label>
                    <input class="my_input" id="income_amount" type="number" placeholder="140000">
                </div>
                <div class="field">
                    <label for="comment">Комментарий: </label>
                    <textarea class="my_input" id="comment" placeholder=""></textarea>
                </div>
                <button id="submit">Оставить заявку</button>
            </section>
            <section class="section">
                <div id="application_info" style="display: none"></div>
            </section>`
    }

    , after_render: async () => {
        document.getElementById("submit").addEventListener("click", Loan.submit);
        Loan.renderApplicationInfo();
        if (storage.loanFormData !== null) {
            const formData = storage.loanFormData;
            IDS.forEach(id => {document.getElementById(id).value = formData[id];});
            document.getElementById(formData.gender).checked = true;
            document.getElementById(formData.gender === 'male' ? 'female' : 'male').checked = false;
        }
    }

    , renderApplicationInfo: async () => {
        const appInfoHolder = document.getElementById("application_info");
        if (storage.applicationInfo === null) {
            appInfoHolder.style.display = 'none';
            return;
        }
        const appInfo = storage.applicationInfo.application;
        const report = appInfo.decision_report;
        let details = '';
        if (report.application_status === 'prescore_approved') {
            details = `
                <p>Выплата по кредиту составит ${report.monthly_payment.toFixed(2)} ₽/мес.</p>
                <p>Предложение действует с ${report.decision_date} по ${report.decision_end_date}.</p>`;
        }
        appInfoHolder.innerHTML = `
            <p>Номер заявки: ${appInfo.VTB_client_ID}</p>
            <p>${STATUS_MESSAGES[report.application_status]} Комментарий: ${report.comment}.</p>
            ${details}`;
        appInfoHolder.style.display = 'block';
    }

    , submit: async () => {
        let formData = {};
        IDS.forEach( id => {formData[id] = document.getElementById(id).value;});
        formData.gender = document.querySelector('input[name="gender"]:checked').value;
        formData.nationality_country_code = formData.nationality_country_code.toUpperCase();
        storage.setLoanFormData(formData);

        const appInfoHolder = document.getElementById("application_info");
        appInfoHolder.innerHTML = `Посылаем заявку...`;
        appInfoHolder.style.display = 'block';
        try {
            const person = {};
            ['first_name', 'middle_name', 'family_name', 'birth_date_time',
                'birth_place', 'nationality_country_code', 'gender'].forEach(
                    key => {person[key] = formData[key]});

            const result = storage.loanResponse.result;
            const payload = {
                comment: formData['comment'],
                customer_party: {
                    person: person,
                    email: formData['email'],
                    phone: formData['phone'],
                    income_amount: formData['income_amount']
                },
                datetime: new Date().toISOString(),
                trade_mark: storage.carInfo.make,
                vehicle_cost: storage.carInfo.price,
                interest_rate: result.contractRate,
                requested_amount: result.loanAmount,
                requested_term: result.term * 12
            };
            const raw_resp = await fetch('/carloan', {method: 'POST', body: JSON.stringify(payload)});
            const resp = await raw_resp.json();
            storage.setApplicationInfo(resp);
            Loan.renderApplicationInfo();
        } catch (err) {
            console.log(err);
            alert('error');
        }
    }
};

export default Loan;