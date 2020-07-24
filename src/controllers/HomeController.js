import React, { Component } from 'react'
import { connect } from 'react-redux';
import _ from 'lodash'
import Navbar from '../components/Navbar';
import Post from '../components/Post'
import InfoPeople from '../components/InfoPeople';
import LanguageService from '../services/LanguageService'
import ServerAPI from '../ServerAPI';
import Utils from '../utils/index'
import Alert from 'react-s-alert'
import Link from 'next/link'

const KeyCodes = {
    comma: 188,
    enter: 13,
};

const delimiters = [KeyCodes.comma, KeyCodes.enter];

class HomeController extends Component {

    constructor(props) {
        super(props);

        this.state = {
            data: [],
            showAdd: false,
            activeOptionChild: false,
            page: 1,
            pageSize: 10,
            isLoadMore: true,
            dataRight: []
        };
    };

    async componentDidMount() {
        document.addEventListener('scroll', this.trackScrolling);
        const data = await this.getNewFeed(this.state.page, this.state.pageSize)
        this.setState({ data })

        const dataRight = await this.getdataRight()
        this.setState({ dataRight })
    }

    componentWillUnmount() {
        document.removeEventListener('scroll', this.trackScrolling);
    }

    async componentDidUpdate(pre) {
        if (_.isEqual(pre, this.props)) {
            return;
        }

        if (this.props.typeNewFeed !== pre.typeNewFeed || this.props.myAddress !== pre.myAddress) {
            if (pre.typeNewFeed !== this.props.typeNewFeed) {
                this.setState({
                    page: 1,
                    isLoadMore: true,
                    data: []
                })
            }

            const data = await this.getNewFeed(this.state.page, this.state.pageSize)
            this.setState({ data })
        }
    }

    isBottom(el) {
        return Math.round(el.getBoundingClientRect().bottom) === window.innerHeight
    }

    trackScrolling = async () => {
        if (!this.state.isLoadMore) {
            return;
        }

        const wrappedElement = document.getElementById('home');
        if (this.isBottom(wrappedElement)) {
            console.log('header bottom reached');
            this.onLoadMore()
        }
    };

    onLoadMore = async () => {
        var newData = await this.getNewFeed(this.state.page + 1, this.state.pageSize)
        newData = [...this.state.data, ...newData]

        this.setState({
            page: this.state.page + 1,
            data: newData
        })
    }

    getNewFeed = async (page, pageSize) => {
        var { myAddress, typeNewFeed } = this.props
        var newData = await ServerAPI.getNewFeed(myAddress, typeNewFeed, pageSize, page)

        if (newData.length === 0 || newData.length < pageSize) {
            this.setState({
                isLoadMore: false
            })
        } else {
            this.setState({
                isLoadMore: true
            })
        }

        return newData
    }

    getdataRight = async () => {
        var { myAddress } = this.props
        var data = await ServerAPI.getNewFeed(myAddress, 'all', 10, 1)
        return data
    }

    onPostSuccess = (post) => {
        var { data } = this.state
        data.unshift(post)
        this.setState({
            data,
            showAdd: false
        })
    }

    render() {
        var { data, showAdd, dataRight } = this.state
        return (

            <div className="container">
                <div className="row">
                    <Navbar></Navbar>
                    <div id="home" className="col-10">
                        {showAdd && <div className="row">
                            <div className="col-12">
                                <InfoPeople onPostSuccess={this.onPostSuccess}></InfoPeople>
                            </div>
                        </div>}
                        <div className="row orion">
                            <div className="col-9">
                                {!showAdd && <div className="add-status" onClick={() => { this.setState({ showAdd: !showAdd }) }}>
                                    <p>{LanguageService.changeLanguage('Honor_those_who_have_lost_here')}...</p>
                                    <button>{LanguageService.changeLanguage('Add')} &gt;</button>
                                </div>}
                                {data.length > 0 && data.map((value, index) => {
                                    if (value.photos && value.photos.length > 0) {
                                        return <Post post={value}></Post>
                                    }
                                })}
                            </div>

                            <div className="col-3 sidebar-right">
                                <div className="recent-memorial-posts">
                                    <h2 className="title-header">
                                        {LanguageService.changeLanguage('Recent_memorials')}
                                    </h2>
                                    <div className="list-posts-recent">
                                        {dataRight.map((value, index) => {
                                            if (value.photos && value.photos.length > 0) {
                                                return (
                                                    <Link href="/post/[postId]" as={`/post/${value.postId}`}>
                                                        <a href={`/post/${value.postId}`}>
                                                            <div className="top-user">
                                                                <div className="waper-avatar" style={{ backgroundImage: `url(${value.photos[0]["670"]})`, marginRight: 10 }}>

                                                                </div>
                                                                <div className="info-post">
                                                                    <span className="name-user">
                                                                        {value.name.name}
                                                                    </span>
                                                                    <span className="date">{Utils.convertDate(value.age.birth)} - {Utils.convertDate(value.age.loss)}</span>
                                                                </div>
                                                            </div>
                                                        </a>
                                                    </Link>
                                                )
                                            }
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default connect(state => ({
    myAddress: state.app.myAddress,
    myAccountInfo: state.app.myAccountInfo,
    reportTagArray: state.app.reportTagArray,
    typeNewFeed: state.app.typeNewFeed
}), ({
}))(HomeController)