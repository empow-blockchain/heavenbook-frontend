import Axios from "axios";
import { BLOCKCHAIN_ENDPOINT } from './constants/index'

const BlockchainAPI = {
    getContractStorage(id, key, field = '') {
        return new Promise ( (resolve,reject) => {
            Axios.post(`${BLOCKCHAIN_ENDPOINT}/getContractStorage`, JSON.stringify({
                id,
                key,
                field
            }))
            .then(res => (resolve(JSON.parse(res.data.data))))
            .catch(error => (reject(error.response.data)))
        })
    },

    getReportTagArray() {
        return this.getContractStorage("social.empow", "reportTagArray")
    },

    getBlockNumber () {
        return new Promise( (resolve,reject) => {
            Axios.get(`${BLOCKCHAIN_ENDPOINT}/getChainInfo`).then(res => {
                resolve(parseInt(res.data.head_block))
            }).catch(error => (reject(error.response.data)))
        })
    }
}

export default BlockchainAPI;