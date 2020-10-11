import Utils        from './../../services/Utils.js'
import storage from '../../services/Storage.js'

let Car = {
    render : async () => {
        if (typeof storage.car !== 'string') {
            Utils.goto('/');
            return;
        }
        return `
            <section class="section">
                <p> ${storage.car}: </p>
                <div id="car_info">Loading info...</div>
                <button id="calculate">Открыть калькулятор</button>
            </section>
        `
    }

    , after_render: async () => {
        let carInfo = await storage.getCarInfo();
        let carInfoHolder = document.getElementById("car_info");
        carInfoHolder.innerHTML = `
            <img src="${carInfo['photo']}" />
            <p>Цена &mdash; от ${carInfo['price']} ₽</p> 
        `;
        document.getElementById("calculate").addEventListener('click', async () => {
            const loanParams = await storage.getLoanParams();
            loanParams.cost = storage.carInfo.price;
            storage.setLoanParams(loanParams);
            Utils.goto('/calculator');
        });
    }
};

export default Car;