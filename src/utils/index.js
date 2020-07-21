import { isBuffer } from "lodash";

const Utils = {
    formatCurrency(amount, decimalCount = 8, decimal = ".", thousands = ",") {
        decimalCount = Math.abs(decimalCount);
        decimalCount = isNaN(decimalCount) ? 8 : decimalCount;

        const negativeSign = amount < 0 ? "-" : "";

        let i = parseFloat(parseInt(amount = Math.abs(Number(amount) || 0).toFixed(decimalCount)).toString()).toString()
        let j = (i.length > 3) ? i.length % 3 : 0;

        let decimalPart = decimalCount ? Math.abs(amount - i).toFixed(decimalCount).slice(2) : ""
        decimalPart = '0.' + decimalPart

        if (parseFloat(decimalPart) === 0) {
            decimalPart = ''
        } else {
            decimalPart = parseFloat(decimalPart).toString().substring(1, decimalPart.length)
        }

        return negativeSign + (j ? i.substr(0, j) + thousands : '') + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousands) + decimalPart;
    },

    convertDate(timestamp) {
        var a = new Date(timestamp);
        var year = a.getFullYear();
        var month = a.getMonth() + 1;
        if (month < 10) {
            month = '0' + month.toString()
        }
        var date = a.getDate();
        if (date < 10) {
            date = '0' + date.toString()
        }
        var time = date + '/' + month + '/' + year;
        return time;
    },


    convertDateTime(nanoTime) {
        var timestamp = nanoTime / 10 ** 9
        var a = new Date(timestamp * 1000);
        var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        var year = a.getFullYear();
        var month = months[a.getMonth()];
        var date = a.getDate();
        var hour = a.getHours();
        var min = a.getMinutes();
        var sec = a.getSeconds();
        var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec;
        return time;
    },

    convertLevel(level) {
        if (level === 2) {
            return 'Members'
        }

        if (level === 3) {
            return 'LT members'
        }

        if (level === 4) {
            return 'Rising stars'
        }

        if (level === 5) {
            return 'Stars and legends'
        }

        if (level === 6) {
            return 'Thinker'
        }

        return 'New members'
    },

    validateYouTubeUrl(url) {
        if (url !== undefined || url !== '') {
            var regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|\?v=)([^#\&\?]*).*/;
            var match = url.match(regExp);
            if (match && match[2].length === 11) {
                return true;
            } else {
                return false;
            }
        }
    },

    getVideoIdYoutube(link) {
        var video_id = link.split('v=')[1];
        var ampersandPosition = video_id.indexOf('&');
        if (ampersandPosition !== -1) {
            video_id = video_id.substring(0, ampersandPosition);
        }

        return video_id
    },

    properCase(string) {
        return string.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
    },

    getTransactionErrorMessage(message) {
        let regex = /Stack tree: \nError: (.*)/gm;
        let m = regex.exec(message)

        if(m && m[1]) return m[1]

        regex = /error: (.*)/gm;
        m = regex.exec(message)

        if(m && m[1]) {
            try {
                const json = JSON.parse(m[1])
                return json.message
            } catch {
                return m[1]
            }
        }

        return message
    },

    sendAction(tx, gasLimit = 100000, type = "success") {
        return new Promise( (resolve, reject) => {
            tx.addApprove("*", "unlimited")
            tx.setGas(1, gasLimit)

            if(!window || !window.empow) {
                return reject("Please install Empow Wallet Extension")
            }

            const handler = window.empow.signAndSend(tx)
    
            handler.on("failed", async (error) => {
                // check if pay ram fail -> buy ram
                let errorMessage = this.getTransactionErrorMessage(error)
                errorMessage = errorMessage.message ? errorMessage.message : errorMessage

                if(errorMessage.includes("pay ram failed")) {
                    const ramNeed = errorMessage.match(/need\s(.*),/)[1]
                    const address = await window.empow.enable()
                    const txBuyRam = window.empow.callABI("ram.empow", "buy", [address, address, parseInt(ramNeed)])

                    this.sendAction(txBuyRam).then( () => {
                        this.sendAction(tx).then(res => resolve(res)).catch(error => reject(error))
                    })
                } else {
                    reject(this.getTransactionErrorMessage(error))
                }
            })
            
            if(type ===  "success") {
                handler.on("success", (res) => {
                    resolve(res)
                })
            }

            if (type ===  "pending") {
                handler.on("pending", (tx_hash) => {
                    resolve({tx_hash})
                })
            }
            
        })
    },

    checkNormalUsername(username) {
        if(username.length < 6 || username.length > 32) {
            return "Username length must 6-32 characters"
        }
        for (let i in username) {
            let ch = username[i];
            if (!(ch >= 'A' && ch <= 'z' || ch >= '0' && ch <= '9')) {
                return "username invalid. username contains invalid character > " + ch
            }
        }

        return true
    },

    calcCanWithdraw(currentBlock, realLikeArray, lastBlockWithdraw) {
        if(!Array.isArray(realLikeArray)) return 0

        const BLOCK_NUMBER_PER_DAY = 172800
        let canWithdraw = 0

        for(let i = 0; i < realLikeArray.length; i++) {
            if(typeof realLikeArray[i] === "number") {
                canWithdraw += realLikeArray[i]
            }
        }

        const lastLikeDay = Math.floor(lastBlockWithdraw / BLOCK_NUMBER_PER_DAY)
        const currentDay = Math.floor(currentBlock / BLOCK_NUMBER_PER_DAY)

        if(lastLikeDay + realLikeArray.length > currentDay) {
            canWithdraw -= realLikeArray[realLikeArray.length - 1]
        }

        return canWithdraw
    }
}

export default Utils