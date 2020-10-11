// --------------------------------
//  Define Data Sources
// --------------------------------

import storage from '../../services/Storage.js'
import Utils from '../../services/Utils.js'

let SelectImage = {
    render : async () => {
        return `
            <section class="section">
                <div class="file is-link is-boxed is-centered">
                    <label class="file-label" for="img">
                        <input class="file-input" type="file" id="img" name="img" accept="image/*">
                        <span class="file-cta">
                            <span class="file-label">
                                Сфотографировать машину
                            </span>
                        </span>
                    </label>
                </div>
            </section>
        `;
    }

    , after_render: async () => {
        const fileInput = document.getElementById('img');
        fileInput.addEventListener('change', async () => {
            if (fileInput.files.length === 0) {
                return;
            }
            const file = fileInput.files[0];
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