import React, { Component } from 'react'
import { connect } from 'react-redux';
import _ from 'lodash'
import LanguageService from '../services/LanguageService'
import ServerAPI from '../ServerAPI'
import Utils from '../utils/index'
import InfoPeople from '../components/InfoPeople'
import Router from 'next/router'
import Navbar from '../components/Navbar';
import Post from '../components/Post'
import Link from 'next/link'

class PostDetailController extends Component {

    constructor(props) {
        super(props);
        this.state = {
            showUpdate: false
        };
    };

    static async getInitialProps(props) {
        let result = {
            query: props.query
        }

        try {
            const postDetail = await ServerAPI.getPostDetailByPostId(props.query.postId, props.myAddress)
            result.postDetail = postDetail
            return result
        } catch (err) {
            result.postDetail = false
            return result
        }

    }

    async componentDidMount() {
        var { postDetail } = this.props
        if (postDetail) {
            var obj = {
                achievements: postDetail.achievements,
                age: postDetail.age,
                education: postDetail.education,
                name: postDetail.name,
                photos: postDetail.photos,
                preface: postDetail.preface,
                reason: postDetail.reason,
                relationship: postDetail.relationship,
                religion: postDetail.religion,
                postId: postDetail.postId,
            }

            const dataRight = await this.getdataRight()

            this.setState({
                postDetail: obj,
                dataRight
            })
        } else {
            Router.push("/")
        }
    }

    getdataRight = async () => {
        var { myAddress } = this.props
        var data = await ServerAPI.getNewFeed(myAddress, 'all', 10, 1)
        return data
    }

    render() {
        var { showUpdate, postDetail, dataRight } = this.state
        if (!postDetail) {
            return <div></div>
        }
        return (
            <div className="container">
                <div className="row">
                    <Navbar></Navbar>
                    <div id="home" className="col-10">
                        {showUpdate && <div className="row">
                            <div className="col-12">
                                <InfoPeople postDetail={postDetail}></InfoPeople>
                            </div>
                        </div>}
                        <div className="row orion">
                            <div className="col-9">
                                <Post post={postDetail} isUpdate={true} onToggleUpdate={() => this.setState({ showUpdate: !this.state.showUpdate })}></Post>
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
        )
    }
}

export default connect(state => ({
    myAddress: state.app.myAddress,
    myAccountInfo: state.app.myAccountInfo,
}), ({
}))(PostDetailController)