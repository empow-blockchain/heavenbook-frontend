import React, { Component } from 'react'
import { connect } from 'react-redux';
import {
    setMyAddress,
    setMyAccountInfo,
    setReportTagArray,
    setBlockNumber
} from '../reducers/appReducer'
import Router from 'next/router'
import LanguageService from '../services/LanguageService'
import BlockchainAPI from '../BlockchainAPI'
import ServerAPI from '../ServerAPI'
import Avatar from '../assets/images/avatar.svg'
import Utils from '../utils/index'
import Alert from 'react-s-alert';
import ReCAPTCHA from "react-google-recaptcha";
import Link from 'next/link'
import Socket from '../Socket'
import LoadMoreLoading from '../assets/images/load-more-loading.svg'
import IconPack from 'feather-icons'

class Header extends Component {

    constructor(props) {
        super(props);

        this.state = {
            searchText: '',
            myAddress: false,
            isAddressActived: true,
            captchaCode: false,
            typeUsername: "",
            isLoadingActiveWallet: false,
            listNoti: [],
            isLoadMore: true,
            page: 1,
            pageSize: 20,
            myAccountInfo: {},
            count_notification: 0
        }
    };

    async componentDidMount() {
        if (!window || !window.empow || !window.empow.enable) {
            return;
        }

        // google analytics
        window.dataLayer = window.dataLayer || []
        function gtag() {
            dataLayer.push(arguments);
        }
        gtag('js', new Date())
        gtag('config', 'UA-146070634-1')
        // end google analytics


        BlockchainAPI.getBlockNumber().then(blockNumber => {
            this.props.setBlockNumber(blockNumber)
        })

        var myAddress = await window.empow.enable()
        this.props.setMyAddress(myAddress);
        this.setState({
            myAddress
        })

        ServerAPI.getAddress(myAddress).then(myAccountInfo => {
            this.props.setMyAccountInfo(myAccountInfo);
            this.setState({
                myAccountInfo
            })
        }).catch(err => {
            this.setState({
                isAddressActived: false
            })
            return;
        })

        BlockchainAPI.getReportTagArray().then(reportTagArray => {
            this.props.setReportTagArray(reportTagArray)
        })

        ServerAPI.getCountNotification(myAddress).then(count_notification => {
            console.log(count_notification)
            this.setState({
                count_notification: parseInt(count_notification)
            })
        }).catch(err => {

        })


        var socket = await Socket.getSocket()

        socket.emit("get_new_like", myAddress)
        socket.on("res_new_like", (data) => {
            this.convertNoti(data)
            this.plusOneNoti()
        });

        socket.emit("get_new_comment", myAddress)
        socket.on("res_new_comment", (data) => {
            this.convertNoti(data)
            this.plusOneNoti()
        });

        socket.emit("get_new_reply", myAddress)
        socket.on("res_new_reply", (data) => {
            this.convertNoti(data)
            this.plusOneNoti()
        });

        socket.emit("get_new_like_comment", myAddress)
        socket.on("res_new_like_comment", (data) => {
            this.convertNoti(data)
            this.plusOneNoti()
        });

        socket.emit("get_new_follow", myAddress)
        socket.on("res_new_follow", (data) => {
            this.convertNotiFollow(data)
        });
    }

    onShowNoti = async () => {
        if (!this.state.showNoti) {
            ServerAPI.updateCountNoti(this.state.myAddress)
            this.setState({
                count_notification: 0
            })
            await this.getNoti(this.state.page, this.state.pageSize);
        }

        this.setState({
            showNoti: !this.state.showNoti
        })
    }

    isBottom(el) {
        return Math.round(el.getBoundingClientRect().bottom) === 550
    }

    trackScrolling = () => {
        if (!this.state.isLoadMore) {
            return;
        }
        const wrappedElement = document.getElementById('vanvan');
        if (this.isBottom(wrappedElement)) {
            console.log('header bottom reached');
            this.onLoadMore()
        }
    };

    onLoadMore = async () => {
        await this.getNoti(this.state.page + 1, this.state.pageSize)

        this.setState({
            page: this.state.page + 1
        })
    }

    getNoti = async (page, pageSize) => {
        var { myAddress } = this.state
        var newData = await ServerAPI.getNotification(myAddress, page, pageSize);
        if (newData.length === 0 || newData.length < pageSize) {
            this.setState({
                isLoadMore: false
            })
        } else {
            this.setState({
                isLoadMore: true
            })
        }

        var listNoti = [...this.state.listNoti, ...newData]
        if (page === 1) {
            listNoti = newData
        }
        this.setState({
            listNoti
        })
    }

    convertNoti = (data) => {
        var msg = ''
        if (data.action === 'like') {
            msg = `${data.username_last_action || data.last_action} liked your post: "${data.name}"`
        }

        if (data.action === 'comment') {
            msg = `${data.username_last_action || data.last_action} has commented your post: "${data.name}"`
        }

        if (data.action === 'reply') {
            msg = `${data.username_last_action || data.last_action} has replied your comment: "${data.title}"`
        }

        if (data.action === 'likeComment') {
            msg = `${data.username_last_action || data.last_action} has liked your comment: "${data.title}"`
        }

        console.log(msg)
        Alert.info(`<a href="/post/${data.postId}">${msg}</a>`, {
            position: 'bottom-left',
            effect: 'slide',
        });
    }

    plusOneNoti = () => {
        this.setState({
            count_notification: this.state.count_notification + 1
        })
    }

    convertNotiFollow = (data) => {
        Alert.info(`${data.selected_username_last_action || data.last_action} followed you`, {
            position: 'bottom-left',
            effect: 'slide',
        });
    }

    handleKeyDownSearch = (e) => {
        const { searchText } = this.state
        if (e.key === 'Enter') {
            Router.push("/search/[query]", "/search/" + searchText)
        }
    }

    activeWallet = async () => {
        const { captchaCode, typeUsername, myAddress } = this.state
        const isValid = Utils.checkNormalUsername(typeUsername)

        if (isValid !== true) {
            return Alert.error(isValid)
        }

        if (!captchaCode) {
            return Alert.error("Please check robot")
        }

        try {
            var address = await ServerAPI.getAddressByUsername(`newbie.${typeUsername}`)
            if (address) {
                return Alert.error("This username has already been used")
            }
        } catch (e) {

        }

        this.setState({
            isLoadingActiveWallet: true
        })

        ServerAPI.activeAddress(myAddress, captchaCode).then(res => {
            // set username
            const txBuyUsername = window.empow.callABI("auth.empow", "addNormalUsername", [myAddress, typeUsername])
            const txSaveUsername = window.empow.callABI("auth.empow", "selectUsername", ["newbie." + typeUsername])
            Utils.sendAction(txBuyUsername).then(() => {
                // hide modal
                this.setState({
                    isAddressActived: true,
                })

                Utils.sendAction(txSaveUsername)
            }).catch(err => {
                Alert.error(err)
            })

            let interval = setInterval(() => {
                ServerAPI.getAddress(myAddress).then(myAccountInfo => {
                    if (myAccountInfo.username) {
                        this.setState({
                            myAccountInfo
                        })

                        this.props.setMyAccountInfo(myAccountInfo)

                        clearInterval(interval)
                    }
                })
            }, 1000)
        })
    }

    renderModelActiveAddress() {

        const { isLoadingActiveWallet, typeUsername } = this.state

        return (
            <div className="overlay">
                <div className="waper">
                    <div className="dark-range"></div>
                    <div className="active-wallet">
                        <p className="title">Type your username</p>
                        <div className="input">
                            <span>newbie.</span>
                            <input onChange={(e) => this.setState({ typeUsername: e.target.value.toLowerCase() })} value={typeUsername} autoFocus={true} className="username-input" type="text"></input>
                        </div>
                        <ReCAPTCHA
                            sitekey="6LexM9UUAAAAAGIw-3nE_r7cC9hW9A90UoexM1ps"
                            onChange={(captchaCode) => this.setState({ captchaCode })}
                            className="recaptcha"
                        />
                        <button onClick={() => this.activeWallet()} className="btn-general-1" disabled={isLoadingActiveWallet}>{isLoadingActiveWallet ? "Saving..." : "Save"}</button>
                    </div>
                </div>
            </div>
        )
    }

    renderNoti() {
        var { listNoti, isLoadMore } = this.state

        if (listNoti.length === 0) {
            return (
                <ul className="waper-noti scroll">
                    <p>No notification</p>
                </ul>
            )
        }
        return (
            <ul id="vanvan" className="waper-noti scroll" onScroll={() => this.trackScrolling()}>
                {listNoti.map((value, index) => {
                    var msg = ''

                    if (value.action !== 'update') {
                        var name = `${value.username_last_action ? value.username_last_action : value.last_action.substr(0, 20) + '...'}`
                        var count = `${value.count_action > 1 ? ` and ${value.count_action - 1} others ` : ''}`
                    }

                    if (value.action === 'like') {
                        msg = `${name}${count} liked your post: "${value.name}"`
                    }

                    if (value.action === 'comment') {
                        msg = `${name}${count} commented your post: "${value.name}"`
                    }

                    if (value.action === 'reply') {
                        msg = `${name}${count} replied your comment: "${value.name}"`
                    }

                    if (value.action === 'likeComment') {
                        msg = `${name}${count} liked your comment: "${value.name}"`
                    }

                    if (value.action === 'update') {
                        msg = `Update post: ${value.name}`
                    }

                    var avatar = value.address.profile ? (value.address.profile.avatar50 ? value.address.profile.avatar50 : (value.address.profile.avatar ? value.address.profile.avatar : Avatar)) : Avatar
                    return (
                        <Link href="/post/[postId]" as={`/post/${value.postId}`} key={index}>
                            <a href={`/post/${value.postId}`} className="noti">
                                <div className="child-noti">
                                    <img className="waper-ava" src={avatar} alt="photos"></img>
                                    <p style={{ lineHeight: '25px' }}>{msg}</p>
                                </div>
                                <p className="time">{Utils.convertDateTime(value.time)}</p>
                            </a>

                        </Link>
                    )
                })}
                {isLoadMore && <div className="load-more-post">
                    <img src={LoadMoreLoading} alt="photos"></img>
                </div>}
            </ul>
        )
    }

    render() {
        var { myAddress, myAccountInfo, isAddressActived, count_notification } = this.state
        var profile = myAccountInfo.profile || {}
        var avatar = profile.avatar50 ? profile.avatar50 : (profile.avatar ? profile.avatar : Avatar)
        return (

            <header id="header">
                <div className="container">
                    <div className="header-top">
                        <div className="brand-logo">
                            <a href="/">
                                <img src="/img/Group 8281.png" alt="" />
                                <span> HeavenBook</span>
                            </a>
                            <div className="brand-search">
                                <input type="text" placeholder={LanguageService.changeLanguage('Search')} onKeyDown={this.handleKeyDownSearch} onChange={(e) => this.setState({ searchText: e.target.value })} />
                            </div>
                        </div>
                        {!myAddress && <div className="brand-login">
                            <div className="modal-login">
                                <a href="#">{LanguageService.changeLanguage('Login')}</a>
                                <img src="/img/Group 8341.png" alt="" />
                            </div>
                        </div>}

                        {myAddress && <div className="account-info">
                            <div className="left waper-icon">
                                {count_notification === 0 && <span onClick={() => this.onShowNoti()} dangerouslySetInnerHTML={{ __html: IconPack.icons.bell.toSvg({ stroke: "white", width: 32, height: 32, 'stroke-width': 1 }) }}></span>}
                                {count_notification > 0 && <span className="notification-icon"
                                    onClick={() => this.onShowNoti()}
                                    dangerouslySetInnerHTML={{ __html: `<p class="number">${count_notification > 99 ? '99+' : count_notification}</p>` + IconPack.icons.bell.toSvg({ stroke: "white", fill: "white", width: 32, height: 32, 'stroke-width': 1 }) }}></span>}
                            </div>

                            <div className="right">
                                <Link href="/[account]" as={`/${myAccountInfo.selected_username ? myAccountInfo.selected_username : myAccountInfo.address}`}>
                                    <a href={`/${myAccountInfo.selected_username ? myAccountInfo.selected_username : myAccountInfo.address}`}>
                                        <img src={avatar} style={{ width: 50, borderRadius: 50 }} alt="" /></a>
                                </Link>


                                <a href='https://empow.io' target="_blank" rel="noopener noreferrer"><img src="/img/Group 8341.png" style={{ width: 30 }} alt="" /></a>
                            </div>

                        </div>}
                        {this.state.showNoti && this.renderNoti()}
                    </div>
                </div>

                {(!isAddressActived && myAddress) && this.renderModelActiveAddress()}
            </header>
        );
    }
};


export default connect(state => ({
}), ({
    setMyAddress,
    setMyAccountInfo,
    setReportTagArray,
    setBlockNumber
}))(Header)