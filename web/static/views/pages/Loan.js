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
                    <label for="first_name" class="label">Имя: </label>
                    <div class="control">
                        <input class="input" id="first_name" type="text" placeholder="Иван">
                    </div>
                </div>
                <div class="field">
                    <label for="middle_name" class="label">Отчество: </label>
                    <div class="control">
                        <input class="input" id="middle_name" type="text" placeholder="Иванович">
                    </div>
                </div>
                <div class="field">
                    <label for="family_name" class="label">Фамилия: </label>
                    <div class="control">
                        <input class="input" id="family_name" type="text" placeholder="Иванов">
                    </div>
                </div>
                <div class="field">
                    <label for="male" class="radio">
                        <input type="radio" id="male" name="gender" value="male" checked>
                        Мужчина
                    </label>
                    
                    <label for="female" class="radio">
                        <input type="radio" id="female" name="gender" value="female">
                        Женщина
                    </label>
                </div>
                <div class="field">
                    <label for="email" class="label">Email: </label>
                    <div class="control">
                        <input class="input" id="email" type="email" placeholder="ivan.ivanov@example.com">
                    </div>
                </div>
                <div class="field">
                    <label for="phone" class="label">Телефон: </label>
                    <div class="control">
                        <input class="input" id="phone" type="text" placeholder="+79990000000">
                    </div>
                </div>
                <div class="field">
                    <label for="birth_date_time" class="label">Дата рождения: </label>
                    <div class="control">
                        <input class="input" id="birth_date_time" type="date">
                    </div>
                </div>
                <div class="field">
                    <label for="birth_place" class="label">Место рождения: </label>
                    <div class="control">
                        <input class="input" id="birth_place" type="text" placeholder="г. Воронеж">
                    </div>
                </div>
                <div class="field">
                    <label for="nationality_country_code" class="label">Национальность (код страны): </label>
                    <div class="control">
                        <input class="input" id="nationality_country_code" type="text" placeholder="RU" maxlength="2">
                    </div>
                </div>
                <div class="field">
                    <label for="income_amount" class="label">Среднемесячная зарплата: </label>
                    <div class="control">
                        <input class="input" id="income_amount" type="number" placeholder="140000">
                    </div>
                </div>
                <div class="field">
                    <label for="comment" class="label">Комментарий: </label>
                    <div class="control">
                        <textarea class="textarea" id="comment" placeholder=""></textarea>
                    </div>
                </div>
                <button id="submit" class="button is-link">Оставить заявку</button>
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
        const btn = document.getElementById("submit");
        btn.classList.add('is-loading');
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
            await Loan.renderApplicationInfo();
        } catch (err) {
            console.log(err);
            appInfoHolder.style.display = 'none';
            alert('error');
        }
        btn.classList.remove('is-loading');
    }
};

export default Loan;