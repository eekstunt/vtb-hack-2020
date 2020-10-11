const Utils = { 
    // --------------------------------
    //  Parse a url and break it into resource, id and verb
    // --------------------------------
    parseRequestURL : () => {

        let url = location.hash.slice(1).toLowerCase() || '/';
        let r = url.split("/")
        let request = {
            resource    : null,
            id          : null,
            verb        : null
        }
        request.resource    = r[1]
        request.id          = r[2]
        request.verb        = r[3]

        return request
    }

    // --------------------------------
    //  Simple sleep implementation
    // --------------------------------
    , sleep: (ms) => {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    , goto: (url) => {
        window.location.hash = url;
    }

    , argmax: (obj) => {
        let max = null;
        let argmax = null;
        Object.keys(obj).forEach((key) => {
            let value = obj[key];
            if (max === null || value > max) {
                max = value;
                argmax = key;
            }
        });
        return argmax;
    }
};

export default Utils;