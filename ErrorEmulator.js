
export class ErrorEmulator {
    /**
     * 
     * @param {number} errSize upper bound for size of error, must be between 0 and 1
     * @param {boolean} negativeErr can errors be negative?
     */
    constructor(errSize, negativeErr = true) {
        this.errSize = errSize % 1;
        this.negativeErr = negativeErr;
    }

    createErr() {
        let rawErr = ((Math.random() - 0.5) * 2) * this.errSize;
        if (!this.negativeErr) rawErr = Math.abs(rawErr);
        //console.log(rawErr);
        return rawErr;
    }

    /**
     * 
     * @param {number} data 
     */
    emulateError(data) {
        let v = data + (data * this.createErr());
        //console.log(`data: ${data}, v: ${v}`);
        return v;
    }

    /**
     * 
     * @param {number[]} data array of numbers
     */
    emulateErrors(data) {
        return data.map(d => {
            return d + (d * createErr());
        });
    }



}