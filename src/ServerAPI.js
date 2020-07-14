import Axios from "axios";
import { API_ENDPOINT, EMSCAN_ENDPOINT, UPLOAD_ENDPOINT } from './constants/index'

const ServerAPI = {
    getAddress(address) {
        return new Promise((resolve, reject) => {
            Axios.get(`${EMSCAN_ENDPOINT}/getAddress/${address}`)
                .then(res => (resolve(res.data)))
                .catch(error => (reject(error.response.data)))
        })
    },

    getNewFeed(myAddress, typeNewFeed = 'trending', pageSize = 10, page = 1) {
        return new Promise((resolve, reject) => {
            Axios.get(`${API_ENDPOINT}/getNewFeed?page=${page}&pageSize=${pageSize}&address=${myAddress}&type=${typeNewFeed}`)
                .then(res => (resolve(res.data)))
                .catch(error => (reject(error.response.data)))
        })
    },

    getCountry() {
        return new Promise((resolve, reject) => {
            Axios.get(`https://geolocation-db.com/json/`)
                .then(res => (resolve(res.data)))
                .catch(error => (reject(error)))
        })
    },

    getMyPost(address, myAddress, pageSize = 5, page = 1) {
        return new Promise((resolve, reject) => {
            Axios.get(`${API_ENDPOINT}/getMyPost/${address}/${myAddress}?page=${page}&pageSize=${pageSize}`)
                .then(res => (resolve(res.data)))
                .catch(error => (reject(error.response.data)))
        })
    },

    getMyFollow(address) {
        return new Promise((resolve, reject) => {
            Axios.get(`${API_ENDPOINT}/getMyFollow/${address}`)
                .then(res => (resolve(res.data)))
                .catch(error => (reject(error.response.data)))
        })
    },

    getMyFollower(address) {
        return new Promise((resolve, reject) => {
            Axios.get(`${API_ENDPOINT}/getMyFollower/${address}`)
                .then(res => (resolve(res.data)))
                .catch(error => (reject(error.response.data)))
        })
    },

    getAddressByKey(key, page = 1, pageSize = 20) {
        return new Promise((resolve, reject) => {
            Axios.get(`${EMSCAN_ENDPOINT}/getAddressByKey/${key}?page=${page}&pageSize=${pageSize}`)
                .then(res => (resolve(res.data)))
                .catch(error => (reject(error.response.data)))
        })
    },

    getPostByKey(key, page = 1, pageSize = 20) {
        return new Promise((resolve, reject) => {
            Axios.get(`${API_ENDPOINT}/getPostByKey/${key}?page=${page}&pageSize=${pageSize}`)
                .then(res => (resolve(res.data)))
                .catch(error => (reject(error.response.data)))
        })
    },

    getPostByTag(tag, page = 1, pageSize = 20) {
        return new Promise((resolve, reject) => {
            Axios.get(`${API_ENDPOINT}/getPostByTag/${tag}?page=${page}&pageSize=${pageSize}`)
                .then(res => (resolve(res.data)))
                .catch(error => (reject(error.response.data)))
        })
    },

    getTagTrending(limit = 15) {
        return new Promise((resolve, reject) => {
            Axios.get(`${API_ENDPOINT}/getTagTrending?limit=${limit}`)
                .then(res => (resolve(res.data)))
                .catch(error => (reject(error.response.data)))
        })
    },

    getNotification(address, page = 1, pageSize = 20) {
        return new Promise((resolve, reject) => {
            Axios.get(`${API_ENDPOINT}/getNotification/${address}?page=${page}&pageSize=${pageSize}`)
                .then(res => (resolve(res.data)))
                .catch(error => (reject(error.response.data)))
        })
    },

    getPostDetailByPostId(postId, myAddress) {
        return new Promise((resolve, reject) => {
            Axios.get(`${API_ENDPOINT}/getPostDetailByPostId/${postId}?address=${myAddress}`)
                .then(res => (resolve(res.data)))
                .catch(error => (reject(error.response.data)))
        })
    },

    getPostRightNavbar(myAddress) {
        return new Promise((resolve, reject) => {
            Axios.get(`${API_ENDPOINT}/getPostRightNavbar?address=${myAddress}`)
                .then(res => (resolve(res.data)))
                .catch(error => (reject(error.response.data)))
        })
    },

    checkFollowed(address, target) {
        return new Promise((resolve, reject) => {
            Axios.get(`${API_ENDPOINT}/checkFollowed/${address}/${target}`)
                .then(res => (resolve(res.data)))
                .catch(error => (reject(error.response.data)))
        })
    },

    getAddressByUsername(username) {
        return new Promise((resolve, reject) => {
            Axios.get(`${EMSCAN_ENDPOINT}/getAddressByUsername/${username}`)
                .then(res => (resolve(res.data)))
                .catch(error => (reject(error.response.data)))
        })
    },

    getPostDetailByTag(myAddress, tag, pageSize = 10, page = 1) {
        return new Promise((resolve, reject) => {
            Axios.get(`${API_ENDPOINT}/getPostDetailByTag/${tag}?page=${page}&pageSize=${pageSize}&address=${myAddress}`)
                .then(res => (resolve(res.data)))
                .catch(error => (reject(error.response.data)))
        })
    },

    getUsernameByKey(key, pageSize = 10, page = 1) {
        return new Promise((resolve, reject) => {
            Axios.get(`${EMSCAN_ENDPOINT}/getUsernameByKey/${key}?page=${page}&pageSize=${pageSize}`)
                .then(res => (resolve(res.data)))
                .catch(error => (reject(error.response.data)))
        })
    },

    getTagByKey(key, pageSize = 10, page = 1) {
        return new Promise((resolve, reject) => {
            Axios.get(`${API_ENDPOINT}/getTagByKey/${key}?page=${page}&pageSize=${pageSize}`)
                .then(res => (resolve(res.data)))
                .catch(error => (reject(error.response.data)))
        })
    },

    getTagSuggestions(title, pageSize = 10, page = 1) {
        return new Promise((resolve, reject) => {
            Axios.get(`${API_ENDPOINT}/getTagSuggestions/${title}?page=${page}&pageSize=${pageSize}`)
                .then(res => (resolve(res.data)))
                .catch(error => (reject(error.response.data)))
        })
    },

    getTopFollow(myAddress, pageSize = 5, page = 1) {
        return new Promise((resolve, reject) => {
            Axios.get(`${API_ENDPOINT}/getTopFollow/${myAddress}?page=${page}&pageSize=${pageSize}`)
                .then(res => (resolve(res.data)))
                .catch(error => (reject(error.response.data)))
        })
    },

    getCountMyPost(address, myAddress) {
        return new Promise((resolve, reject) => {
            Axios.get(`${API_ENDPOINT}/getCountMyPost/${address}/${myAddress}`)
                .then(res => (resolve(res.data)))
                .catch(error => (reject(error.response.data)))
        })
    },

    getCountPostByTag(tag) {
        return new Promise((resolve, reject) => {
            Axios.get(`${API_ENDPOINT}/getCountPostByTag/${tag}`)
                .then(res => (resolve(res.data)))
                .catch(error => (reject(error.response.data)))
        })
    },

    activeAddress(myAddress, response) {
        return new Promise((resolve, reject) => {
            Axios.post(`${API_ENDPOINT}/activeAddress`, { myAddress, response })
                .then(res => (resolve(res.data)))
                .catch(error => (reject(error.response.data)))
        })
    },

    getComments(postId, address, page, pageSize = 20) {
        return new Promise((resolve, reject) => {
            Axios.get(`${API_ENDPOINT}/getComments/${postId}?pageSize=${pageSize}&address=${address}&page=${page}`)
                .then(res => (resolve(res.data)))
                .catch(error => (reject(error.response.data)))
        })
    },

    getReplys(postId, commentId, page, limit = 20) {
        return new Promise((resolve, reject) => {
            Axios.get(`${API_ENDPOINT}/getReplys/${postId}/${commentId}?limit=${limit}&page=${page}`)
                .then(res => (resolve(res.data)))
                .catch(error => (reject(error.response.data)))
        })
    },

    uploadGif(data) {
        return new Promise((resolve, reject) => {
            Axios.post(`${UPLOAD_ENDPOINT}/uploadGif`, data)
                .then(res => (resolve(res.data)))
                .catch(error => (reject(error.response.data)))
        })
    },

    uploadVideo(data, config) {
        return new Promise((resolve, reject) => {
            Axios.post(`${UPLOAD_ENDPOINT}/uploadVideo`, data, config)
                .then(res => (resolve(res.data)))
                .catch(error => (reject(error.response.data)))
        })
    },

    uploadPhoto(data, size, noWatermask = true) {
        if (noWatermask) {
            return new Promise((resolve, reject) => {
                Axios.post(`${UPLOAD_ENDPOINT}/uploadPhoto?noWatermask=${noWatermask}&size=${size}`, data)
                    .then(res => (resolve(res.data)))
                    .catch(error => (reject(error.response.data)))
            })
        } else {
            return new Promise((resolve, reject) => {
                Axios.post(`${UPLOAD_ENDPOINT}/uploadPhoto?size=${size}`, data)
                    .then(res => (resolve(res.data)))
                    .catch(error => (reject(error.response.data)))
            })
        }
    },

    getValidatePost(address) {
        return new Promise((resolve, reject) => {
            Axios.get(`${API_ENDPOINT}/getValidatePost/${address}`)
                .then(res => (resolve(res.data)))
                .catch(error => (reject(error.response.data)))
        })
    },

    getStaking(address) {
        return new Promise((resolve, reject) => {
            Axios.get(`${EMSCAN_ENDPOINT}/getStaking/${address}`)
                .then(res => (resolve(res.data)))
                .catch(error => (reject(error.response.data)))
        })
    },

    updateCountNoti(address) {
        Axios.put(`${API_ENDPOINT}/updateCountNoti/${address}`)
    },

    getAuthHash(address) {
        return new Promise((resolve, reject) => {
            Axios.get(`${API_ENDPOINT}/getAuthHash/${address}`)
                .then(res => (resolve(res.data)))
                .catch(error => (reject(error.response.data)))
        })
    },

    getDataRewards(myAddress, selectedChildMenu = 'Post', page = 1, pageSize = 5) {
        return new Promise((resolve, reject) => {
            Axios.get(`${API_ENDPOINT}/getDataRewards/${myAddress}?page=${page}&pageSize=${pageSize}&type=${selectedChildMenu}`)
                .then(res => (resolve(res.data)))
                .catch(error => (reject(error.response.data)))
        })
    },

    getPostReport(type, myAddress, page = 1, pageSize = 20) {
        return new Promise((resolve, reject) => {
            Axios.get(`${API_ENDPOINT}/getPostReport/${type}?page=${page}&pageSize=${pageSize}&address=${myAddress}`)
                .then(res => (resolve(res.data)))
                .catch(error => (reject(error.response.data)))
        })
    },
}

export default ServerAPI;
