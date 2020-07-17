import React, { Component } from 'react'
import { connect } from 'react-redux';
import _ from 'lodash'
import Post from '../components/Post'
import LanguageService from '../services/LanguageService'
import ServerAPI from '../ServerAPI';
import Utils from '../utils/index'
import { EMSCAN, EMPOW } from '../constants/index'
import Avatar from '../assets/images/avatar.svg'
import Router from 'next/router'
class AccountController extends Component {

    constructor(props) {
        super(props);
        this.state = {
            data: [],
            pageSize: 5,
            page: 1,
            isLoadMore: true,
            isMyAccount: false,
            accountInfo: {},
        };
    };

    static getInitialProps({ query }) {
        return { query }
    }

    async componentDidMount() {
        this.getData();
        this.checkIsMyAccount()
    }

    async componentDidUpdate(pre) {
        if (_.isEqual(pre, this.props)) {
            return;
        }
        this.getData()
        this.checkIsMyAccount()
    }

    checkIsMyAccount = () => {
        if (!this.props.myAccountInfo) return;

        var addressAccount = this.props.query.account
        if (addressAccount === this.props.myAddress || addressAccount === this.props.myAccountInfo.selected_username) {
            this.setState({
                isMyAccount: true
            })
        }
    }

    getData = () => {
        var addressAccount = this.props.query.account
        ServerAPI.getAddress(addressAccount).then(accountInfo => {
            this.setState({
                addressAccount,
                accountInfo
            })

            this.getPost(accountInfo.address, this.state.pageSize, this.state.page)
        }).catch(err => {
            ServerAPI.getAddressByUsername(addressAccount).then(accountInfo => {
                this.setState({
                    addressAccount,
                    accountInfo
                })

                this.getPost(accountInfo.address, this.state.pageSize, this.state.page)
            }).catch(err => {
                Router.push("/")
            })
        })
    }


    getPost(address, pageSize, page) {
        ServerAPI.getMyPost(address, this.props.myAddress, pageSize, page).then(newData => {
            if (newData.length === 0 || newData.length < pageSize) {
                this.setState({
                    isLoadMore: false
                })
            } else {
                this.setState({
                    isLoadMore: true
                })
            }

            var listResult = [...this.state.data, ...newData]
            if (page === 1) {
                listResult = newData
            }

            this.setState({
                data: listResult,
            })
        });
    }

    renderInfo() {
        var { addressAccount, accountInfo, isMyAccount } = this.state
        var profile = accountInfo.profile || {}
        var avatar = profile.avatar120 ? profile.avatar120 : (profile.avatar ? profile.avatar : Avatar)
        return (
            <div className="col-12 col-lg-3 col-xl-3">
                <div className="box-shadow-2 profile">
                    <div className="top-user">
                        <figure>
                            <img src={avatar} style={{ width: 50, height: 50, borderRadius: 8 }} alt="" />
                        </figure>
                        <div className="info-post">
                            <span className="name-user">
                                {accountInfo.selected_username ? accountInfo.selected_username : (addressAccount ? addressAccount.substring(0, 10) + '...' : '...')}
                            </span>
                            <span className="date">{Utils.formatCurrency(accountInfo.total_post_reward)} EM</span>
                        </div>
                    </div>
                    {isMyAccount && <div className="group-em">
                        <button className="rename">
                            <a href={`${EMPOW}/setting`} target="_blank" style={{ color: 'white' }}>
                                <span>{LanguageService.changeLanguage('Rename')}</span>
                                <img src="/img/Group 8341.png" alt="" />
                            </a>
                        </button>
                        <button className="stack-em">
                            <a href={`${EMSCAN}/wallet/stake`} target="_blank" style={{ color: 'white' }}>
                                <span>{LanguageService.changeLanguage('Stake')} EM</span>
                                <img src="/img/Group 8341.png" alt="" />
                            </a>

                        </button>
                    </div>}
                </div>
            </div>
        )
    }

    render() {
        var { data } = this.state
        return (
            <div className="container">
                <div className="row">
                    {this.renderInfo()}
                    <div class="col-12 col-lg-7">
                        {data.length > 0 && data.map((value, index) => {
                            if (value.photos && value.photos.length > 0) {
                                return <Post post={value}></Post>
                            }
                        })}
                    </div>
                </div>
            </div>
        )
    }
}

export default connect(state => ({
    myAddress: state.app.myAddress,
    myAccountInfo: state.app.myAccountInfo,
}), ({
}))(AccountController)