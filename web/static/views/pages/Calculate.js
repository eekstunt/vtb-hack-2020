import storage from '../../services/Storage.js'
import Utils from "../../services/Utils.js";

let Calculate = {
    render : async () => {
        if (typeof storage.car !== 'string') {
            Utils.goto('/');
            return;
        }

        return `
            <section class="section">
                <h1> ${storage.carInfo.makeModelRus}: калькулятор кредита </h1>
                <button id="get_loan">Взять кредит</button>
            </section>
        `;
    },

    after_render: async () => {
        document.getElementById("get_loan").addEventListener('click', () => {
            alert('Берём кредит');
        });
    }
};

export default Calculate;