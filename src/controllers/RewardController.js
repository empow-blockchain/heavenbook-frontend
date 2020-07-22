import React, { Component } from 'react'
import { connect } from 'react-redux';
import _ from 'lodash'
import Navbar from '../components/Navbar';
import LanguageService from '../services/LanguageService'
import Utils from '../utils/index'
import ServerAPI from '../ServerAPI'
import { CONTRACT } from '../constants/index'
import {
    setMyAccountInfo,
} from '../reducers/appReducer'
import Link from 'next/link'
import moment from 'moment'
import Avatar from '../assets/images/avatar.svg'

const KeyCodes = {
    comma: 188,
    enter: 13,
};

const delimiters = [KeyCodes.comma, KeyCodes.enter];

class RewardController extends Component {

    constructor(props) {
        super(props);

        this.state = {
            data: [],
            page: 1,
            pageSize: 20,
            photoHeight: 100,
        };
    };

    static getInitialProps({ query }) {
        return { query }
    }

    async componentDidMount() {
        await this.getData(this.state.pageSize, this.state.page, this.props.query.type)
    }

    async componentDidUpdate(pre) {
        if (_.isEqual(pre, this.props)) {
            return;
        }

        await this.getData(this.state.pageSize, this.state.page, this.props.query.type)
    }

    getData = async (pageSize, page, selectedChildMenu = 'Post') => {
        var { myAddress, blockNumber } = this.props
        var { data } = this.state

        var newData = await ServerAPI.getDataRewards(myAddress, selectedChildMenu, page, pageSize)

        if (newData.length === 0 || newData.length < pageSize) {
            this.setState({
                isLoadingMore: false
            })
        } else {
            this.setState({
                isLoadingMore: true
            })
        }

        for (let i = 0; i < newData.length; i++) {
            newData[i].canWithdraw = Utils.calcCanWithdraw(blockNumber, newData[i].realLikeArray, newData[i].lastBlockWithdraw)
            newData[i].index = (page - 1) * pageSize + i
        }

        var listResult = [...data, ...newData]
        if (page === 1) {
            listResult = newData
        }

        this.setState({
            data: listResult,
        })
    }

    onEndReached = async () => {
        var { isLoadingMore, page, pageSize } = this.state
        if (!isLoadingMore) {
            return;
        }
        await this.getData(pageSize, page + 1, this.props.query.type)
        this.setState({
            page: page + 1
        })
    }

    // updateMyAccountInfo = () => {
    //     var { myAddress, myAccountInfo } = this.props
    //     let count = 1;
    //     let interval = setInterval(() => {
    //         ServerAPI.getAddress(myAddress).then(res => {
    //             if (res.balance !== myAccountInfo.balance) {
    //                 this.props.setMyAccountInfo(res)
    //                 clearInterval(interval)
    //             }
    //         })

    //         if (count > 5) {
    //             clearInterval(interval)
    //         }

    //         count++
    //     }, 1000)
    // }

    onPressWithdraw = (item) => {
        var { data } = this.state

        data[item.index].canWithdraw = 0

        this.setState({
            data
        })

        const tx = window.empow.callABI(CONTRACT, "likeWithdraw", [item.postId])
        Utils.sendAction(tx, 200000).then(res => {
            //  this.updateMyAccountInfo()
        }).catch(err => {
        })
    }

    onPressWithdrawComment = (item) => {
        var { data } = this.state

        data[item.index].canWithdraw = 0

        this.setState({
            data
        })

        const tx = window.empow.callABI(CONTRACT, "likeCommentWithdraw", [item.postId, item.commentId.toString()])
        Utils.sendAction(tx, 200000).then(res => {
            // this.updateMyAccountInfo()
        }).catch(err => {

        })
    }

    renderCommentItem(comment) {
        var address = comment.address || {};
        var profile = address.profile || {}
        var avatar = profile.avatar120 ? profile.avatar120 : (profile.avatar ? profile.avatar : Avatar)
        return (
            <div className="box-child">
                <div className="row">
                    <div className="col-12 col-lg-8">
                        <div className="top-user">
                            <figure>
                                <img src={avatar} style={{ width: 50, height: 50, borderRadius: 30 }} alt="" />
                            </figure>
                            <div className="info-post">
                                <span className="name-user">
                                    {address.selected_username ? address.selected_username : (address.address ? address.address.substr(0, 20) + '...' : '...')}
                                </span>
                                <span className="comment-hour">
                                    {moment(comment.time / 10 ** 6).fromNow()}
                                </span>
                                <p className="description">
                                    {comment.content}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="col-12 col-lg-4">
                        <div className="result-box box-shadow-2">
                            <p>
                                <span>{LanguageService.changeLanguage('Total_Reward')}</span>
                                <span>{Utils.formatCurrency(comment.realLike, 2)} EM</span>
                            </p>
                            <p>
                                <span>{LanguageService.changeLanguage('Can_Withdraw')}</span>
                                <span>{Utils.formatCurrency(comment.canWithdraw, 2)} EM</span>
                            </p>
                            <button onClick={() => this.onPressWithdrawComment(comment)} className="btn btn-reward">{LanguageService.changeLanguage('Withdraw')}</button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    renderPostItem(post) {
        return (
            <div className="col-12 col-md-4">
                <div className="box-confirm box-shadow-2">
                    <span className="name">
                        {post.name.name}
                    </span>
                    <span className="date">
                        ({Utils.convertDate(post.age.birth)} - {Utils.convertDate(post.age.loss)})
                    </span>
                    <img src={post.photos[0]["670"]} alt="" style={{ height: 400, borderRadius: 28 }} />
                    <Link href="/post/[postId]" as={`/post/${post.postId}`}><a href={`/post/${post.postId}`} className="seemore">{LanguageService.changeLanguage('See_more')}</a></Link>
                </div>
                <div className="result-box box-shadow-2">
                    <p>
                        <span>{LanguageService.changeLanguage('Total_Reward')}</span>
                        <span>{Utils.formatCurrency(post.realLike, 2)} EM</span>
                    </p>
                    <p>
                        <span>{LanguageService.changeLanguage('Can_Withdraw')}</span>
                        <span>{Utils.formatCurrency(post.canWithdraw, 2)} EM</span>
                    </p>
                    <button onClick={() => this.onPressWithdraw(post)} className="btn btn-reward">{LanguageService.changeLanguage('Withdraw')}</button>
                </div>
            </div>
        )
    }

    renderComments() {
        var { data } = this.state
        data = data.filter(x => x.canWithdraw > 0)
        return (
            <div className="col-12 col-xl-10">
                <div className="box-shadow-2 box-comment">
                    {data.length > 0 && data.map((value, index) => {
                        return this.renderCommentItem(value)
                    })}
                </div>
            </div>
        )
    }

    renderPosts() {
        var { data } = this.state
        data = data.filter(x => x.canWithdraw > 0 && !x.deleted)
        return (
            <div className="col-12 col-xl-10">
                <div className="row">
                    {data.length > 0 && data.map((value, index) => {
                        return this.renderPostItem(value)
                    })}

                </div>
            </div>
        )
    }

    render() {

        return (

            <div className="container">
                <div className="row">
                    <Navbar></Navbar>
                    {this.props.query.type === "Post" && this.renderPosts()}
                    {this.props.query.type === "Comment" && this.renderComments()}
                </div>
            </div>
        );
    }
}

export default connect(state => ({
    myAddress: state.app.myAddress,
    myAccountInfo: state.app.myAccountInfo,
    reportTagArray: state.app.reportTagArray,
    blockNumber: state.app.blockNumber
}), ({
    setMyAccountInfo
}))(RewardController)