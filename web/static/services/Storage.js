import Utils from "./Utils.js";

const STORAGE_KEYS = [
    'probabilities', 'car', 'marketplace', 'carInfo', 'loanFormData', 'applicationInfo',
    'settings', 'loanParams', 'loanResponse', 'paymentGraph'];
const LOAN_PARAM_KEYS = ['cost', 'initialFee', 'kaskoValue', 'residualPayment', 'term', 'specialConditions'];

class Storage {
    probabilities = null;
    car = null;
    marketplace = null;
    carInfo = null;
    loanFormData = null;
    applicationInfo = null;
    settings = null;
    loanParams = null;
    loanResponse = null;
    paymentGraph = null;

    save = () => {
        let toSave = {};
        STORAGE_KEYS.forEach(key => {
            toSave[key] = this[key];
            localStorage.setItem('storage', JSON.stringify(toSave));
        })
    };

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

    setLoanFormData = (formData) => {
        this.loanFormData = formData;
        this.save();
    };

    setApplicationInfo = (applicationInfo) => {
        this.applicationInfo = applicationInfo;
        this.save();
    };

    getSettings = async () => {
        if (this.settings === null) {
            const raw_resp = await fetch('/settings');
            this.settings = await raw_resp.json();
            this.save();
        }
        return this.settings;
    };

    getLoanParams = async () => {
        if (this.loanParams === null) {
            this.loanParams = {};
            LOAN_PARAM_KEYS.forEach(key => {this.loanParams[key] = null;});
            this.loanParams.term = 5;
            this.loanParams.residualPayment = 0;
        }
        const settings = await this.getSettings();
        LOAN_PARAM_KEYS.forEach(key => {
            if (this.loanParams[key] === null) {
                if (key === 'specialConditions') {
                    this.loanParams.specialConditions = [];
                    settings.specialConditions.forEach(cond => {
                        if (cond.isChecked) {
                            this.loanParams.specialConditions.push(cond.id);
                        }});
                } else {
                    this.loanParams[key] = settings[key === 'kaskoValue' ? 'kaskoDefaultValue' : key];
                }
            }
        });
        this.save();
        return {...this.loanParams};
    };

    setLoanParams = (params) => {
        this.loanParams = params;
        this.save();
    };

    setLoanResponse = (resp) => {
        this.loanResponse = resp;
        this.save();
    };

    setPaymentGraph = (resp) => {
        this.paymentGraph = resp;
        this.save();
    };
}

let createStorage = () => {
    let storage = new Storage();
    let savedStorage = localStorage.getItem('storage');
    if (savedStorage !== null) {
        try {
            savedStorage = JSON.parse(savedStorage);
            if (Object.keys(savedStorage).length !== STORAGE_KEYS.length) {
                throw new Error('Storage format mismatch');
            }
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
export {LOAN_PARAM_KEYS};