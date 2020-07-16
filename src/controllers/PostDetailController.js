import React, { Component } from 'react'
import { connect } from 'react-redux';
import _ from 'lodash'
import LanguageService from '../services/LanguageService'
import ServerAPI from '../ServerAPI'
import Utils from '../utils/index'
import InfoPeople from '../components/InfoPeople'

class PostDetailController extends Component {

    constructor(props) {
        super(props);
        this.state = {
        };
    };

    static async getInitialProps(props) {
        let result = {
            query: props.query
        }

        const postDetail = await ServerAPI.getPostDetailByPostId(props.query.postId, props.myAddress)
        result.postDetail = postDetail

        return result
    }

    componentDidMount() {
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
                postId: postDetail.postId
            }

            this.setState({
                postDetail: obj
            })
        }
    }

    renderInfoClient() {
        var { postDetail } = this.props
        return (
            <div className="col-12 col-lg-3 col-xl-3">
                <div className="box-shadow-2 profile profile-client">
                    <div className="top-user">
                        <figure>
                            <img src={postDetail.photos[0]["670"]} alt="" />
                        </figure>
                        <div className="info-post">
                            <span className="name-user">{postDetail.name.name}</span>
                            <span className="date">{new Date(postDetail.age.birth).getFullYear()} - {new Date(postDetail.age.loss).getFullYear()}</span>
                        </div>
                    </div>
                    <div className="btn-save">{LanguageService.changeLanguage('Follow')}</div>
                    <p className="box-shadow-1">
                        {postDetail.preface}
                    </p>
                    <div className="box badges">
                        <span className="badges-grey">
                            {postDetail.religion}
                        </span>
                        {postDetail.education[0].name && <span className="badges-grey">
                            {postDetail.education[0].name}
                        </span>}
                        {postDetail.achievements[0].achievement && <span className="badges-grey">
                            {postDetail.achievements[0].achievement}
                        </span>}
                        {postDetail.relationship.couple && <span className="badges-grey">
                            {LanguageService.changeLanguage('Married')}
                        </span>}
                        {postDetail.achievements[0].field && <span className="badges-grey">
                            {postDetail.achievements[0].field}
                        </span>}
                    </div>
                    <ul>
                        {/* <li>
                            {LanguageService.changeLanguage('Home_town')}
                            <span>Từ sơn bắc ninh</span>
                        </li> */}
                        <li>
                            {LanguageService.changeLanguage('Burial_place')}
                            <span>{postDetail.reason.place}</span>
                        </li>
                        <li>
                            {LanguageService.changeLanguage('Downtime')}
                            <span>{Utils.convertDate(postDetail.age.loss)}</span>
                        </li>
                    </ul>
                    <div className="button-update">
                        <a href="#" className="btn btn-update">
                            <img src="/img/btnupdate.png" alt="" />
                            {LanguageService.changeLanguage('Update')}
                        </a>
                    </div>
                </div>
                <div className="social">
                    <span>
                        <img src="/img/ggplay.png" alt="" />
                Google Play
              </span>
                    <span>
                        <img src="/img/appstore.png" alt="" />
                Google Play
              </span>
                    <span>
                        <img src="/img/telegram.png" alt="" />
                Google Play
              </span>
                    <span>
                        <img src="/img/fb.png" alt="" />
                Google Play
              </span>
                    <span>
                        <img src="/img/twitter.png" alt="" />
                Google Play
              </span>
                </div>
            </div>
        )
    }

    render() {
        var { postDetail } = this.state
        return (
            <div className="container">
                <div className="row">
                    {this.renderInfoClient()}
                    <div class="col-9">
                        {postDetail && <InfoPeople postDetail={postDetail}></InfoPeople>}
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