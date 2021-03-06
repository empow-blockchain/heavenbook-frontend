import React, { Component } from 'react'
import _ from 'lodash'
import { connect } from 'react-redux';
import Navbar from '../components/Navbar';
import Avatar from '../assets/images/avatar.svg'
import LanguageService from '../services/LanguageService'
import ServerAPI from '../ServerAPI'
import Utils from '../utils/index'
import Alert from 'react-s-alert';
import Link from 'next/link'

class SearchController extends Component {

    constructor(props) {
        super(props);

        this.state = {
            key: this.getKey(),
            posts: [],
            addresses: [],
        };
    };

    static getInitialProps({ query }) {
        return { query }
    }

    async componentDidUpdate(pre) {
        if (_.isEqual(pre, this.props)) {
            return;
        }


        this.getData(this.getKey())
    }

    async componentDidMount() {
        this.getData(this.getKey())
    }

    getData = async (key) => {

        if (!key || key === "" || key === null) {
            return;
        }

        var addresses = await ServerAPI.getAddressByKey(key)
        var posts = await ServerAPI.getPostByKey(key, this.props.myAddress)

        var index = 'All';

        if (posts.length > 0) {
            index = 'Characters';
        }

        if (addresses.length > 0) {
            index = 'People';
        }

        this.setState({
            addresses,
            posts,
            index
        })
    }

    getKey() {
        if (this.props.query && this.props.query.query) {
            return this.props.query.query
        }

        return '';
    }

    onClickmenu = (index) => {
        this.setState({
            index: index
        })
    }


    onFollowPost = async (postId, index) => {
        var { myAddress } = this.props
        var result = await ServerAPI.onFollowPost(myAddress, postId)
        if (result.success) {
            var { posts } = this.state
            posts[index].isFollowed = true
            this.setState({
                posts
            })
        } else {
            Alert.error('Follow error')
        }
    }

    onUnfollowPost = async (postId, index) => {
        var { myAddress } = this.props
        var result = await ServerAPI.onUnfollowPost(myAddress, postId)
        if (result.success) {
            var { posts } = this.state
            posts[index].isFollowed = false
            this.setState({
                posts
            })
        } else {
            Alert.error('Unfollow error')
        }
    }

    renderPost(post, index) {
        return (
            <div id="Characters" className="tabcontent">
                <div className="middle  box-shadow-1">

                    <Link href="/post/[postId]" as={`/post/${post.postId}`}>
                        <a href={`/post/${post.postId}`}>
                            <div className="top-user">
                                <figure>
                                    <img src={post.photos[0]["670"]} alt="" style={{ width: 50, borderRadius: 25, height: 50 }} />
                                </figure>
                                <div className="info-post">
                                    <span className="name-user">
                                        {post.name.name}
                                    </span>
                                    <span className="date">{Utils.convertDate(post.age.birth)} - {Utils.convertDate(post.age.loss)}</span>
                                </div>
                            </div>
                        </a>
                    </Link>

                    {post.isFollowed && <button className="btn btn-save" onClick={() => this.onUnfollowPost(post.postId, index)}>{LanguageService.changeLanguage('Unfollow')}</button>}
                    {!post.isFollowed && <button className="btn btn-save" onClick={() => this.onFollowPost(post.postId, index)}>{LanguageService.changeLanguage('Follow')}</button>}
                </div>
            </div>
        )
    }

    renderAddress(address) {
        var pro5 = address.profile || {};
        var ava = pro5.avatar50 || pro5.avatar || Avatar
        return (
            <div id="Characters" className="tabcontent">
                <div className="middle  box-shadow-1">
                    <div className="top-user">
                        <figure>
                            <img src={ava} alt="" style={{ width: 50, borderRadius: 25, height: 50 }} />
                        </figure>
                        <div className="info-post">
                            <span className="name-user">
                                {address.selected_username ? address.selected_username : address.address.substring(0, 15) + '...'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    render() {
        var { index, posts, addresses } = this.state
        return (
            <div className="container">
                <div className="row">
                    <Navbar></Navbar>
                    <div className="col-12 col-xl-10 search">
                        <div className="tab box-shadow-1">
                            <button className={`tablinks ${index === 'All' ? 'active' : ''}`} onClick={() => this.onClickmenu('All')}>{LanguageService.changeLanguage('All')}</button>
                            <button className={`tablinks ${index === 'Characters' ? 'active' : ''}`} onClick={() => this.onClickmenu('Characters')}>{LanguageService.changeLanguage('Characters')}</button>
                            <button className={`tablinks ${index === 'People' ? 'active' : ''}`} onClick={() => this.onClickmenu('People')}>{LanguageService.changeLanguage('People')}</button>
                        </div>

                        {index === 'All' && <div>
                            {posts.length > 0 && posts.map((value, index) => {
                                return this.renderPost(value, index)
                            })}
                            {addresses.length > 0 && addresses.map((value, index) => {
                                return this.renderAddress(value)
                            })}
                        </div>}

                        {index === 'Characters' && posts.length > 0 && posts.map((value, index) => {
                            return this.renderPost(value, index)
                        })}

                        {index === 'People' && addresses.length > 0 && addresses.map((value, index) => {
                            return this.renderAddress(value)
                        })}
                    </div>
                </div>
            </div>
        )
    }
}

export default connect(state => ({
    myAddress: state.app.myAddress,
}), ({
}))(SearchController)