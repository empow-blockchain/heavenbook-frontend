import React, { Component } from 'react'
import { connect } from 'react-redux';
import $ from 'jquery'
import LanguageService from '../services/LanguageService'
import Link from 'next/link'

class Navbar extends Component {
    constructor(props) {
        super(props);

        this.state = {

        }
    };

    componentDidMount() {
        $('.parent li.nav-item').on('click', function () {
            $(this).toggleClass('active')
        })
    }

    render() {
        return (
            <div className="col-2">
                <ul className="parent">
                    <li className="nav-item"><a href="/"><img src="/img/Group 8343.png" />{LanguageService.changeLanguage('Home')}</a></li>
                    <li className="nav-item"><a href="#"><img src="/img/Group 8344.png" />{LanguageService.changeLanguage('Trending')}</a></li>
                    <li className="nav-item"><a href="#"><img src="/img/new.png" />{LanguageService.changeLanguage('Newest')}</a></li>
                    <li className="nav-item"><a className="with-arrow" href="#"><img src="/img/check.png" />{LanguageService.changeLanguage('Censorship')}</a>
                        <ul className="submenu">
                            <Link href="/verifier/[type]" as="/verifier/Update">
                                <li>
                                    <a href="/verifier/Update">
                                        <img src="/img/Group 8389@2x.png" />{LanguageService.changeLanguage('Update')}
                                    </a>
                                </li>
                            </Link>
                            <Link href="/verifier/[type]" as="/verifier/Smear">
                                <li>
                                    <a href="/verifier/Smear">
                                        <img src="/img/Group 8395@2x.png" />{LanguageService.changeLanguage('Smear')}
                                    </a>
                                </li>
                            </Link>
                        </ul>
                    </li>
                    <li className="nav-item"><a className="with-arrow" href="#"><img src="/img/rewards.png" />{LanguageService.changeLanguage('Rewards')} </a>
                        <ul className="submenu">
                            <Link href="/reward/[type]" as="/reward/Post">
                                <li>
                                    <a href="/reward/Post">
                                        <img src="/img/Group 8410@2x.png" />
                                        {LanguageService.changeLanguage('Posts')}
                                    </a>
                                </li>
                            </Link>

                            <Link href="/reward/[type]" as="/reward/Comment">
                                <li>
                                    <a href="/reward/Comment">
                                        <img src="/img/Group 8408@2x.png" />
                                        {LanguageService.changeLanguage('Comments')}
                                    </a>
                                </li>
                            </Link>
                        </ul>
                    </li>
                    <li className="nav-item"><a href="#"><img src="/img/list.png" />{LanguageService.changeLanguage('About_us')}</a></li>
                </ul>

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
        );
    }
};


export default connect(state => ({
    tagTrending: state.app.tagTrending,
}), ({
}))(Navbar)