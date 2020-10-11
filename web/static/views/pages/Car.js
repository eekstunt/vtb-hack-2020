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
                <div class="columns is-mobile is-centered">
                    <div class="column is-half">
                        <p id="title"> <b>${storage.car}</b>: </p>
                        <div id="car_info">Loading info...</div>
                        <button id="calculate" class="button is-link">Открыть калькулятор</button>
                    </div>
                </div>
            </section>
        `
    }

    , after_render: async () => {
        let carInfo = await storage.getCarInfo();
        let carInfoHolder = document.getElementById("car_info");
        carInfoHolder.innerHTML = `
            <img src="${carInfo['photo']}" style="transform: scaleX(-1)"/>
            <p>Цена &mdash; от ${carInfo['price']} ₽</p> 
        `;
        document.getElementById('title').innerHTML = `<b>${carInfo.makeModelRus}</b>`;
        document.getElementById("calculate").addEventListener('click', async () => {
            const loanParams = await storage.getLoanParams();
            loanParams.cost = storage.carInfo.price;
            storage.setLoanParams(loanParams);
            Utils.goto('/calculator');
        });
    }
};

export default Car;