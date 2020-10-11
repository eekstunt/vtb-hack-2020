// --------------------------------
//  Define Data Sources
// --------------------------------

import storage from '../../services/Storage.js'
import Utils from '../../services/Utils.js'

let SelectImage = {
    render : async () => {
        return `
            <section class="section">
                <h1> Сфотографируйте машину </h1>
                <form id="image_form">
                  <label for="img">Загрузить фотографию</label>
                  <input type="file" id="img" name="img" accept="image/*">
                  <br/><input type="submit" value="Отправить">
                </form>
            </section>
        `;
    }

    , after_render: async () => {
        document.getElementById('image_form').addEventListener('submit', async (event) => {
            event.preventDefault();
            const file = document.getElementById('img').files[0];
            try {
                const raw_resp = await fetch('/car-recognize', {method: 'POST', body: file});
                const resp = await raw_resp.json();
                storage.setProbabilities(resp.probabilities);
                Utils.goto('/car');
            } catch (err) {
                console.log('Error at /car-recognize', err);
                alert('error');
            }
        });
    }
};

export default SelectImage;