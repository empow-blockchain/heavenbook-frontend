import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux';
import Navbar from '../components/Navbar';
import LanguageService from '../services/LanguageService'
import ServerAPI from '../ServerAPI';
import Post from '../components/Post'
import Utils from '../utils/index'
import { CONTRACT } from '../constants/index'
import Alert from 'react-s-alert';

class ValidatorController extends Component {

    constructor(props) {
        super(props);

        this.state = {
        };
    };

    static getInitialProps({ query }) {
        return { query }
    }

    async componentDidMount() {
        var newPost = await ServerAPI.getPostVerifierDetailByPostId(this.props.query.postId)
        var oldPost = await ServerAPI.getPostVerifierDetailByPostId(newPost.updateId)
        this.setState({
            newPost,
            oldPost
        })
    }

    onValidatePost(status) {
        const tx = window.empow.callABI(CONTRACT, "verifyPost", [this.props.myAddress, this.props.query.postId, status])

        Utils.sendAction(tx).then(res => {
        }).catch(error => {
            Alert.error(error)
        })
    }

    renderConfirm() {
        return (
            <div className="notice">
                <p>Bạn có đồng ý với chỉnh sửa của bài viết này hay không ?</p>
                <div className="group-confirm">
                    <button className="btn btn-confirm-person" onClick={() => this.onValidatePost(true)}>Yes</button>
                    <button className="btn btn-confirm-person" onClick={() => this.onValidatePost(false)}>No</button>
                </div>
            </div>
        )
    }

    render() {
        var { newPost, oldPost } = this.state
        return (
            <div className="container">
                <div className="row">
                    <Navbar></Navbar>
                    <div className="col-12 col-lg-10 confirm-person">
                        {oldPost && <Post post={oldPost} route={"Validator"}></Post>}
                        {newPost && <Post post={newPost} route={"Validator"}></Post>}
                        {this.renderConfirm()}
                    </div>
                </div>
            </div>
        )


    }
}

export default connect(state => ({
    myAddress: state.app.myAddress
}), ({
}))(ValidatorController)