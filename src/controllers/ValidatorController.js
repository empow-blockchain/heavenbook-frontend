import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux';
import Navbar from '../components/Navbar';
import LanguageService from '../services/LanguageService'
import ServerAPI from '../ServerAPI';
import Utils from '../utils/index'
import Link from 'next/link'
import _ from 'lodash'
import { EMSCAN } from '../constants/index'
import NotFoundIcon from '../assets/images/not-found-icon.png'

const STAKING_REQUIRE = 10000

class ValidatorController extends Component {

    constructor(props) {
        super(props);

        this.state = {
            data: [],
            page: 1,
            pageSize: 20,
            canVerify: false,
        };
    };

    static getInitialProps({ query }) {
        return { query }
    }

    async componentDidMount() {
        if (!this.props.myAddress) {
            return
        }
        this.getStaking()
        if (this.props.query.type === "Update") {
            this.getDataUpdate(this.state.page, this.state.pageSize)
        } else {
            this.getDataSmear(this.state.page, this.state.pageSize)
        }
    }

    async componentDidUpdate(pre) {
        if (_.isEqual(pre, this.props)) {
            return;
        }
        this.getStaking()
        if (this.props.query.type === "Update") {
            this.getDataUpdate(this.state.page, this.state.pageSize)
        } else {
            this.getDataSmear(this.state.page, this.state.pageSize)
        }
    }

    getStaking = () => {
        if (!this.props.myAddress) return;

        ServerAPI.getStaking(this.props.myAddress).then(staking => {
            if (staking >= STAKING_REQUIRE) {
                this.setState({
                    canVerify: true
                })
            }
        })
    }


    getDataUpdate = async (page, pageSize) => {
        var data = await ServerAPI.getPostReport("approved", this.props.myAddress, page, pageSize)
        this.setState({
            data
        })
    }

    getDataSmear = async (page, pageSize) => {
        var data = await ServerAPI.getPostReport("smear", this.props.myAddress, page, pageSize)
        this.setState({
            data
        })
    }

    renderItem(value) {
        return (
            <div className="col-12 col-md-4">
                <div className="box-confirm box-shadow-2">
                    <span className="name">
                        {value.name.name}
                    </span>
                    <span className="date">
                        {Utils.convertDate(value.age.birth)} - {Utils.convertDate(value.age.loss)}
                    </span>
                    <div style={{ backgroundImage: `url(${value.photos[0]["670"]})`, height: 400, borderRadius: 28 }}>
                    </div>

                    <Link href="/verifier-detail/[postId]" as={`/verifier-detail/${value.postId}`}>
                        <a href={`/verifier-detail/${value.postId}`} className="seemore">
                            {LanguageService.changeLanguage('See_more')}
                        </a>
                    </Link>


                </div>
            </div>
        )
    }


    render() {
        var { data, canVerify } = this.state
        return (
            <div className="container">
                <div className="row">
                    <Navbar></Navbar>

                    {canVerify
                        ?
                        <Fragment>

                            <div className="col-12 col-xl-10">
                                <div className="note">
                                    <p>You will be the one who validates the posts reported by the community<br></br>
                                            If you confirm the same idea with the majority you will receive a reward <b>(10 EM/post)</b><br></br>
                                            Let's eliminate bad content together</p>
                                </div>
                                <div className="row">
                                    {data.length > 0 && data.map((value, index) => {
                                        return this.renderItem(value)
                                    })}

                                </div>

                                {data.length === 0 && <div className="not-found">
                                    <img src="/img/not-found-icon.png" alt='photos'></img>
                                    <p className="text">There are no more post to validate</p>
                                </div>}
                            </div>

                        </Fragment>
                        :
                        <Fragment>
                            <Fragment>
                                <div className="col-12 col-xl-10">
                                    <div className="stake-note">
                                        <p>To become a verifier you need to stake <b>{STAKING_REQUIRE}</b> EM</p>
                                        <a className="btn-general-2" href={`${EMSCAN}/wallet/stake`} target="_blank">Stake Now</a>
                                    </div>
                                </div>
                            </Fragment>
                        </Fragment>
                    }

                </div>
            </div>
        )


    }
}

export default connect(state => ({
    myAddress: state.app.myAddress
}), ({
}))(ValidatorController)