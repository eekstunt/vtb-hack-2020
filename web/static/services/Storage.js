import Utils from "./Utils.js";

const STORAGE_KEYS = ['probabilities', 'car', 'marketplace', 'carInfo'];

class Storage {
    probabilities = null;
    car = null;
    marketplace = null;
    carInfo = null;

    setProbabilities = probabilities => {
        this.probabilities = probabilities;
        this.car = Utils.argmax(storage.probabilities);
        this.save();
    };

    getMarketplace = async () => {
        if (this.marketplace === null) {
            try {
                const resp = await fetch(`/marketplace`);
                const marketplace = await resp.json();
                this.marketplace = marketplace.list;
                this.save();
                // console.log(json)
            } catch (err) {
                console.log('Error getting marketplace', err);
                alert('error');
            }
        }
        return this.marketplace;
    };

    getCarInfo = async () => {
        if (this.carInfo === null || this.carInfo.car !== this.car) {
            try {
                const resp = await fetch(`/get-car-info`, {
                    method: 'POST',
                    body: JSON.stringify({make_model: this.car})});
                this.carInfo = await resp.json();
                this.save();
            } catch (err) {
                console.log('Error getting car info', err);
                alert('error');
            }
        }
        return this.carInfo;
    };

    save = () => {
        let toSave = {};
        STORAGE_KEYS.forEach(key => {
            toSave[key] = this[key];
            localStorage.setItem('storage', JSON.stringify(toSave));
        })
    }
}

let createStorage = () => {
    let storage = new Storage();
    let savedStorage = localStorage.getItem('storage');
    if (savedStorage !== null) {
        try {
            savedStorage = JSON.parse(savedStorage);
            STORAGE_KEYS.forEach(key => {
                storage[key] = savedStorage[key];
            });
        } catch (err) {
            localStorage.setItem('storage', null);
            storage = new Storage();
        }
    }
    return storage;
};

const storage = createStorage();

export default storage;